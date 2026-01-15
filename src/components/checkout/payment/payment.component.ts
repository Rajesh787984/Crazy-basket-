
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../services/state.service';
import { PaymentSummaryComponent } from '../payment-summary/payment-summary.component';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  imports: [CommonModule, PaymentSummaryComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentComponent {
  stateService: StateService = inject(StateService);
  cartTotal = this.stateService.cartTotal;
  selectedPaymentMethod = this.stateService.selectedPaymentMethod;
  isCodAvailableInCart = this.stateService.isCodAvailableInCart;

  canPayWithWallet = computed(() => {
    const user = this.stateService.currentUser();
    if (!user) return false;
    return user.walletBalance >= this.cartTotal();
  });

  selectPaymentMethod(method: string) {
    if (method === 'COD' && !this.isCodAvailableInCart()) {
      this.stateService.showToast('Cash on Delivery is not available for all items in your cart.');
      return;
    }
     if (method === 'Wallet' && !this.canPayWithWallet()) {
      this.stateService.showToast('Insufficient wallet balance for this order.');
      return;
    }
    this.selectedPaymentMethod.set(method);
  }

  placeOrder() {
    if (this.selectedPaymentMethod() === 'UPI') {
      this.stateService.navigateTo('manual-payment');
    } else {
      this.stateService.placeOrder();
    }
  }
}
