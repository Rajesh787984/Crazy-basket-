import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor() {}

  addProduct(product: any): Promise<any> {
    console.warn('Firestore is disabled. addProduct did nothing.');
    return Promise.resolve();
  }

  async getProducts(): Promise<any[]> {
    console.warn('Firestore is disabled. getProducts returned empty array.');
    return Promise.resolve([]);
  }

  saveUser(extra: any = {}): Promise<void> {
    console.warn('Firestore is disabled. saveUser did nothing.');
    return Promise.resolve();
  }
}
