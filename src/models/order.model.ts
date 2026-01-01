
import { Product } from './product.model';
import { Address } from './address.model';

export type OrderStatus = 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Pending Verification';

export interface OrderItem {
  product: Product;
  size: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  date: Date;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: Address;
  paymentMethod: string;
  status: OrderStatus;
  transactionId?: string;
}