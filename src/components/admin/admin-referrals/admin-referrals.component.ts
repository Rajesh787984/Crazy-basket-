
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../services/state.service';
import { User } from '../../../models/user.model';
import { Transaction } from '../../../models/transaction.model';

interface TopReferrer {
  user: User;
  referralCount: number;
  commissionEarned: number;
}

@Component({
  selector: 'app-admin-referrals',
  templateUrl: './admin-referrals.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReferralsComponent {
  stateService: StateService = inject(StateService);

  users = this.stateService.users;
  transactions = this.stateService.transactions;
  orders = this.stateService.orders;

  referralCommissions = computed(() => {
    return this.transactions().filter(t => t.description.startsWith('Referral commission'));
  });

  totalCommissionPaid = computed(() => {
    return this.referralCommissions().reduce((sum, tx) => sum + tx.amount, 0);
  });

  referralPairs = computed(() => {
    const pairs: { referred: User, referrer: User | undefined }[] = [];
    this.users().forEach(user => {
      if (user.referredBy) {
        const referrer = this.users().find(u => u.id === user.referredBy);
        pairs.push({ referred: user, referrer });
      }
    });
    return pairs;
  });
  
  referralSales = computed(() => {
    const referredUserIds = this.users().filter(u => u.referredBy).map(u => u.id);
    return this.orders()
      .filter(o => referredUserIds.includes(o.userId))
      .reduce((sum, order) => sum + order.totalAmount, 0);
  });
  
  topReferrers = computed(() => {
    const referrers: { [key: string]: TopReferrer } = {};

    this.users().forEach(user => {
       referrers[user.id] = {
         user,
         referralCount: 0,
         commissionEarned: 0,
       };
    });

    this.referralPairs().forEach(pair => {
      if (pair.referrer) {
        referrers[pair.referrer.id].referralCount++;
      }
    });

    this.referralCommissions().forEach(tx => {
       if (referrers[tx.userId]) {
         referrers[tx.userId].commissionEarned += tx.amount;
       }
    });

    return Object.values(referrers)
      .filter(r => r.referralCount > 0 || r.commissionEarned > 0)
      .sort((a, b) => b.commissionEarned - a.commissionEarned)
      .slice(0, 10);
  });

  getUserById(userId: string): User | undefined {
    return this.users().find(u => u.id === userId);
  }
}
