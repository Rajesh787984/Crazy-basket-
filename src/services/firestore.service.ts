import { Injectable } from '@angular/core';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  private db = getFirestore();
  private auth = getAuth();

  // ✅ Product add karne ke liye
  addProduct(product: any) {
    return addDoc(collection(this.db, 'products'), product);
  }

  // ✅ Product list lene ke liye
  async getProducts() {
    const snapshot = await getDocs(collection(this.db, 'products'));
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
  }

  // ✅ Signup ke baad user data save karne ke liye
  saveUser(extraData: any = {}) {
    const user = this.auth.currentUser;
    if (!user) return;

    return setDoc(doc(this.db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      ...extraData
    });
  }
        }
