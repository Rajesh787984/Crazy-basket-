
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../services/state.service';
import { Order } from '../../../models/order.model';
import { User } from '../../../models/user.model';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  stateService: StateService = inject(StateService);
  productService: ProductService = inject(ProductService);

  private isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  private isYesterday(date: Date): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.getDate() === yesterday.getDate() &&
           date.getMonth() === yesterday.getMonth() &&
           date.getFullYear() === yesterday.getFullYear();
  }

  private isThisWeek(date: Date): boolean {
    const today = new Date();
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay())); // Assuming Sunday is the first day
    firstDayOfWeek.setHours(0, 0, 0, 0);
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
    lastDayOfWeek.setHours(23, 59, 59, 999);
    return date >= firstDayOfWeek && date <= lastDayOfWeek;
  }

  allOrders = this.stateService.orders;

  todaysOrdersCount = computed(() => this.allOrders().filter(o => this.isToday(new Date(o.date))).length);
  yesterdaysOrdersCount = computed(() => this.allOrders().filter(o => this.isYesterday(new Date(o.date))).length);
  thisWeeksOrdersCount = computed(() => this.allOrders().filter(o => this.isThisWeek(new Date(o.date))).length);
  dispatchedOrdersCount = computed(() => this.allOrders().filter(o => o.status === 'Shipped').length);
  pendingOrdersCount = computed(() => this.allOrders().filter(o => o.status === 'Confirmed' || o.status === 'Pending Verification').length);
  
  topSellingProducts = computed(() => {
    const orders = this.allOrders();
    const productCounts = new Map<string, number>();

    orders.forEach(order => {
      order.items.forEach(item => {
        productCounts.set(item.product.id, (productCounts.get(item.product.id) || 0) + item.quantity);
      });
    });

    const sortedProducts = Array.from(productCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return sortedProducts.map(([productId, quantity]) => ({
      product: this.productService.getProductById(productId),
      quantity
    })).filter((item): item is { product: Product, quantity: number } => item.product !== undefined);
  });

  recentOrders = computed(() => {
     return this.allOrders().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  });
  
  getUserForOrder(order: Order): User | undefined {
    return this.stateService.users().find(u => u.id === order.userId);
  }
}