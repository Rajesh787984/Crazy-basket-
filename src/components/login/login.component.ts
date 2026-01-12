import { Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,  // ✅ यह लाइन ज़रूरी है
  imports: [CommonModule, FormsModule, NgOptimizedImage],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  email = '';
  password = '';

  async loginWithGoogle() {
    try {
      await this.authService.googleLogin();
      this.router.navigate(['/home']);
    } catch (error) {
      alert('Login Failed');
    }
  }

  async loginWithEmail() {
    try {
      await this.authService.emailLogin(this.email, this.password);
      this.router.navigate(['/home']);
    } catch (error) {
      alert('Login Failed');
    }
  }
}
