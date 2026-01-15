
import { Component, ChangeDetectionStrategy, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../services/state.service';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../../models/user.model';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-admin-payments',
  templateUrl: './admin-payments.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPaymentsComponent implements OnInit {
  stateService: StateService = inject(StateService);
  fb: FormBuilder = inject(FormBuilder);

  contactInfo = this.stateService.contactInfo;

  pendingManualOrders = computed(() => {
    return this.stateService.orders().filter(o => o.paymentMethod === 'UPI (Manual)' && o.status === 'Pending Verification');
  });

  contactForm = this.fb.group({
    upiId: [''],
    qrCodeImage: [''],
  });

  ngOnInit() {
    const currentInfo = this.contactInfo();
    this.contactForm.patchValue({
        upiId: currentInfo.upiId,
        qrCodeImage: currentInfo.qrCodeImage
    });
  }

  savePaymentSettings() {
    if (this.contactForm.valid) {
      // We need to merge with existing contact info as this form only handles a subset
      const currentInfo = this.contactInfo();
      const updatedInfo = { ...currentInfo, ...this.contactForm.value };
      this.stateService.updateContactInfo(updatedInfo as { address: string; email: string; phone: string; upiId: string; qrCodeImage: string; });
      this.stateService.showToast('Payment settings updated successfully.');
    }
  }

  getUserForOrder(order: Order): User | undefined {
    return this.stateService.users().find(u => u.id === order.userId);
  }

  approve(orderId: string) {
    this.stateService.updateOrderStatus(orderId, 'Confirmed');
  }

  reject(orderId: string) {
    if (confirm('Are you sure you want to reject this payment and cancel the order?')) {
      this.stateService.updateOrderStatus(orderId, 'Cancelled');
    }
  }
}
