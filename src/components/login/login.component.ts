import { Component, ChangeDetectionStrategy, inject, signal, AfterViewInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { AuthService } from '../../services/auth.service';

type EmailView = 'login' | 'signup';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [CommonModule, ReactiveFormsModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements AfterViewInit {
  stateService: StateService = inject(StateService);
  authService: AuthService = inject(AuthService);
  fb: FormBuilder = inject(FormBuilder);

  loginMethod = signal<'email' | 'mobile'>('email');
  emailView = signal<EmailView>('login');
  mobileLoginStep = signal<'enter-mobile' | 'enter-otp'>('enter-mobile');
  
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

  mobileForm = this.fb.group({
    mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  ngAfterViewInit() {
    // This container is used by Firebase for the invisible reCAPTCHA
    const recaptchaContainer = document.getElementById('recaptcha-container');
    if (recaptchaContainer) {
      this.authService.setupRecaptcha(recaptchaContainer);
    }
  }

  changeLoginMethod(method: 'email' | 'mobile') {
    this.loginMethod.set(method);
    this.errorMessage.set(null);
  }

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
            this.stateService.showToast(`Account created successfully! Please check your email to verify your account.`);
            const lastView = this.stateService.lastNavigatedView();
            this.stateService.navigateTo(lastView !== 'login' ? lastView : 'home');
        },
        error: (err) => {
            this.isLoading.set(false);
            this.errorMessage.set(this.formatFirebaseError(err));
        }
    });
  }

  sendOtp() {
    this.mobileForm.get('mobile')?.markAsTouched();
    if (this.mobileForm.get('mobile')?.invalid) return;
    
    this.isLoading.set(true);
    this.errorMessage.set(null);
    const mobile = this.mobileForm.value.mobile!;

    this.authService.sendOtp(mobile).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.mobileLoginStep.set('enter-otp');
        this.stateService.showToast('OTP sent to your mobile number.');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(this.formatFirebaseError(err));
      }
    });
  }

  verifyOtp() {
    if (this.mobileForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    const otp = this.mobileForm.value.otp!;

    this.authService.verifyOtp(otp).subscribe({
      next: (userCredential) => {
        this.isLoading.set(false);
        this.stateService.showToast(`Welcome!`);
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
                return 'Invalid email or password. Please check your credentials. For admin access, ensure the "admin@crazybasket.com" user exists in your Firebase project\'s Authentication console.';
            case 'auth/email-already-in-use':
                return 'This email address is already in use.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.';
            case 'auth/user-disabled':
                return 'This account has been suspended or is blacklisted.';
            case 'auth/email-not-verified':
                return 'Please verify your email address before logging in.';
            case 'auth/invalid-verification-code':
                return 'The OTP you entered is incorrect. Please try again.';
            case 'auth/recaptcha-not-initialized':
                return 'reCAPTCHA failed. Please try again.';
            case 'auth/no-confirmation-result':
                 return 'Could not verify OTP. Please try sending a new one.';
            case 'auth/internal-error':
                 return 'An internal authentication error occurred. This is often due to project setup. Please ensure Phone Sign-In is enabled in your Firebase console and required APIs are active in Google Cloud.';
            case 'auth/unauthorized-domain':
                return 'This domain is not authorized for authentication. Please add it to the authorized domains list in your Firebase project settings.';
            default:
                console.error("Firebase Auth Error:", error);
                return 'An unexpected error occurred. Please try again.';
        }
    }
    return 'An unexpected error occurred. Please try again.';
  }
}
