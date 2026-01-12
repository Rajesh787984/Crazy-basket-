
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StateService } from '../../../services/state.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manual-payment',
  templateUrl: './manual-payment.component.html',
  imports: [CommonModule, FormsModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualPaymentComponent {
  stateService: StateService = inject(StateService);
  cartTotal = this.stateService.cartTotal;
  contactInfo = this.stateService.contactInfo;
  
  transactionId = signal('');

  payWithUpi(appName: string) {
    const upiId = this.contactInfo().upiId;
    const amount = this.cartTotal();
    const storeName = 'Crazy Basket';
    
    if (!upiId) {
      this.stateService.showToast('UPI ID is not configured by the administrator.');
      return;
    }

    let upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(storeName)}&am=${amount}&cu=INR`;
    
    // Using the generic URL is often the most compatible approach
    // as specific app schemes can change. This is for demonstration.
    // Example: upiUrl = `phonepe://pay?pa=...`;
    
    window.location.href = upiUrl;
  }

  verifyAndPlaceOrder() {
    const utr = this.transactionId().trim();
    if (!utr || utr.length < 12 || !/^\d+$/.test(utr)) {
      this.stateService.showToast('Please enter a valid 12-digit Transaction ID/UTR.');
      return;
    }
    this.stateService.placeManualUpiOrder(utr);
  }
}