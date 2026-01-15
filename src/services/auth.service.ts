import { Injectable, signal } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { environment } from '../environments/environment';
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
  ConfirmationResult,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth;
  currentUser = signal<User | null>(null);
  
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private confirmationResult: ConfirmationResult | null = null;

  constructor() {
    this.auth = getAuth(app);
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.set(user);
    });
  }

  setupRecaptcha(container: HTMLElement) {
    if (!this.recaptchaVerifier) {
      // ✅ FIX: 'this.auth' must be the FIRST argument
      this.recaptchaVerifier = new RecaptchaVerifier(this.auth, container, {
        'size': 'invisible',
        'callback': () => { /* reCAPTCHA solved */ }
      });
    }
  }

  googleLogin(): Observable<UserCredential> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider));
  }

  emailSignUp(email: string, password: string): Observable<UserCredential> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password).then(userCredential => {
        sendEmailVerification(userCredential.user);
        return userCredential;
      })
    );
  }

  emailLogin(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  sendPasswordReset(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email));
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
