

import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { Coupon } from '../../models/coupon.model';

@Component({
  selector: 'app-coupons',
  imports: [CommonModule],
  templateUrl: './coupons.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CouponsComponent {
  stateService: StateService = inject(StateService);

  availableCoupons = computed(() => {
    return this.stateService.coupons().filter(coupon => 
      new Date(coupon.expiryDate) >= new Date() && coupon.usedCount < coupon.maxUses
    );
  });

  copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      this.stateService.showToast(`Coupon "${code}" copied to clipboard!`);
    });
  }

  isExpiringSoon(expiryDate: string): boolean {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    // A coupon is expiring soon if its expiry date is in the future but within the next 7 days.
    return expiry >= now && expiry <= sevenDaysFromNow;
  }
}