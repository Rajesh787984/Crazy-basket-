import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { AuthService } from '../../services/auth.service';

type EmailView = 'login' | 'signup';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  stateService: StateService = inject(StateService);
  authService: AuthService = inject(AuthService);
  fb: FormBuilder = inject(FormBuilder);

  emailView = signal<EmailView>('login');
  
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  
  emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  signupForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    referralCode: [''],
  });

  continueWithGoogle() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.authService.googleLogin().subscribe({
      next: (userCredential) => {
        this.isLoading.set(false);
        this.stateService.showToast(`Welcome, ${userCredential.user.displayName}!`);
        const lastView = this.stateService.lastNavigatedView();
        this.stateService.navigateTo(lastView !== 'login' ? lastView : 'home');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(this.formatFirebaseError(err));
        console.error(err);
      }
    });
  }
  
  handleEmailLogin() {
    if (this.emailForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    const { email, password } = this.emailForm.value;

    this.authService.emailLogin(email!, password!).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.stateService.showToast(`Welcome back!`);
          const lastView = this.stateService.lastNavigatedView();
          this.stateService.navigateTo(lastView !== 'login' ? lastView : 'home');
        },
        error: (err) => {
            this.isLoading.set(false);
            this.errorMessage.set(this.formatFirebaseError(err));
        }
    });
  }

  handleEmailSignup() {
    if (this.signupForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    const { email, password } = this.signupForm.value;

    this.authService.emailSignUp(email!, password!).subscribe({
        next: () => {
            this.isLoading.set(false);
            this.stateService.showToast(`Account created successfully!`);
            const lastView = this.stateService.lastNavigatedView();
            this.stateService.navigateTo(lastView !== 'login' ? lastView : 'home');
        },
        error: (err) => {
            this.isLoading.set(false);
            this.errorMessage.set(this.formatFirebaseError(err));
        }
    });
  }

  private formatFirebaseError(error: any): string {
    if (error.code) {
        switch (error.code) {
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                return 'Invalid email or password.';
            case 'auth/email-already-in-use':
                return 'This email address is already in use.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.';
            case 'auth/user-disabled':
                return 'This account has been suspended or is blacklisted.';
            default:
                return 'An unexpected error occurred. Please try again.';
        }
    }
    return 'An unexpected error occurred. Please try again.';
  }
}