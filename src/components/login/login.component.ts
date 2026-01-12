import { Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms'; // फॉर्म के लिए ज़रूरी
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true, // ✅ यह सबसे ज़रूरी है
  imports: [CommonModule, FormsModule, RouterModule, NgOptimizedImage],
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  email = '';
  password = '';
  isLoading = false;

  // Google Login का फंक्शन
  async loginWithGoogle() {
    this.isLoading = true;
    try {
      await this.authService.googleLogin();
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Google Login Error', error);
      alert('Login Failed. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }

  // Email/Password Login का फंक्शन
  async loginWithEmail() {
    if (!this.email || !this.password) {
      alert('Please enter email and password');
      return;
    }
    
    this.isLoading = true;
    try {
      await this.authService.emailLogin(this.email, this.password);
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Email Login Error', error);
      alert('Invalid Email or Password');
    } finally {
      this.isLoading = false;
    }
  }
}
