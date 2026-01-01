
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  stateService = inject(StateService);
  fb = inject(FormBuilder);

  loginStep = signal<'mobile' | 'otp'>('mobile');

  mobileForm = this.fb.group({
    mobile: ['8279458045', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
  });

  otpForm = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
  });

  requestOtp() {
    if (this.mobileForm.valid) {
      const mobile = this.mobileForm.value.mobile!;
      if (this.stateService.requestLoginOtp(mobile)) {
        this.loginStep.set('otp');
      }
    } else {
        this.stateService.showToast('Please enter a valid 10-digit mobile number.');
    }
  }

  verifyOtp() {
    if (this.otpForm.valid) {
      const mobile = this.mobileForm.value.mobile!;
      const otp = this.otpForm.value.otp!;
      this.stateService.loginWithOtp(mobile, otp);
    } else {
      this.stateService.showToast('Please enter the 6-digit OTP.');
    }
  }
}
