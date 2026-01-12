import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/login/login.component';
// ✅ हम Checkout के लिए सीधे Manual Payment वाली फाइल इस्तेमाल करेंगे
import { ManualPaymentComponent } from './components/checkout/manual-payment/manual-payment.component';

export const routes: Routes = [
  // 1. जब कोई वेबसाइट खोले, तो Home पर जाए
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // 2. ज़रूरी पेज
  { path: 'home', component: HomeComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'login', component: LoginComponent },
  
  // 3. Checkout का सही रास्ता
  { path: 'checkout', component: ManualPaymentComponent },
  
  // 4. अगर कोई गलत लिंक खोले, तो वापस Home भेज दें
  { path: '**', redirectTo: 'home' }
];
