
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../services/state.service';
import { Order } from '../../../models/order.model';
import { computed } from '@angular/core';

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderConfirmationComponent {
  stateService = inject(StateService);

  latestOrder = computed(() => {
    const orderId = this.stateService.latestOrderId();
    if (!orderId) return null;
    return this.stateService.orders().find(o => o.id === orderId) || null;
  });
}
