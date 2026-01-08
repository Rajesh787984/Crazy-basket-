import { Injectable, inject, signal } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user } from '@angular/fire/auth';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  currentUser = signal<any>(null);

  constructor() {
    user(this.auth).subscribe(user => this.currentUser.set(user));
  }

  async googleLogin() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  async logout() {
    return signOut(this.auth);
  }

  isAdmin(): boolean {
    const u = this.currentUser();
    return u && environment.adminEmails.includes(u.email);
  }
}

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
        isVerified: true, // Auto-verify mock users
        walletBalance: 0,
        isBlacklisted: false,
        userType: 'B2C',
        ipAddress: '127.0.0.1',
        deviceId: 'mock_device',
        referralCode: email.substring(0, 4).toUpperCase() + Date.now().toString().slice(-4),
        photoUrl: `https://picsum.photos/seed/${email}/200/200`
    };

    this.stateService.users.update(users => [...users, newUser]);
    this.setCurrentUser(newUser);

    return of({ user: this.currentUser()! }).pipe(delay(500));
  }

  emailLogin(email: string, password: string): Observable<MockUserCredential> {
    const user = this.stateService.users().find(u => u.email === email);
    
    if (user && user.password === password) {
       if (user.isBlacklisted) {
         return throwError(() => ({ code: 'auth/user-disabled' }));
       }
      this.setCurrentUser(user);
      return of({ user: this.currentUser()! }).pipe(delay(500));
    }
    
    return throwError(() => ({ code: 'auth/invalid-credential' }));
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
