
import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StateService } from '../../../services/state.service';
import { Order, OrderItem, ReturnStatus, User } from '../../../models';

interface ReturnRequest {
  order: Order;
  item: OrderItem;
  user: User | undefined;
}

@Component({
  selector: 'app-admin-returns',
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './admin-returns.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReturnsComponent {
  stateService: StateService = inject(StateService);
  
  selectedStatus = signal<ReturnStatus>('Pending');

  returnRequests = computed((): ReturnRequest[] => {
    const status = this.selectedStatus();
    const requests: ReturnRequest[] = [];
    this.stateService.orders().forEach(order => {
      order.items.forEach(item => {
        if (item.returnRequest && item.returnRequest.status === status) {
          requests.push({
            order,
            item,
            user: this.stateService.users().find(u => u.id === order.userId)
          });
        }
      });
    });
    return requests.sort((a, b) => new Date(b.order.date).getTime() - new Date(a.order.date).getTime());
  });

  updateStatus(orderId: string, itemId: string, status: ReturnStatus) {
    this.stateService.updateReturnStatus(orderId, itemId, status);
  }

  setStatusFilter(event: Event) {
    this.selectedStatus.set((event.target as HTMLSelectElement).value as ReturnStatus);
  }
}