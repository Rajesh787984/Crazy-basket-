

import { Component, ChangeDetectionStrategy, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from './services/state.service';
import { FormsModule } from '@angular/forms';

import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HomeComponent } from './components/home/home.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { CartComponent } from './components/cart/cart.component';
import { BottomNavComponent } from './components/bottom-nav/bottom-nav.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LoginComponent } from './components/login/login.component';
import { AddressComponent } from './components/checkout/address/address.component';
import { PaymentComponent } from './components/checkout/payment/payment.component';
import { ManualPaymentComponent } from './components/checkout/manual-payment/manual-payment.component';
import { OrderConfirmationComponent } from './components/checkout/order-confirmation/order-confirmation.component';
import { OrderHistoryComponent } from './components/orders/order-history.component';
import { AddressFormComponent } from './components/address-form/address-form.component';
import { MyntraInsiderComponent } from './components/myntra-insider/myntra-insider.component';
import { AdminComponent } from './components/admin/admin.component';
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';
import { LanguageSettingsComponent } from './components/language-settings/language-settings.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { AdminBannersComponent } from './components/admin/admin-banners/admin-banners.component';
import { AdminCategoriesComponent } from './components/admin/admin-categories/admin-categories.component';
import { AdminReviewsComponent } from './components/admin/admin-reviews/admin-reviews.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { FaqComponent } from './components/faq/faq.component';
import { AdminSettingsComponent } from './components/admin/admin-settings/admin-settings.component';
import { OutfitRecommenderComponent } from './components/outfit-recommender/outfit-recommender.component';
import { AdminBulkUpdaterComponent } from './components/admin/admin-bulk-updater/admin-bulk-updater.component';
import { AdminFlashSalesComponent } from './components/admin/admin-flash-sales/admin-flash-sales.component';
import { WalletComponent } from './components/wallet/wallet.component';
import { AdminHomepageComponent } from './components/admin/admin-homepage/admin-homepage.component';
import { AdminPopupsComponent } from './components/admin/admin-popups/admin-popups.component';
import { AdminLiveChatComponent } from './components/admin/admin-live-chat/admin-live-chat.component';
import { RecentlyViewedComponent } from './components/recently-viewed/recently-viewed.component';
import { ComparisonTrayComponent } from './components/comparison-tray/comparison-tray.component';
import { ProductComparisonComponent } from './components/product-comparison/product-comparison.component';
import { CountdownTimerComponent } from './components/countdown-timer/countdown-timer.component';
import { AdminPaymentsComponent } from './components/admin/admin-payments/admin-payments.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { AdminSmallBannerComponent } from './components/admin/admin-small-banner/admin-small-banner.component';
import { AdminGameComponent } from './components/admin/admin-game/admin-game.component';
import { GameControlCenterComponent } from './components/admin/admin-game/game-control-center/game-control-center.component';
import { VerificationQueueComponent } from './components/admin/admin-game/verification-queue/verification-queue.component';
import { PayoutsLedgerComponent } from './components/admin/admin-game/payouts-ledger/payouts-ledger.component';
import { GameAnalyticsComponent } from './components/admin/admin-game/game-analytics/game-analytics.component';


declare var Tawk_API: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    SidebarComponent,
    HomeComponent,
    ProductListComponent,
    ProductDetailComponent,
    CartComponent,
    BottomNavComponent,
    ProfileComponent,
    LoginComponent,
    AddressComponent,
    AddressFormComponent,
    PaymentComponent,
    ManualPaymentComponent,
    OrderConfirmationComponent,
    OrderHistoryComponent,
    MyntraInsiderComponent,
    AdminComponent,
    ProfileEditComponent,
    LanguageSettingsComponent,
    PrivacyPolicyComponent,
    AdminBannersComponent,
    AdminSmallBannerComponent,
    AdminCategoriesComponent,
    AdminReviewsComponent,
    ContactUsComponent,
    FaqComponent,
    AdminSettingsComponent,
    OutfitRecommenderComponent,
    AdminBulkUpdaterComponent,
    AdminFlashSalesComponent,
    WalletComponent,
    AdminHomepageComponent,
    AdminPopupsComponent,
    AdminLiveChatComponent,
    RecentlyViewedComponent,
    ComparisonTrayComponent,
    ProductComparisonComponent,
    CountdownTimerComponent,
    AdminPaymentsComponent,
    WishlistComponent,
    AdminGameComponent,
    GameControlCenterComponent,
    VerificationQueueComponent,
    PayoutsLedgerComponent,
    GameAnalyticsComponent
  ],
})
export class AppComponent implements OnInit {
  stateService: StateService = inject(StateService);
  currentView = this.stateService.currentView;
  isSidebarOpen = this.stateService.isSidebarOpen;
  toastMessage = this.stateService.toastMessage;
  isImpersonating = this.stateService.isImpersonating;
  currentUser = this.stateService.currentUser;

  showPopup = signal(false);

  constructor() {
    // Effect to control Tawk.to widget visibility
    effect(() => {
      const view = this.currentView();
      const impersonating = this.isImpersonating();
      const viewsToHideOn = ['admin', 'login', 'signup'];

      // Check if Tawk_API is available before using it
      if (typeof Tawk_API !== 'undefined' && Tawk_API.hideWidget) {
        if (viewsToHideOn.includes(view) || impersonating) {
          Tawk_API.hideWidget();
        } else {
          Tawk_API.showWidget();
        }
      }
    });

    // Effect to set user details in Tawk.to
    effect(() => {
      const user = this.currentUser();
       if (typeof Tawk_API !== 'undefined' && Tawk_API.visitor) {
          if (user) {
            Tawk_API.visitor = {
              name: user.name,
              email: user.email,
            };
          }
       }
    });
  }

  ngOnInit() {
    // Only show the popup if one is active and it hasn't been shown in this session
    if (this.stateService.activePopup() && !sessionStorage.getItem('popupShown')) {
      // Use a timeout to ensure the popup doesn't appear too abruptly on load
      setTimeout(() => this.showPopup.set(true), 1500);
    }
  }

  closePopup() {
    this.showPopup.set(false);
    sessionStorage.setItem('popupShown', 'true');
  }

  navigateToPopupLink(link: string) {
    this.stateService.navigateTo(link);
    this.closePopup();
  }
}
