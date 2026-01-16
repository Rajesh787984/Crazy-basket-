import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StateService } from '../../services/state.service';
import { Order, OrderStatus } from '../../models/order.model';

@Component({
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.component.html',
  imports: [CommonModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderTrackingComponent {
  stateService: StateService = inject(StateService);

  order = computed(() => {
    const orderId = this.stateService.selectedOrderId();
    if (!orderId) return null;
    return this.stateService.orders().find(o => o.id === orderId) || null;
  });
  
  trackingSteps: OrderStatus[] = ['Pending Verification', 'Confirmed', 'Shipped', 'Delivered'];

  getStepDate(status: OrderStatus): Date | undefined {
    const history = this.order()?.statusHistory;
    return history?.find(h => h.status === status)?.date;
  }

  isStepCompleted(status: OrderStatus): boolean {
    const order = this.order();
    if (!order) return false;

    // A step is "completed" if it exists in the history.
    const stepExists = this.getStepDate(status);

    // If the order is cancelled, only show steps as completed if they happened *before* the cancellation.
    if (order.status === 'Cancelled') {
      const cancelledDate = this.getStepDate('Cancelled');
      if (stepExists && cancelledDate && stepExists > cancelledDate) {
        return false; // Don't show steps completed after cancellation
      }
    }
    return !!stepExists;
  }

  isStepActive(status: OrderStatus): boolean {
    const order = this.order();
    if (!order || order.status === 'Cancelled') return false;
    
    // The current status of the order is the single active step.
    return order.status === status;
  }
}