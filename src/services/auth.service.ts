import { Injectable, inject, signal } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user, UserCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth: Auth = inject(Auth);
  currentUser = signal<any>(null);

  constructor() {
    user(this.auth).subscribe((user) => this.currentUser.set(user));
  }

  // ✅ असली Google Login
  googleLogin(): Observable<UserCredential> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider));
  }

  logout(): Observable<void> {
    return from(signOut(this.auth));
  }
  
  emailSignUp(email: string, pass: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, pass));
  }

  emailLogin(email: string, pass: string) {
    return from(signInWithEmailAndPassword(this.auth, email, pass));
  }

  isAdmin(): boolean {
    const u = this.currentUser();
    return !!u && !!u.email && (environment.adminEmails || []).includes(u.email);
  }
}
