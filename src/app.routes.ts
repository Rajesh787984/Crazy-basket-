import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/login/login.component';
import { OrdersComponent } from './components/orders/orders.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { SignupComponent } from './components/signup/signup.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';

export const routes: Routes = [
  // 1. जब कोई वेबसाइट खोले, तो सीधे Home पर जाए
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // 2. सारे ज़रूरी पेज
  { path: 'home', component: HomeComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'checkout', component: CheckoutComponent },
  
  // 3. प्रोडक्ट डिटेल पेज (id के साथ)
  { path: 'product/:id', component: ProductDetailComponent },

  // 4. अगर कोई गलत लिंक खोले, तो वापस Home भेज दें
  { path: '**', redirectTo: 'home' }
];
