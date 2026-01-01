
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
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
import { SignupComponent } from './components/signup/signup.component';
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


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
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
    SignupComponent,
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
    AdminCategoriesComponent,
    AdminReviewsComponent,
    ContactUsComponent,
    FaqComponent,
    AdminSettingsComponent,
    OutfitRecommenderComponent,
  ],
})
export class AppComponent {
  stateService = inject(StateService);
  currentView = this.stateService.currentView;
  isSidebarOpen = this.stateService.isSidebarOpen;
  toastMessage = this.stateService.toastMessage;
}