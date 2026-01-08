import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirestoreService } from '../../../services/firestore.service'; // सर्विस का सही रास्ता
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-manual-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 class="text-xl font-bold text-gray-800 mb-4">Cash on Delivery (COD)</h3>
      <p class="text-gray-600 mb-6 text-sm">Pay securely with cash when your order is delivered.</p>

      <div class="space-y-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input [(ngModel)]="name" type="text" class="w-full p-2 border rounded focus:ring-rose-500 focus:border-rose-500" placeholder="Enter name">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
          <input [(ngModel)]="mobile" type="text" class="w-full p-2 border rounded focus:ring-rose-500 focus:border-rose-500" placeholder="10-digit mobile number">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
          <textarea [(ngModel)]="address" rows="3" class="w-full p-2 border rounded focus:ring-rose-500 focus:border-rose-500" placeholder="Complete address with pincode"></textarea>
        </div>
      </div>

      <div class="bg-gray-50 p-3 rounded mb-6 text-sm flex justify-between font-bold">
        <span>Total Payable:</span>
        <span class="text-rose-600">₹{{ totalAmount }}</span>
      </div>

      <button 
        (click)="confirmOrder()" 
        [disabled]="loading"
        class="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2">
        <span *ngIf="loading" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
        {{ loading ? 'Processing...' : 'Place Order Now' }}
      </button>
    </div>
  `
})
export class ManualPaymentComponent {
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);
  private router = inject(Router);

  name = '';
  mobile = '';
  address = '';
  loading = false;
  totalAmount = 0;
  cartItems: any[] = [];

  constructor() {
    this.loadCartData();
  }

  loadCartData() {
    // 1. कोशिश करें कि लोकल स्टोरेज से डेटा मिल जाए
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this.totalAmount = this.cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
    }

    // 2. अगर यूजर लॉगिन है, तो उसका नाम/ईमेल पहले से भर दें
    const user = this.authService.currentUser();
    if (user) {
      this.name = user.displayName || '';
    }
  }

  async confirmOrder() {
    if (!this.name || !this.mobile || !this.address) {
      alert('Please fill in all details correctly!');
      return;
    }

    if (this.cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    this.loading = true;
    
    try {
      const user = this.authService.currentUser();
      
      const orderData = {
        userId: user?.uid || 'guest',
        customerName: this.name,
        customerMobile: this.mobile,
        shippingAddress: this.address,
        items: this.cartItems,
        totalAmount: this.totalAmount,
        paymentMethod: 'COD',
        status: 'Pending',
        orderDate: new Date().toISOString(),
        createdAt: new Date() // Firestore sorting के लिए
      };

      // 🔥 असली मैजिक: ऑर्डर फायरबेस में गया
      const docRef = await this.firestoreService.addProduct(orderData);
      
      console.log('Order Success:', docRef.id);
      
      // कार्ट खाली करें और सक्सेस पेज पर भेजें
      localStorage.removeItem('cart');
      
      // अगर 'order-confirmation' पेज है तो वहां भेजें, नहीं तो होम पर
      this.router.navigate(['/orders']); 
      alert('Order Placed Successfully! 🥳');

    } catch (error) {
      console.error('Order Failed:', error);
      alert('Order failed via Firebase. Please try again.');
    } finally {
      this.loading = false;
    }
  }
}
  }

  verifyAndPlaceOrder() {
    const utr = this.transactionId().trim();
    if (!utr || utr.length < 12 || !/^\d+$/.test(utr)) {
      this.stateService.showToast('Please enter a valid 12-digit Transaction ID/UTR.');
      return;
    }
    this.stateService.placeManualUpiOrder(utr);
  }
}
