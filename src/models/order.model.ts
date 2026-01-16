import { Product } from './product.model';
import { Address } from './address.model';

export type OrderStatus = 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Pending Verification';
export type ReturnStatus = 'Pending' | 'Approved' | 'Rejected';

export interface OrderItem {
  id: string; // Unique ID for this item within the order
  product: Product;
  size: string;
  quantity: number;
  price: number;
  customization?: {
    photoPreviewUrl: string;
    fileName: string;
  };
  returnRequest?: {
    requestDate: string; // ISO string
    returnType: 'Refund' | 'Exchange';
    refundMethod: 'Original Payment Method' | 'Wallet';
    reason: string;
    comment: string;
    photoUrl?: string;
    status: ReturnStatus;
  }
}

export interface Order {
  id: string;
  userId: string;
  date: Date;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: Address;
  paymentMethod: string;
  status: OrderStatus;
  transactionId?: string;
  expectedDeliveryDate?: Date;
  statusHistory?: { status: OrderStatus; date: Date }[];
}