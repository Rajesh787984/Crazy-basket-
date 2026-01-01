
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../services/state.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersComponent {
  stateService = inject(StateService);

  // This is a private signal in the service, so we access it this way for the component.
  // In a real app with a backend, we'd have a UserService.
  users = computed(() => (this.stateService as any).users());
  orders = this.stateService.orders;

  getUserOrderCount(userName: string): number {
    return this.orders().filter(order => order.shippingAddress.name === userName).length;
  }
  
  blockUser(userId: string) {
    this.stateService.showToast(`User ${userId} blocked (feature demo).`);
  }
}
