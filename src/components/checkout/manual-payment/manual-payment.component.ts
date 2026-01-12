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
      <input [(ngModel)]="name" placeholder="Name" class="w-full border p-2 mb-2 rounded">
      <input [(ngModel)]="mobile" placeholder="Mobile" class="w-full border p-2 mb-2 rounded">
      <textarea [(ngModel)]="address" placeholder="Address" class="w-full border p-2 mb-4 rounded"></textarea>
      
      <button (click)="confirmOrder()" [disabled]="loading" class="w-full bg-blue-600 text-white font-bold p-3 rounded">
        {{ loading ? 'Processing...' : 'Confirm Order' }}
      </button>
    </div>
  `
})
export class ManualPaymentComponent {
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);
  private router = inject(Router);

  name = ''; mobile = ''; address = ''; loading = false;

  async confirmOrder() {
    if (!this.name || !this.mobile) return alert('Fill details');
    this.loading = true;
    try {
      const user = this.authService.currentUser();
      await this.firestoreService.addProduct({
        collectionName: 'orders', // Firestore में orders नाम से सेव होगा
        data: {
          customerName: this.name,
          customerMobile: this.mobile,
          shippingAddress: this.address,
          userId: user?.uid || 'guest',
          status: 'Pending',
          totalAmount: 999,
          createdAt: new Date().toISOString()
        }
      });
      alert('Order Placed! 🎉');
      this.router.navigate(['/home']);
    } catch (e) {
      console.error(e);
      alert('Order Failed');
    } finally {
      this.loading = false;
    }
  }
}
