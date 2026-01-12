import { Injectable, signal, inject, Injector } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { StateService } from './state.service';
import { User as AppUser } from '../models/user.model';

// Mock Firebase User and UserCredential types to avoid breaking dependant components
export interface MockAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
}

export interface MockUserCredential {
  user: MockAuthUser;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Use Injector to lazily inject StateService and break the circular dependency
  // FIX: Explicitly type the injected Injector to resolve type inference issue.
  private injector: Injector = inject(Injector);
  private _stateService?: StateService;
  private get stateService(): StateService {
    if (!this._stateService) {
      this._stateService = this.injector.get(StateService);
    }
    return this._stateService;
  }

  currentUser = signal<MockAuthUser | null>(null);

  constructor() {
    // Defer session restoration to break the circular dependency during instantiation.
    queueMicrotask(() => {
      const storedUserJson = sessionStorage.getItem('crazyBasketUser');
      if (storedUserJson) {
          const appUser: AppUser = JSON.parse(storedUserJson);
          // Verify user still exists and is not blacklisted before logging in
          const userInDb = this.stateService.users().find(u => u.id === appUser.id);
          if (userInDb && !userInDb.isBlacklisted) {
               this.setCurrentUser(userInDb);
          } else {
               sessionStorage.removeItem('crazyBasketUser');
          }
      }
    });
  }

  private setCurrentUser(appUser: AppUser | null) {
      if (appUser) {
          const mockAuthUser: MockAuthUser = {
              uid: appUser.id,
              email: appUser.email,
              displayName: appUser.name,
              photoURL: appUser.photoUrl || null,
              emailVerified: appUser.isVerified,
              phoneNumber: appUser.mobile
          };
          this.currentUser.set(mockAuthUser);
          // Use a specific key for this app's session storage
          sessionStorage.setItem('crazyBasketUser', JSON.stringify(appUser));
      } else {
          this.currentUser.set(null);
          sessionStorage.removeItem('crazyBasketUser');
      }
  }

  googleLogin(): Observable<MockUserCredential> {
    // Simulate logging in with the predefined example user
    const userToLogin = this.stateService.users().find(u => u.email === 'user@example.com');
    if (userToLogin) {
       if (userToLogin.isBlacklisted) {
        return throwError(() => ({ code: 'auth/user-disabled' }));
      }
      this.setCurrentUser(userToLogin);
      return of({ user: this.currentUser()! }).pipe(delay(500));
    }
    return throwError(() => new Error('Default user not found for Google login simulation.'));
  }

  emailSignUp(email: string, password: string): Observable<MockUserCredential> {
    const existingUser = this.stateService.users().find(u => u.email === email);
    if (existingUser) {
      return throwError(() => ({ code: 'auth/email-already-in-use' }));
    }

    const newUser: AppUser = {
        id: `user_${Date.now()}`,
        name: email.split('@')[0],
        email: email,
        mobile: '',
        password: password, // In a real app, this should be hashed
        isVerified: false, // New users must verify email
        walletBalance: 0,
        isBlacklisted: false,
        userType: 'B2C',
        ipAddress: '127.0.0.1',
        deviceId: 'mock_device',
        referralCode: email.substring(0, 4).toUpperCase() + Date.now().toString().slice(-4),
        photoUrl: `https://picsum.photos/seed/${email}/200/200`
    };

    this.stateService.users.update(users => [...users, newUser]);
    // In a real app, you would not log them in here, but send a verification email.
    // For this mock, we log them in to continue the flow. The login check will fail next time.
    this.setCurrentUser(newUser);

    return of({ user: this.currentUser()! }).pipe(delay(500));
  }

  emailLogin(email: string, password: string): Observable<MockUserCredential> {
    const user = this.stateService.users().find(u => u.email === email);
    
    if (user && user.password === password) {
       if (user.isBlacklisted) {
         return throwError(() => ({ code: 'auth/user-disabled' }));
       }
       if (!user.isVerified) {
         return throwError(() => ({ code: 'auth/email-not-verified' }));
       }
      this.setCurrentUser(user);
      return of({ user: this.currentUser()! }).pipe(delay(500));
    }
    
    return throwError(() => ({ code: 'auth/invalid-credential' }));
  }

  sendOtp(mobileNumber: string): Observable<void> {
    console.log(`%c[AUTH MOCK] OTP for ${mobileNumber} is 123456`, 'color: blue; font-weight: bold;');
    return of(undefined).pipe(delay(1000));
  }

  verifyOtp(mobileNumber: string, otp: string): Observable<MockUserCredential> {
    if (otp !== '123456') {
      return throwError(() => ({ code: 'auth/invalid-otp' }));
    }

    let user = this.stateService.users().find(u => u.mobile === mobileNumber);

    if (user) {
      if (user.isBlacklisted) {
        return throwError(() => ({ code: 'auth/user-disabled' }));
      }
    } else {
      // Create new user if they don't exist
      const newUser: AppUser = {
        id: `user_${Date.now()}`,
        name: `User ${mobileNumber.slice(-4)}`,
        email: `${mobileNumber}@crazybasket.mobile`, // Create a placeholder email
        mobile: mobileNumber,
        isVerified: true, // Mobile verification counts as verified
        walletBalance: 0,
        isBlacklisted: false,
        userType: 'B2C',
        ipAddress: '127.0.0.1',
        deviceId: 'mock_device_mobile',
        referralCode: mobileNumber.substring(0, 4).toUpperCase() + Date.now().toString().slice(-4),
        photoUrl: `https://picsum.photos/seed/${mobileNumber}/200/200`
      };
      this.stateService.users.update(users => [...users, newUser]);
      user = newUser;
    }

    this.setCurrentUser(user);
    return of({ user: this.currentUser()! }).pipe(delay(500));
  }

  logout(): Observable<void> {
    this.setCurrentUser(null);
    return of(undefined).pipe(delay(200));
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    return !!user && !!user.email && environment.adminEmails.includes(user.email);
  }
}