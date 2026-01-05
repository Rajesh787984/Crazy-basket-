
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../services/state.service';
import { Order, OrderStatus } from '../../../models/order.model';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrdersComponent {
  stateService: StateService = inject(StateService);
  orders = this.stateService.orders;
  
  orderStatuses: OrderStatus[] = ['Pending Verification', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

  updateStatus(orderId: string, event: Event) {
    const newStatus = (event.target as HTMLSelectElement).value as OrderStatus;
    this.stateService.updateOrderStatus(orderId, newStatus);
  }

  printInvoice(orderId: string) {
    this.stateService.showToast(`Printing invoice for #${orderId} (feature demo).`);
  }
}
