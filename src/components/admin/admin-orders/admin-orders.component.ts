
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../../services/state.service';
import { Order, OrderStatus } from '../../../models/order.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  imports: [CommonModule, NgOptimizedImage, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrdersComponent {
  stateService: StateService = inject(StateService);
  
  orderStatuses: OrderStatus[] = ['Pending Verification', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
  
  selectedOrder = signal<Order | null>(null);
  statusFilter = signal<OrderStatus | 'all'>('all');
  searchQuery = signal('');

  filteredOrders = computed(() => {
    let orders = this.stateService.orders();
    const status = this.statusFilter();
    const query = this.searchQuery().toLowerCase().trim();

    if (status !== 'all') {
      orders = orders.filter(o => o.status === status);
    }
    
    if (query) {
      orders = orders.filter(o => 
        o.id.toLowerCase().includes(query) || 
        this.getUserForOrder(o)?.name.toLowerCase().includes(query)
      );
    }

    return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  updateStatus(orderId: string, event: Event) {
    const newStatus = (event.target as HTMLSelectElement).value as OrderStatus;
    this.stateService.updateOrderStatus(orderId, newStatus);
  }
  
  getUserForOrder(order: Order): User | undefined {
    return this.stateService.users().find(u => u.id === order.userId);
  }

  viewDetails(order: Order) {
    this.selectedOrder.set(order);
  }

  closeDetails() {
    this.selectedOrder.set(null);
  }
  
  copyForShiprocket(order: Order) {
    const address = order.shippingAddress;
    const paymentMethod = order.paymentMethod === 'COD' ? 'COD' : 'Prepaid';
    const shiprocketText = [
      `Order ID: ${order.id}`,
      `Customer Name: ${address.name}`,
      `Address: ${address.address}, ${address.locality}`,
      `City: ${address.city}`,
      `State: ${address.state}`,
      `Pincode: ${address.pincode}`,
      `Phone: ${address.mobile}`,
      `Product Name: ${order.items.map(i => i.product.name).join(', ')}`,
      `SKU: ${order.items.map(i => i.product.id).join(', ')}`,
      `Quantity: ${order.items.reduce((acc, i) => acc + i.quantity, 0)}`,
      `Total Amount: ${order.totalAmount}`,
      `Payment Method: ${paymentMethod}`
    ].join('\n');
    navigator.clipboard.writeText(shiprocketText).then(() => {
      this.stateService.showToast('Shiprocket details copied to clipboard!');
    });
  }

  printDocument(order: Order, type: 'invoice' | 'label') {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const content = type === 'invoice' ? this.getInvoiceHtml(order) : this.getLabelHtml(order);
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.focus();
      // Use a timeout to ensure content is rendered before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  }

  private getInvoiceHtml(order: Order): string {
    const user = this.getUserForOrder(order);
    const companyInfo = this.stateService.contactInfo();
    const itemsHtml = order.items.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;">${item.product.name} (Size: ${item.size})</td>
            <td style="padding: 10px; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; text-align: right;">₹${item.price.toFixed(2)}</td>
            <td style="padding: 10px; text-align: right;">₹${(item.quantity * item.price).toFixed(2)}</td>
        </tr>
    `).join('');

    return `
      <html>
        <head>
          <title>Invoice #${order.id}</title>
          <style>
            body { font-family: sans-serif; margin: 20px; color: #333; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); font-size: 16px; line-height: 24px; }
            .invoice-box table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
            .invoice-box table td { padding: 5px; vertical-align: top; }
            .invoice-box table tr.top table td { padding-bottom: 20px; }
            .invoice-box table tr.top table td.title { font-size: 45px; line-height: 45px; color: #333; }
            .invoice-box table tr.information table td { padding-bottom: 40px; }
            .invoice-box table tr.heading td { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; }
            .invoice-box table tr.total td:last-child { border-top: 2px solid #eee; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <table cellpadding="0" cellspacing="0">
              <tr class="top">
                <td colspan="4">
                  <table>
                    <tr>
                      <td class="title">Crazy Basket</td>
                      <td>
                        Invoice #: ${order.id}<br>
                        Created: ${new Date(order.date).toLocaleDateString()}<br>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr class="information">
                <td colspan="4">
                  <table>
                    <tr>
                      <td>
                        <strong>From:</strong><br>
                        Crazy Basket<br>
                        ${companyInfo.address || '123 Fashion Ave, Style City, 560001'}<br>
                        ${companyInfo.email || 'support@crazybasket.com'}
                      </td>
                       <td>
                        <strong>Bill To:</strong><br>
                        ${order.shippingAddress.name}<br>
                        ${order.shippingAddress.address}, ${order.shippingAddress.locality}<br>
                        ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br>
                        ${user?.email || ''}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr class="heading">
                <td>Item</td>
                <td style="text-align: center;">Quantity</td>
                <td style="text-align: right;">Price</td>
                <td style="text-align: right;">Subtotal</td>
              </tr>
              ${itemsHtml}
              <tr class="total">
                <td colspan="3" style="text-align: right; padding-top: 20px;"><strong>Total:</strong></td>
                <td style="text-align: right; padding-top: 20px;"><strong>₹${order.totalAmount.toFixed(2)}</strong></td>
              </tr>
            </table>
          </div>
        </body>
      </html>
    `;
  }

  private getLabelHtml(order: Order): string {
    const address = order.shippingAddress;
    return `
      <html>
        <head>
          <title>Shipping Label - ${order.id}</title>
          <style>
            @page { size: 4in 6in; margin: 0; }
            body { font-family: sans-serif; margin: 0; padding: 0.25in; box-sizing: border-box; width: 4in; height: 6in; }
            .label-box { width: 100%; height: 100%; border: 2px solid black; padding: 0.25in; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
            .to-address { font-size: 16pt; line-height: 1.4; }
            .from-address { font-size: 10pt; border-top: 1px solid black; padding-top: 0.1in; }
            h1 { margin: 0; padding: 0; font-size: 14pt;}
            h2 { margin: 0; padding: 0; font-size: 10pt; font-weight: normal; }
          </style>
        </head>
        <body>
          <div class="label-box">
            <div class="from-address">
              <strong>FROM:</strong><br>
              Crazy Basket<br>
              123 Fashion Ave<br>
              Style City, 560001
            </div>
            <div class="to-address">
              <strong>TO:</strong><br>
              <strong>${address.name.toUpperCase()}</strong><br>
              ${address.address.toUpperCase()}, ${address.locality.toUpperCase()}<br>
              ${address.city.toUpperCase()}, ${address.state.toUpperCase()} - <strong>${address.pincode}</strong><br>
              PHONE: ${address.mobile}
            </div>
             <div style="text-align: center;">
              <h1>Order ID: ${order.id}</h1>
              ${order.paymentMethod === 'COD' ? `<h2>COD Amount: ₹${order.totalAmount.toFixed(2)}</h2>` : '<h2>PREPAID</h2>'}
             </div>
          </div>
        </body>
      </html>
    `;
  }
}