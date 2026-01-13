import { Injectable, signal, inject, Injector } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { StateService } from './state.service';
import { app } from '../firebase.config';
import { 
  getAuth,
  Auth, 
  User, 
  UserCredential, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult 
} from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private injector: Injector = inject(Injector);
  private _stateService?: StateService;
  private get stateService(): StateService {
    if (!this._stateService) {
      this._stateService = this.injector.get(StateService);
    }
    return this._stateService!;
  }

  private auth: Auth;
  currentUser = signal<User | null>(null);
  
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private confirmationResult: ConfirmationResult | null = null;

  constructor() {
    this.auth = getAuth(app);
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.set(user);
       if (user) {
          const appUser = this.stateService.users().find(u => u.id === user.uid);
          if (appUser?.isBlacklisted) {
              console.warn('Blacklisted user detected. Forcing logout.');
              this.logout();
          }
      }
    });
  }

  setupRecaptcha(container: HTMLElement) {
    if (!this.recaptchaVerifier) {
      // FIX: Changed the RecaptchaVerifier constructor signature. Some Firebase v9 SDK versions
      // expect the `auth` object as the third argument. This resolves the `appVerificationDisabledForTesting` error.
      this.recaptchaVerifier = new RecaptchaVerifier(container, {
        'size': 'invisible',
        'callback': () => { /* reCAPTCHA solved, allows signInWithPhoneNumber */ }
      }, this.auth);
    }
  }

  googleLogin(): Observable<UserCredential> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider));
  }

  emailSignUp(email: string, password: string): Observable<UserCredential> {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  emailLogin(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  sendOtp(mobileNumber: string): Observable<void> {
    if (!this.recaptchaVerifier) {
      return throwError(() => ({ code: 'auth/recaptcha-not-initialized' }));
    }
    const phoneNumber = '+91' + mobileNumber;
    return from(
      signInWithPhoneNumber(this.auth, phoneNumber, this.recaptchaVerifier)
        .then(confirmationResult => {
          this.confirmationResult = confirmationResult;
        })
    );
  }

  verifyOtp(otp: string): Observable<UserCredential> {
    if (!this.confirmationResult) {
        return throwError(() => ({ code: 'auth/no-confirmation-result' }));
    }
    return from(this.confirmationResult.confirm(otp));
  }

  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    return !!user && !!user.email && environment.adminEmails.includes(user.email);
  }
}