import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <h2>Firebase Auth Test</h2>

    <button (click)="signupTest()">Signup</button>
    <button (click)="loginTest()">Login</button>
    <button (click)="logoutTest()">Logout</button>
  `
})
export class AppComponent {

  constructor(private auth: AuthService) {
    // User state check
    this.auth.onUserChange(user => {
      console.log('Current User:', user);
    });
  }

  signupTest() {
    this.auth.signup('test@gmail.com', '123456')
      .then(() => alert('Signup Success'))
      .catch(err => alert(err.message));
  }

  loginTest() {
    this.auth.login('test@gmail.com', '123456')
      .then(() => alert('Login Success'))
      .catch(err => alert(err.message));
  }

  logoutTest() {
    this.auth.logout()
      .then(() => alert('Logout Success'))
      .catch(err => alert(err.message));
  }
      }
  
