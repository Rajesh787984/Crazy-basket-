


import { Component, ChangeDetectionStrategy, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from './services/state.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
import { PartnerProgramComponent } from './components/partner-program/partner-program.component';
import { CouponsComponent } from './components/coupons/coupons.component';
import { PullToRefreshComponent } from './components/pull-to-refresh/pull-to-refresh.component';
import { TranslatePipe } from './pipes/translate.pipe';
import { ReturnRequestComponent } from './components/return-request/return-request.component';


declare var Tawk_API: any;

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div [class.blur-sm]="showPopup()" class="transition-all duration-300">
      <div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        @if (!isImpersonating()) {
          <app-header></app-header>
        } @else {
          <div class="bg-yellow-400 text-black text-center p-2 font-bold">
            You are impersonating {{ stateService.currentUser()?.name }}. 
            <button (click)="stateService.stopImpersonating()" class="underline ml-4">Return to Admin</button>
          </div>
        }
        
        <div class="flex flex-1 overflow-y-hidden">
          <app-sidebar [isOpen]="isSidebarOpen()"></app-sidebar>

          <app-pull-to-refresh class="flex-grow">
            <main class="overflow-y-auto h-full">
              @switch (currentView()) {
                @case ('home') { <app-home></app-home> }
                @case ('productList') { <app-product-list></app-product-list> }
                @case ('productDetail') { <app-product-detail></app-product-detail> }
                @case ('cart') { <app-cart></app-cart> }
                @case ('profile') { <app-profile></app-profile> }
                @case ('login') { <app-login></app-login> }
                @case ('address') { <app-address></app-address> }
                @case ('payment') { <app-payment></app-payment> }
                @case ('manual-payment') { <app-manual-payment></app-manual-payment> }
                @case ('orderConfirmation') { <app-order-confirmation></app-order-confirmation> }
                @case ('orders') { <app-order-history></app-order-history> }
                @case ('address-form') { <app-address-form></app-address-form> }
                @case ('myntra-insider') { <app-myntra-insider></app-myntra-insider> }
                @case ('admin') { <app-admin></app-admin> }
                @case ('profile-edit') { <app-profile-edit></app-profile-edit> }
                @case ('language-settings') { <app-language-settings></app-language-settings> }
                @case ('privacy-policy') { <app-privacy-policy></app-privacy-policy> }
                @case ('contact-us') { <app-contact-us></app-contact-us> }
                @case ('faq') { <app-faq></app-faq> }
                @case ('outfitRecommender') { <app-outfit-recommender></app-outfit-recommender> }
                @case ('wallet') { <app-wallet></app-wallet> }
                @case ('productComparison') { <app-product-comparison></app-product-comparison> }
                @case ('wishlist') { <app-wishlist></app-wishlist> }
                @case ('partner-program') { <app-partner-program></app-partner-program> }
                @case ('coupons') { <app-coupons></app-coupons> }
                @case ('return-request') { <app-return-request></app-return-request> }
                @default {
                  <div class="p-8 text-center">
                    <h2 class="text-2xl font-bold">Page Not Found</h2>
                    <p>The view '{{ currentView() }}' does not exist.</p>
                  </div>
                }
              }
            </main>
          </app-pull-to-refresh>
        </div>
        
        @if(stateService.comparisonList().length > 0) {
          <app-comparison-tray></app-comparison-tray>
        }
        
        @if (!isImpersonating()) {
          <app-bottom-nav class="md:hidden sticky bottom-0"></app-bottom-nav>
        }
      </div>
    </div>

    <!-- Toast Message -->
    @if (toastMessage(); as message) {
      <div class="fixed bottom-20 md:bottom-10 right-10 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out">
        {{ message }}
      </div>
    }

    <!-- Popup Modal -->
    @if(showPopup() && stateService.activePopup(); as popup) {
      <div class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl max-w-sm w-full mx-4">
          <div class="relative">
            <img [src]="popup.imageUrl" [alt]="popup.title" class="w-full h-48 object-cover">
            <button (click)="closePopup()" class="absolute top-2 right-2 bg-white dark:bg-gray-700 rounded-full p-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div class="p-6 text-center">
            <h3 class="text-xl font-bold mb-2">{{ popup.title }}</h3>
            <button (click)="navigateToPopupLink(popup.link)" class="w-full bg-pink-500 text-white py-2 rounded-lg font-semibold hover:bg-pink-600 transition-colors">
              SHOP NOW
            </button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    GameAnalyticsComponent,
    PartnerProgramComponent,
    CouponsComponent,
    PullToRefreshComponent,
    TranslatePipe,
    ReturnRequestComponent
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