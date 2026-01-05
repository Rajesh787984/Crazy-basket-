
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../services/state.service';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Coupon } from '../../../models/coupon.model';

@Component({
  selector: 'app-admin-coupons',
  templateUrl: './admin-coupons.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCouponsComponent {
  stateService: StateService = inject(StateService);
  fb: FormBuilder = inject(FormBuilder);

  coupons = this.stateService.coupons;
  showForm = signal(false);
  
  couponForm = this.fb.group({
    code: ['', Validators.required],
    type: ['flat' as const, Validators.required],
    value: [0, [Validators.required, Validators.min(1)]],
    expiryDate: ['', Validators.required],
    maxUses: [1, [Validators.required, Validators.min(1)]],
  });

  newCoupon() {
    this.couponForm.reset({
      type: 'flat',
      value: 0,
      maxUses: 1,
    });
    this.showForm.set(true);
  }

  saveCoupon() {
    if (this.couponForm.invalid) {
      this.stateService.showToast('Please fill all fields correctly.');
      return;
    }
    
    const formValue = this.couponForm.getRawValue();
    const couponData = {
      code: formValue.code!,
      type: formValue.type!,
      value: formValue.value!,
      expiryDate: new Date(formValue.expiryDate!).toISOString(),
      maxUses: formValue.maxUses!,
    };

    this.stateService.addCoupon(couponData);
    this.cancel();
  }
  
  deleteCoupon(couponId: string) {
    if (confirm('Are you sure you want to delete this coupon?')) {
        this.stateService.deleteCoupon(couponId);
    }
  }

  cancel() {
    this.couponForm.reset();
    this.showForm.set(false);
  }
}
