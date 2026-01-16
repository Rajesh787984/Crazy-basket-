import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../../services/state.service';

@Component({
  selector: 'app-payment-summary',
  imports: [CommonModule, DecimalPipe, FormsModule],
  templateUrl: './payment-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentSummaryComponent {
  stateService: StateService = inject(StateService);
  cartMRP = this.stateService.cartMRP;
  cartDiscount = this.stateService.cartDiscountOnMRP;
  couponDiscount = this.stateService.couponDiscount;
  shippingCost = this.stateService.shippingCost;
  cartTotal = this.stateService.cartTotal;
  appliedCoupon = this.stateService.appliedCoupon;
  cartItemCount = this.stateService.cartItemCount;
  
  couponCode = signal('');

  applyCoupon() {
    const code = this.couponCode().trim();

    // Do not validate if the user is trying to clear the coupon
    if (code.length > 0) {
      if (code.length < 3) {
        this.stateService.showToast('Coupon code must be at least 3 characters.');
        return;
      }
      
      const alphanumericRegex = /^[a-zA-Z0-9]+$/;
      if (!alphanumericRegex.test(code)) {
        this.stateService.showToast('Coupon code must be alphanumeric (letters and numbers only).');
        return;
      }
    }

    this.stateService.applyCoupon(code);
  }

  removeCoupon() {
    this.couponCode.set('');
    this.stateService.applyCoupon(''); // Pass empty string to remove
    this.stateService.showToast('Coupon removed.');
  }
}