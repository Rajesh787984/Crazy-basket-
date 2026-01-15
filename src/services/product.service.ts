
import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { Product, ProductSize } from '../models/product.model';
import { FirestoreService } from './firestore.service';
import { doc, writeBatch } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private firestore: FirestoreService = inject(FirestoreService);
  private _products = signal<Product[]>([]);
  public readonly products = this._products.asReadonly();

  private productsLoadedResolver!: () => void;
  public productsLoaded = new Promise<void>(resolve => {
    this.productsLoadedResolver = resolve;
  });

  constructor() {
    this.initProducts();
  }

  private async initProducts() {
    try {
      const products = await this.firestore.getCollection<Product>('products');
      this._products.set(products);
      if (products.length > 0) {
        console.log(`Successfully initialized ${products.length} products from Firestore.`);
      } else {
        console.warn('No products found in Firestore. Product list will be empty.');
      }
    } catch (error) {
      console.error('Failed to load products from Firestore. Product list will be empty.', error);
      this._products.set([]);
    } finally {
      this.productsLoadedResolver();
    }
  }

  getAllProducts(): Product[] {
    return this._products();
  }

  getProducts(category: string | null): Product[] {
    if (!category) {
        return this._products();
    }
    return this._products().filter(p => p.category === category);
  }

  getProductById(id: string): Product | undefined {
    return this._products().find((p) => p.id === id);
  }

  async addProduct(product: Omit<Product, 'id'>) {
    const newId = `prod_${Date.now()}`;
    const newProduct: Product = { ...product, id: newId };
    try {
      await this.firestore.setDocument('products', newId, newProduct);
    } catch (error) {
      console.error('Firestore addProduct failed:', error);
    }
    // Optimistic UI update
    this._products.update(p => [newProduct, ...p]);
  }

  async updateProduct(updatedProduct: Product) {
    try {
      await this.firestore.setDocument('products', updatedProduct.id, updatedProduct);
    } catch (error) {
      console.error('Firestore updateProduct failed:', error);
    }
    // Optimistic UI update
    this._products.update(products => products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  }

  async deleteProduct(productId: string) {
    try {
      await this.firestore.deleteDocument('products', productId);
    } catch (error) {
      console.error('Firestore deleteProduct failed:', error);
    }
    // Optimistic UI update
    this._products.update(products => products.filter(p => p.id !== productId));
  }

  async updateCategoryName(oldName: string, newName: string) {
    const updatedProducts = this._products().map(p => p.category === oldName ? { ...p, category: newName } : p);

    const batch = writeBatch(this.firestore.getDb());
    this._products().forEach(p => {
      if (p.category === oldName) {
        const docRef = doc(this.firestore.getDb(), 'products', p.id);
        batch.update(docRef, { category: newName });
      }
    });
    try {
      await batch.commit();
    } catch (error) {
      console.error('Firestore updateCategoryName failed:', error);
    }
    
    // Optimistic UI update
    this._products.set(updatedProducts);
  }

  async bulkUpdatePrices(
    type: 'category' | 'brand',
    name: string,
    updateType: 'percent' | 'flat',
    direction: 'increase' | 'decrease',
    value: number
  ): Promise<number> {
    let updatedCount = 0;
    const batch = writeBatch(this.firestore.getDb());
    
    const updatedProducts = this._products().map(p => {
      let productMatches = false;
      if ((type === 'category' && p.category === name) || (type === 'brand' && p.brand === name)) {
        productMatches = true;
      }

      if (productMatches) {
        let newPrice = p.price;
        if (updateType === 'percent') {
          const change = p.originalPrice * (value / 100);
          newPrice = direction === 'increase' ? p.price + change : p.price - change;
        } else { // flat amount
          // FIX: The variable 'change' was used here by mistake instead of 'value'.
          newPrice = direction === 'increase' ? p.price + value : p.price - value;
        }

        const finalPrice = Math.round(Math.max(1, Math.min(newPrice, p.originalPrice)));

        if (finalPrice !== p.price) {
          const newDiscount = Math.round(((p.originalPrice - finalPrice) / p.originalPrice) * 100);
          const updatedProduct = { ...p, price: finalPrice, discount: newDiscount };
          
          const docRef = doc(this.firestore.getDb(), 'products', p.id);
          batch.update(docRef, { price: finalPrice, discount: newDiscount });
          
          updatedCount++;
          return updatedProduct;
        }
      }
      return p;
    });

    if (updatedCount > 0) {
      try {
        await batch.commit();
      } catch (error) {
        console.error('Firestore bulkUpdatePrices failed:', error);
      }
      // Optimistic UI update
      this._products.set(updatedProducts);
    }
    
    return updatedCount;
  }
}
