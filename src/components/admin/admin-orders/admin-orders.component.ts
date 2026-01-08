import { Component, OnInit, inject, signal } from '@angular/core';
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
  private firestore = inject(Firestore);

  // ✅ Fix: Signal Use
  orders = signal<any[]>([]); 
  loading = signal<boolean>(true);
  
  orderStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

  ngOnInit() {
    this.loadOrders();
  }

  async loadOrders() {
    try {
      const data = await this.firestoreService.getProducts(); // यह orders ही लाएगा
      this.orders.set(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async updateStatus(orderId: string, event: Event) {
    const newStatus = (event.target as HTMLSelectElement).value;
    try {
      await updateDoc(doc(this.firestore, 'orders', orderId), { status: newStatus });
      alert('Status Updated');
    } catch (error) {
      console.error('Update failed:', error);
    }
  }

  printInvoice(order: any) {
    alert(`Printing for: ${order.customerName}`);
  }
}
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
