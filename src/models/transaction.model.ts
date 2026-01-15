
export interface Transaction {
  // FIX: Add 'id' property for unique identification in Firestore and state.
  id: string;
  userId: string;
  date: Date;
  type: 'Credit' | 'Debit';
  amount: number;
  description: string;
}
