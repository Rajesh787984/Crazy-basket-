

import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StateService } from '../../services/state.service';
import { Order, OrderItem } from '../../models/order.model';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  imports: [CommonModule, TranslatePipe, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderHistoryComponent {
  stateService: StateService = inject(StateService);
  orders = this.stateService.orders;

  requestReturn(orderId: string, itemId: string) {
    this.stateService.navigateTo('return-request', { orderItem: { orderId, itemId } });
  }
}