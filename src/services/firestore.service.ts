
import { Injectable } from '@angular/core';
import { app } from '../firebase.config';
import {
  getFirestore,
  Firestore,
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  setDoc,
  deleteDoc,
  writeBatch,
  DocumentData,
  CollectionReference,
  DocumentReference,
  onSnapshot,
} from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private db: Firestore;

  constructor() {
    this.db = getFirestore(app);
  }
  
  /**
   * Provides direct access to the Firestore DB instance for advanced operations like batching.
   */
  getDb(): Firestore {
    return this.db;
  }

  async getCollection<T>(collectionName: string): Promise<T[]> {
    const colRef = collection(this.db, collectionName);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
  }

  async getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
    const docRef = doc(this.db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  }
  
  async addDocument<T extends object>(collectionName: string, data: T): Promise<string> {
    const colRef = collection(this.db, collectionName);
    const docRef = await addDoc(colRef, data);
    return docRef.id;
  }

  async setDocument(collectionName: string, docId: string, data: object): Promise<void> {
    const docRef = doc(this.db, collectionName, docId);
    return await setDoc(docRef, data, { merge: true });
  }

  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    const docRef = doc(this.db, collectionName, docId);
    return await deleteDoc(docRef);
  }

  listenToCollection<T>(collectionName: string, callback: (data: T[]) => void): () => void {
    const colRef = collection(this.db, collectionName);
    const unsubscribe = onSnapshot(colRef, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
      callback(data);
    }, (error) => {
        console.error(`[Firestore Listener Error] for collection '${collectionName}':`, error);
        callback([]); // On error, provide empty data to avoid crashes.
    });
    return unsubscribe;
  }
}
