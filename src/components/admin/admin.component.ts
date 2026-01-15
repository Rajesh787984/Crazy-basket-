import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminProductsComponent } from './admin-products/admin-products.component';
import { AdminOrdersComponent } from './admin-orders/admin-orders.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminProductFormComponent } from './admin-product-form/admin-product-form.component';
import { AdminCategoriesComponent } from './admin-categories/admin-categories.component';
import { AdminReviewsComponent } from './admin-reviews/admin-reviews.component';
import { AdminSettingsComponent } from './admin-settings/admin-settings.component';
import { AdminBulkUpdaterComponent } from './admin-bulk-updater/admin-bulk-updater.component';
import { AdminFlashSalesComponent } from './admin-flash-sales/admin-flash-sales.component';
import { AdminHomepageComponent } from './admin-homepage/admin-homepage.component';
import { AdminPopupsComponent } from './admin-popups/admin-popups.component';
import { AdminLiveChatComponent } from './admin-live-chat/admin-live-chat.component';
import { AdminPaymentsComponent } from './admin-payments/admin-payments.component';
import { AdminReferralsComponent } from './admin-referrals/admin-referrals.component';
import { AdminCouponsComponent } from './admin-coupons/admin-coupons.component';
import { AdminReturnsComponent } from './admin-returns/admin-returns.component';
import { AdminBannersComponent } from './admin-banners/admin-banners.component';
import { AdminBroadcastComponent } from './admin-broadcast/admin-broadcast.component';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  imports: [
    CommonModule,
    AdminDashboardComponent,
    AdminProductsComponent,
    AdminOrdersComponent,
    AdminUsersComponent,
    AdminProductFormComponent,
    AdminBannersComponent,
    AdminCategoriesComponent,
    AdminReviewsComponent,
    AdminSettingsComponent,
    AdminBulkUpdaterComponent,
    AdminFlashSalesComponent,
    AdminHomepageComponent,
    AdminPopupsComponent,
    AdminLiveChatComponent,
    AdminPaymentsComponent,
    AdminReferralsComponent,
    AdminCouponsComponent,
    AdminReturnsComponent,
    AdminBroadcastComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent {
  stateService: StateService = inject(StateService);
  currentAdminView = this.stateService.currentAdminView;
  isSidebarOpen = this.stateService.isSidebarOpen;

  navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'products', name: 'Products', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { id: 'categories', name: 'Categories', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: 'orders', name: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 'returns', name: 'Returns', icon: 'M4 4v5h5 M20 20v-5h-5 M4 9a9 9 0 0 1 14.24-4.94L20 5 M20 15a9 9 0 0 1-14.24 4.94L4 19' },
    { id: 'payments', name: 'Payments', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { id: 'users', name: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 006-6v-1a3 3 0 00-3-3H9a3 3 0 00-3 3v1a6 6 0 006 6z' },
    { id: 'referrals', name: 'Referrals', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'coupons', name: 'Coupons', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
    { id: 'broadcast', name: 'Broadcast', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.104 9.168-5.182' },
    { id: 'reviews', name: 'Reviews', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { id: 'banners', name: 'Hero Banners', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
    { id: 'homepage', name: 'Homepage Layout', icon: 'M4 6h16M4 12h16M4 18h7' },
    { id: 'popups', name: 'Popups', icon: 'M15 15l-2 5L9 9l11 4-5 2Zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122' },
    { id: 'bulk-updater', name: 'Bulk Updater', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'flash-sales', name: 'Flash Sales', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'live-chat', name: 'Live Chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { id: 'settings', name: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' }
  ];

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  handleNavClick(viewId: string) {
    this.stateService.navigateToAdminView(viewId);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) { // lg breakpoint
      this.isSidebarOpen.set(false);
    }
  }

  currentViewName = computed(() => {
    const currentViewId = this.currentAdminView();
    const navItem = this.navItems.find(item => item.id === currentViewId);
    return navItem ? navItem.name : 'Dashboard';
  });
}