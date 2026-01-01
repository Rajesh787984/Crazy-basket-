
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupComponent {
  stateService = inject(StateService);
  fb = inject(FormBuilder);

  signupForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  signup() {
    if (this.signupForm.valid) {
      const { name, email, mobile, password } = this.signupForm.value;
      // Password is not used for OTP login but stored for potential future use
      this.stateService.signup(name!, email!, mobile!);
    } else {
      this.stateService.showToast('Please enter valid details to sign up.');
    }
  }
}
