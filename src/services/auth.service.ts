import { Injectable } from '@angular/core';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth = getAuth();

  // ✅ SIGNUP
  signup(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  // ✅ LOGIN
  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // ✅ LOGOUT
  logout() {
    return signOut(this.auth);
  }

  // ✅ USER CHANGE LISTENER
  onUserChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(this.auth, callback);
  }

  // ✅ ADMIN CHECK
  isAdmin(): boolean {
    const user = this.auth.currentUser;
    if (!user || !user.email) return false;

    return environment.adminEmails.includes(user.email);
  }
}
