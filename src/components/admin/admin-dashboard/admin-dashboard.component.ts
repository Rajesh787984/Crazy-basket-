import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../services/state.service';
import { Order } from '../../../models/order.model';
import { User } from '../../../models/user.model';

type TimePeriod = 'today' | 'yesterday' | '7days' | '30days';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  stateService: StateService = inject(StateService);

  timePeriod = signal<TimePeriod>('today');
  
  private isDateInRange(date: Date, period: TimePeriod): boolean {
    const orderDate = new Date(date);
    orderDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (period) {
      case 'today':
        return orderDate.getTime() === today.getTime();
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return orderDate.getTime() === yesterday.getTime();
      case '7days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6); // include today
        return orderDate >= sevenDaysAgo;
      case '30days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 29); // include today
        return orderDate >= thirtyDaysAgo;
    }
  }

  filteredOrders = computed(() => {
    const period = this.timePeriod();
    return this.stateService.orders().filter(order => this.isDateInRange(order.date, period));
  });

  totalRevenue = computed(() => {
    return this.filteredOrders().reduce((sum, order) => sum + order.totalAmount, 0);
  });

  totalOrdersCount = computed(() => {
    return this.filteredOrders().length;
  });

  averageOrderValue = computed(() => {
    const total = this.totalRevenue();
    const count = this.totalOrdersCount();
    return count > 0 ? total / count : 0;
  });

  recentOrders = computed(() => {
     return this.stateService.orders().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  });
  
  getUserForOrder(order: Order): User | undefined {
    return this.stateService.users().find(u => u.id === order.userId);
  }

  setTimePeriod(period: TimePeriod) {
    this.timePeriod.set(period);
  }
}
