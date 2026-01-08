import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  private firestore: Firestore = inject(Firestore);

  // आर्डर सेव करना
  async addProduct(data: any) {
    return addDoc(collection(this.firestore, 'orders'), { ...data, createdAt: new Date() });
  }

  // लिस्ट मंगाना
  async getProducts(collectionName: string = 'orders') {
    const q = query(collection(this.firestore, collectionName), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // अपडेट करना
  async updateOrder(id: string, data: any) {
    return updateDoc(doc(this.firestore, 'orders', id), data);
  }
}
