
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../services/state.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  stateService = inject(StateService);

  totalSales = this.stateService.totalSales;
  totalOrders = this.stateService.orders;
  pendingOrdersCount = this.stateService.pendingOrdersCount;
  totalUsersCount = this.stateService.totalUsersCount;
}
