
import { Injectable, signal } from '@angular/core';
import { of, Observable, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

// Mock UserCredential and FirebaseUser structure to maintain API contract
export interface MockAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
}

interface MockUserCredential {
  user: MockAuthUser;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // This service now simulates auth without Firebase.
  public currentUser = signal<MockAuthUser | null>(null);

  googleLogin(): Observable<MockUserCredential> {
    // Simulate logging in as an existing user
    const mockUser: MockAuthUser = {
      uid: 'mock-google-uid-123',
      email: 'user@example.com',
      displayName: 'John Doe',
      photoURL: 'https://picsum.photos/seed/john/200/200',
      phoneNumber: '9876543210',
      emailVerified: true,
    };
    this.currentUser.set(mockUser);
    return of({ user: mockUser }).pipe(delay(500));
  }

  emailSignUp(email: string, password: string): Observable<MockUserCredential> {
     if (email === 'user@example.com') { // Simulate existing user
        return throwError(() => ({ code: 'auth/email-already-in-use' })).pipe(delay(500));
    }
    const name = email.split('@')[0];
    const mockUser: MockAuthUser = {
      uid: `mock-uid-${Date.now()}`,
      email: email,
      displayName: name,
      photoURL: `https://picsum.photos/seed/${name}/200/200`,
      phoneNumber: '',
      emailVerified: false,
    };
    this.currentUser.set(mockUser);
    return of({ user: mockUser }).pipe(delay(500));
  }

  emailLogin(email: string, password: string): Observable<MockUserCredential> {
    const user = email === 'user@example.com' || email === 'admin@crazybasket.com';
    if (user && password === 'password') {
        const isAdmin = email === 'admin@crazybasket.com';
        const mockUser: MockAuthUser = {
            uid: isAdmin ? 'mock-admin-uid-1' : 'mock-user-uid-2',
            email: email,
            displayName: isAdmin ? 'Admin User' : 'John Doe',
            photoURL: `https://picsum.photos/seed/${isAdmin ? 'admin' : 'john'}/200/200`,
            phoneNumber: isAdmin ? '8279458045' : '9876543210',
            emailVerified: true,
        };
        this.currentUser.set(mockUser);
        return of({ user: mockUser }).pipe(delay(500));
    } else {
        return throwError(() => ({ code: 'auth/invalid-credential' })).pipe(delay(500));
    }
  }

  logout(): Observable<void> {
    this.currentUser.set(null);
    return of(undefined).pipe(delay(200));
  }
}