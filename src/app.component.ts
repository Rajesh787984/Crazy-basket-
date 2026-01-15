import { Component, ChangeDetectionStrategy, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule, NgOptimizedImage, DOCUMENT } from '@angular/common';
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
import { ManageAddressesComponent } from './components/manage-addresses/manage-addresses.component';
import { MyntraInsiderComponent } from './components/myntra-insider/myntra-insider.component';
import { AdminComponent } from './components/admin/admin.component';
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';
import { LanguageSettingsComponent } from './components/language-settings/language-settings.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { AdminCategoriesComponent } from './components/admin/admin-categories/admin-categories.component';
import { AdminReviewsComponent } from './components/admin/admin-reviews/admin-reviews.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { FaqComponent } from './components/faq/faq.component';
import { AdminSettingsComponent } from './components/admin/admin-settings/admin-settings.component';
import { AdminBulkUpdaterComponent } from './components/admin/admin-bulk-updater/admin-bulk-updater.component';
import { AdminFlashSalesComponent } from './components/admin/admin-flash-sales/admin-flash-sales.component';
import { WalletComponent } from './components/wallet/wallet.component';
import { AdminHomepageComponent } from './components/admin/admin-homepage/admin-homepage.component';
import { AdminPopupsComponent } from './components/admin/admin-popups/admin-popups.component';
import { AdminLiveChatComponent } from './components/admin/admin-live-chat/admin-live-chat.component';
import { RecentlyViewedComponent } from './components/recently-viewed/recently-viewed.component';
import { CountdownTimerComponent } from './components/countdown-timer/countdown-timer.component';
import { AdminPaymentsComponent } from './components/admin/admin-payments/admin-payments.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
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
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { PaymentSummaryComponent } from './components/checkout/payment-summary/payment-summary.component';
import { SeoService } from './services/seo.service';
import { ComparisonTrayComponent } from './components/comparison-tray/comparison-tray.component';
import { ProductComparisonComponent } from './components/product-comparison/product-comparison.component';
import { AdminBannersComponent } from './components/admin/admin-banners/admin-banners.component';


declare var Tawk_API: any;

@Component({
  selector: 'app-root',
  template: `
    @if (currentView() === 'admin') {
      <app-admin></app-admin>
    } @else {
      <div [class.blur-sm]="showPopup()" class="transition-all duration-300 overflow-x-hidden">
        <div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
          @if (!isImpersonating()) {
            <app-header></app-header>
          } @else {
            <div class="bg-yellow-400 text-black text-center p-2 font-bold">
              You are impersonating {{ stateService.currentUser()?.name }}. 
              <button (click)="stateService.stopImpersonating()" class="underline ml-4">Return to Admin</button>
            </div>
          }
          
          @if(currentView() === 'home') {
            <!-- Shop by Category -->
            <section class="p-4 lg:hidden" aria-labelledby="category-heading">
              <h2 id="category-heading" class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">SHOP BY CATEGORY</h2>
              <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-4">
                @for(category of categories(); track category.id; let i = $index) {
                  <div (click)="selectCategory(category.name)" class="text-center cursor-pointer group">
                    <div class="w-16 h-16 lg:w-20 lg:h-20 mx-auto rounded-full overflow-hidden shadow-md group-hover:shadow-lg transition-shadow transform group-hover:scale-105 duration-300" [class]="category.bgColor">
                      <img [ngSrc]="category.img" [alt]="category.name" width="80" height="80" class="w-full h-full object-cover" [priority]="i < 8">
                    </div>
                    <p class="mt-2 font-semibold text-xs lg:text-sm text-gray-700 dark:text-gray-300">{{ category.name }}</p>
                  </div>
                }
              </div>
            </section>
          }

          @if(currentView() === 'home' && smallBanner(); as banner) {
            <section class="px-4 py-2 lg:px-0" aria-label="Special Offer">
              <div class="max-w-7xl mx-auto">
                <div (click)="onSmallBannerClick(banner.link)" class="cursor-pointer group overflow-hidden rounded-lg shadow-md">
                    <img [ngSrc]="banner.img" alt="Special Offer Banner" width="1200" height="200" class="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300" priority>
                </div>
              </div>
            </section>
          }

          <div class="flex flex-1 overflow-y-hidden w-full">
            <app-sidebar [isOpen]="isSidebarOpen()"></app-sidebar>

            <app-pull-to-refresh class="flex-grow min-w-0">
              <main class="overflow-y-auto h-full pb-16 md:pb-0">
                <div [class.max-w-7xl]="currentView() !== 'home'" 
                    [class.mx-auto]="currentView() !== 'home'" 
                    [class.px-4]="currentView() !== 'home'" 
                    [class.sm:px-6]="currentView() !== 'home'" 
                    [class.lg:px-8]="currentView() !== 'home'"
                    [class.py-6]="currentView() !== 'home'">
                  @defer {
                    @switch (currentView()) {
                      @case ('home') { <app-home></app-home> }
                      @case ('productList') { <app-product-list></app-product-list> }
                      @case ('productDetail') { <app-product-detail></app-product-detail> }
                      @case ('cart') { <app-cart></app-cart> }
                      @case ('profile') { <app-profile></app-profile> }
                      @case ('login') { <app-login></app-login> }
                      @case ('address') { <app-address></app-address> }
                      @case ('manage-addresses') { <app-manage-addresses></app-manage-addresses> }
                      @case ('payment') { <app-payment></app-payment> }
                      @case ('manual-payment') { <app-manual-payment></app-manual-payment> }
                      @case ('orderConfirmation') { <app-order-confirmation></app-order-confirmation> }
                      @case ('orders') { <app-order-history></app-order-history> }
                      @case ('address-form') { <app-address-form></app-address-form> }
                      @case ('myntra-insider') { <app-myntra-insider></app-myntra-insider> }
                      @case ('profile-edit') { <app-profile-edit></app-profile-edit> }
                      @case ('language-settings') { <app-language-settings></app-language-settings> }
                      @case ('privacy-policy') { <app-privacy-policy></app-privacy-policy> }
                      @case ('contact-us') { <app-contact-us></app-contact-us> }
                      @case ('faq') { <app-faq></app-faq> }
                      @case ('wallet') { <app-wallet></app-wallet> }
                      @case ('wishlist') { <app-wishlist></app-wishlist> }
                      @case ('partner-program') { <app-partner-program></app-partner-program> }
                      @case ('coupons') { <app-coupons></app-coupons> }
                      @case ('return-request') { <app-return-request></app-return-request> }
                      @case ('productComparison') { <app-product-comparison></app-product-comparison> }
                      @default {
                        <div class="p-8 text-center">
                          <h2 class="text-2xl font-bold">Page Not Found</h2>
                          <p>The view '{{ currentView() }}' does not exist.</p>
                        </div>
                      }
                    }
                  } @placeholder {
                    <app-loading-spinner></app-loading-spinner>
                  } @loading (minimum 100ms) {
                    <app-loading-spinner></app-loading-spinner>
                  }
                </div>
              </main>
            </app-pull-to-refresh>
          </div>
          
          @if (!isImpersonating()) {
            <app-bottom-nav class="md:hidden sticky bottom-0"></app-bottom-nav>
          }
        </div>
      </div>
      <app-comparison-tray></app-comparison-tray>
    }

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
            <img [ngSrc]="popup.imageUrl" [alt]="popup.title" class="w-full h-48 object-cover" width="384" height="192" priority>
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
    ManageAddressesComponent,
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
    AdminCategoriesComponent,
    AdminReviewsComponent,
    ContactUsComponent,
    FaqComponent,
    AdminSettingsComponent,
    AdminBulkUpdaterComponent,
    AdminFlashSalesComponent,
    WalletComponent,
    AdminHomepageComponent,
    AdminPopupsComponent,
    AdminLiveChatComponent,
    RecentlyViewedComponent,
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
    ReturnRequestComponent,
    LoadingSpinnerComponent,
    PaymentSummaryComponent,
    NgOptimizedImage,
    ComparisonTrayComponent,
    ProductComparisonComponent
  ],
  host: {
    '[class.is-admin-view]': 'currentView() === "admin"'
  },
})
export class AppComponent implements OnInit {
  stateService: StateService = inject(StateService);
  private seoService: SeoService = inject(SeoService);
  private document: Document = inject(DOCUMENT);
  
  currentView = this.stateService.currentView;
  isSidebarOpen = this.stateService.isSidebarOpen;
  toastMessage = this.stateService.toastMessage;
  isImpersonating = this.stateService.isImpersonating;
  currentUser = this.stateService.currentUser;
  smallBanner = this.stateService.smallBanner;
  categories = this.stateService.categories;

  showPopup = signal(false);

  constructor() {
    // Effect to remove splash screen
    effect(() => {
      if (this.stateService.isInitialDataLoaded()) {
        const splashElement = this.document.getElementById('splash-screen');
        if (splashElement) {
          splashElement.style.opacity = '0';
          // Wait for fade-out transition to complete before removing from DOM
          setTimeout(() => {
            splashElement.remove();
          }, 500);
        }
      }
    });
    
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

    // SEO effect for generic pages
    effect(() => {
      const view = this.currentView();
      switch(view) {
        case 'cart':
          this.seoService.updateTitle('Your Shopping Bag');
          this.seoService.updateDescription('Review the items in your shopping bag and proceed to checkout.');
          this.seoService.updateJsonLd(null);
          break;
        case 'profile':
          this.seoService.updateTitle('Your Profile');
          this.seoService.updateDescription('Manage your profile, orders, addresses, and more on Crazy Basket.');
          this.seoService.updateJsonLd(null);
          break;
        case 'login':
          this.seoService.updateTitle('Login or Signup');
          this.seoService.updateDescription('Login to your Crazy Basket account or create a new one to start shopping.');
          this.seoService.updateJsonLd(null);
          break;
        // The default case will be handled by HomeComponent, ProductListComponent, etc.
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

  onSmallBannerClick(link: string) {
    this.stateService.navigateTo(link);
  }

  selectCategory(categoryName: string) {
    this.stateService.navigateTo('productList', { category: categoryName });
  }
}