
export interface Transaction {
  userId: string;
  date: Date;
  type: 'Credit' | 'Debit';
  amount: number;
  description: string;
}
