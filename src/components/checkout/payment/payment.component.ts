
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../../services/state.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentComponent {
  stateService = inject(StateService);
  cartTotal = this.stateService.cartTotal;
  selectedPaymentMethod = this.stateService.selectedPaymentMethod;

  selectPaymentMethod(method: string) {
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