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
  
  trackingSteps: OrderStatus[] = ['Confirmed', 'Shipped', 'Delivered'];

  getStepDate(status: OrderStatus): Date | undefined {
    const history = this.order()?.statusHistory;
    return history?.find(h => h.status === status)?.date;
  }

  isStepCompleted(status: OrderStatus): boolean {
    return !!this.getStepDate(status);
  }

  isStepActive(status: OrderStatus): boolean {
    const order = this.order();
    if (!order) return false;
    
    const currentIndex = this.trackingSteps.indexOf(order.status);
    const stepIndex = this.trackingSteps.indexOf(status);

    return stepIndex === currentIndex;
  }
}