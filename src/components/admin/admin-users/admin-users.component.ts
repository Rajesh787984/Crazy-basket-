
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../../services/state.service';
import { User } from '../../../models/user.model';
import { ProductService } from '../../../services/product.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersComponent {
  stateService: StateService = inject(StateService);
  productService: ProductService = inject(ProductService);

  users = this.stateService.users;
  orders = this.stateService.orders;
  
  modalView = signal<'wallet' | 'views' | null>(null);
  selectedUser = signal<User | null>(null);
  
  // For wallet modal
  walletAmount = signal(100);
  walletAction = signal<'add' | 'subtract'>('add');

  userProductViews = computed(() => {
    const user = this.selectedUser();
    if (!user) return [];
    const userViews = this.stateService.productViewCounts().get(user.id);
    if (!userViews) return [];

    return Array.from(userViews.entries())
      .map(([productId, count]) => ({
        product: this.productService.getProductById(productId),
        count
      }))
      .filter(item => item.product)
      .sort((a, b) => b.count - a.count);
  });
  
  referralCounts = computed(() => {
    const counts = new Map<string, number>();
    this.users().forEach(u => {
      if (u.referredBy) {
        counts.set(u.referredBy, (counts.get(u.referredBy) || 0) + 1);
      }
    });
    return counts;
  });

  isAdminUser(user: User): boolean {
    return environment.adminEmails.includes(user.email);
  }

  getReferrerName(user: User): string {
    if (!user.referredBy) return 'N/A';
    const referrer = this.users().find(u => u.id === user.referredBy);
    return referrer ? referrer.name : 'Unknown';
  }

  getReferralCount(userId: string): number {
    return this.referralCounts().get(userId) || 0;
  }

  getUserOrderCount(userId: string): number {
    return this.orders().filter(order => order.shippingAddress.name === this.users().find(u => u.id === userId)?.name).length;
  }
  
  toggleBlacklist(userId: string) {
    this.stateService.toggleBlacklist(userId);
  }

  updateUserType(userId: string, event: Event) {
    const type = (event.target as HTMLSelectElement).value as 'B2C' | 'B2B';
    this.stateService.updateUserType(userId, type);
  }
  
  impersonate(userId: string) {
    if(confirm('Are you sure you want to log in as this user? You will be redirected from the admin panel.')) {
      this.stateService.impersonateUser(userId);
    }
  }

  formatProvider(providerId?: string): string {
    if (!providerId) return 'N/A';
    if (providerId.includes('google.com')) return 'Google';
    if (providerId.includes('phone')) return 'Mobile';
    if (providerId.includes('password')) return 'Email';
    return providerId;
  }

  // Modal controls
  openWalletModal(user: User) {
    this.selectedUser.set(user);
    this.modalView.set('wallet');
    this.walletAmount.set(100);
    this.walletAction.set('add');
  }

  openViewsModal(user: User) {
    this.selectedUser.set(user);
    this.modalView.set('views');
  }

  closeModal() {
    this.selectedUser.set(null);
    this.modalView.set(null);
  }

  updateWallet() {
    const user = this.selectedUser();
    const amount = this.walletAmount();
    if (user && amount > 0) {
      this.stateService.updateUserWallet(user.id, amount, this.walletAction());
      // we must re-fetch the user to get the updated balance for the view
      this.selectedUser.set(this.stateService.users().find(u => u.id === user.id) || null);
    }
  }

  getUserTier(points: number): 'Bronze' | 'Silver' | 'Gold' {
    if (points >= 2500) return 'Gold';
    if (points >= 1000) return 'Silver';
    return 'Bronze';
  }
}
