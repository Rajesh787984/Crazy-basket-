
export interface Coupon {
  id: string;
  code: string;
  type: 'flat' | 'percent';
  value: number;
  expiryDate: string; // ISO string
  maxUses: number;
  usedCount: number;
}