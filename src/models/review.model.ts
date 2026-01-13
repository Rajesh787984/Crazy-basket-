

export interface Review {
  // FIX: Add 'id' property for unique identification in Firestore and state.
  id: string;
  productId: string;
  rating: number;
  comment: string;
  author: string;
  date: Date;
}
