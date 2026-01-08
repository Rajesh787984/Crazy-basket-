import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../../services/firestore.service';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-orders.component.html'
})
export class AdminOrdersComponent implements OnInit {
  firestoreService = inject(FirestoreService);
  private firestore = inject(Firestore); // स्टेटस अपडेट करने के लिए

  orders: any[] = [];
  loading = true;
  
  orderStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

  ngOnInit() {
    this.loadOrders();
  }

  async loadOrders() {
    try {
      // पिछली बार हमने getProducts को 'orders' लाने के लिए सेट किया था
      this.orders = await this.firestoreService.getProducts();
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      this.loading = false;
    }
  }

  async updateStatus(orderId: string, event: Event) {
    const newStatus = (event.target as HTMLSelectElement).value;
    
    try {
      // 🔥 सीधे फायरबेस में स्टेटस अपडेट करें
      const orderRef = doc(this.firestore, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      
      alert(`Order #${orderId} updated to ${newStatus}`);
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update status');
    }
  }

  printInvoice(order: any) {
    // यह फीचर बाद में बनाएंगे, अभी सिर्फ अलर्ट
    alert(`Printing Invoice for: ${order.customerName}\nAmount: ₹${order.totalAmount}`);
  }
}
