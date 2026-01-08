import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/login/login.component';
// Checkout और Signup हटा दिया क्योंकि उनकी फाइलें मिसिंग थीं
import { ManualPaymentComponent } from './components/checkout/manual-payment/manual-payment.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'login', component: LoginComponent },
  
  // Checkout की जगह सीधे Manual Payment खोलेंगे
  { path: 'checkout', component: ManualPaymentComponent },
  
  { path: '**', redirectTo: 'home' }
];
