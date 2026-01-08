import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirestoreService } from '../../../services/firestore.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-manual-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 bg-white rounded shadow-md max-w-md mx-auto mt-10">
      <h2 class="text-xl font-bold mb-4">Cash on Delivery</h2>
      <input [(ngModel)]="name" placeholder="Full Name" class="w-full border p-2 mb-2 rounded">
      <input [(ngModel)]="mobile" placeholder="Mobile Number" class="w-full border p-2 mb-2 rounded">
      <textarea [(ngModel)]="address" placeholder="Address" class="w-full border p-2 mb-4 rounded"></textarea>
      
      <button (click)="confirmOrder()" [disabled]="loading" class="w-full bg-rose-600 text-white p-3 rounded font-bold">
        {{ loading ? 'Processing...' : 'Confirm Order' }}
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
  totalAmount = 999; // Demo amount

  async confirmOrder() {
    if (!this.name || !this.mobile) return alert('Fill all details');
    this.loading = true;
    
    try {
      const user = this.authService.currentUser();
      await this.firestoreService.addProduct({
        customerName: this.name,
        customerMobile: this.mobile,
        shippingAddress: this.address,
        userId: user?.uid || 'guest',
        status: 'Pending',
        totalAmount: this.totalAmount,
        createdAt: new Date()
      });
      alert('Order Placed! 🎉');
      this.router.navigate(['/home']);
    } catch (e) {
      console.error(e);
      alert('Error placing order');
    } finally {
      this.loading = false;
    }
  }
}
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
