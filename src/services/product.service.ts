
import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { Product } from '../models/product.model';
import { FirestoreService } from './firestore.service';
import { doc, writeBatch } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private firestore: FirestoreService = inject(FirestoreService);
  private products: WritableSignal<Product[]> = signal([]);
  
  private initialized: Promise<void>;
  private resolveInitialized!: () => void;

  constructor() {
    this.initialized = new Promise(resolve => this.resolveInitialized = resolve);
    this.initProducts();
  }

  public ensureInitialized(): Promise<void> {
    return this.initialized;
  }

  private async initProducts() {
    try {
      // Try to seed and load from Firestore
      await this.firestore.seedCollection('products', this.getMockProducts());
      const products = await this.firestore.getCollection<Product>('products');
      this.products.set(products);
      console.log('Successfully initialized products from Firestore.');
    } catch (error) {
      // On failure, log a warning and fall back to mock data
      console.warn('Firestore initialization for products failed. Falling back to mock data.', error);
      this.products.set(this.getMockProducts());
    } finally {
      // Always resolve the initialization promise
      this.resolveInitialized();
    }
  }

  getAllProducts(): Product[] {
    return this.products();
  }

  getProducts(category: string | null): Product[] {
    if (!category) {
        return this.products();
    }
    return this.products().filter(p => p.category === category);
  }

  getProductById(id: string): Product | undefined {
    return this.products().find((p) => p.id === id);
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
    this.products.update(p => [newProduct, ...p]);
  }

  async updateProduct(updatedProduct: Product) {
    try {
      await this.firestore.setDocument('products', updatedProduct.id, updatedProduct);
    } catch (error) {
      console.error('Firestore updateProduct failed:', error);
    }
    // Optimistic UI update
    this.products.update(products => products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  }

  async deleteProduct(productId: string) {
    try {
      await this.firestore.deleteDocument('products', productId);
    } catch (error) {
      console.error('Firestore deleteProduct failed:', error);
    }
    // Optimistic UI update
    this.products.update(products => products.filter(p => p.id !== productId));
  }

  async updateCategoryName(oldName: string, newName: string) {
    const updatedProducts = this.products().map(p => p.category === oldName ? { ...p, category: newName } : p);

    const batch = writeBatch(this.firestore.getDb());
    this.products().forEach(p => {
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
    this.products.set(updatedProducts);
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
    
    const updatedProducts = this.products().map(p => {
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
      this.products.set(updatedProducts);
    }
    
    return updatedCount;
  }
  
  private getMockProducts(): Product[] {
     return [
    // Men
    {
      id: '1',
      name: 'Polo Collar Slim Fit T-shirt',
      brand: 'Louis Philippe',
      price: 1064,
      originalPrice: 1499,
      b2bPrice: 950,
      discount: 29,
      rating: 4.4,
      reviews: 16000,
      images: ['https://picsum.photos/id/1025/400/600', 'https://picsum.photos/id/1026/400/600', 'https://picsum.photos/id/1027/400/600'],
      sizes: [ { name: 'S', inStock: true }, { name: 'M', inStock: true }, { name: 'L', inStock: false }, { name: 'XL', inStock: true }, { name: 'XXL', inStock: false }, ],
      details: ['Navy blue T-shirt for men', 'Solid', 'Regular length', 'Polo collar', 'Short, regular sleeves', 'Knitted cotton fabric', 'Button closure'],
      fit: 'Slim Fit',
      fabric: '60% Cotton, 40% Polyester',
      category: 'Men',
      tags: ['tshirt', 't-shirt', 'tee', 'top', 'polo', 'navy blue', 'men apparel'],
      isCodAvailable: true,
      videoUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
      flashSale: {
        price: 899,
        endDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
      },
      allowPhotoUpload: true,
      sizeChartUrl: 'https://picsum.photos/id/10/800/600',
      preorderAvailable: true,
       bundleOffer: {
        bundledProductId: '11',
        offerText: 'Buy with Slim Fit Jeans and save big!'
      }
    },
    {
      id: '2',
      name: 'Cotton Pure Cotton T-shirt',
      brand: 'H&M',
      price: 399,
      originalPrice: 499,
      b2bPrice: 350,
      discount: 20,
      rating: 4.2,
      reviews: 57800,
      images: ['https://picsum.photos/id/200/400/600', 'https://picsum.photos/id/201/400/600'],
      sizes: [ { name: 'S', inStock: true }, { name: 'M', inStock: true }, { name: 'L', inStock: true }, ],
      details: ['White T-shirt for men', 'Solid color', 'Round neck'],
      fit: 'Regular Fit',
      fabric: '100% Cotton',
      category: 'Men',
      tags: ['tshirt', 't-shirt', 'tee', 'top', 'white', 'men apparel', 'round neck'],
      isCodAvailable: true,
      allowPhotoUpload: false,
      preorderAvailable: false,
    },
    {
      id: '3',
      name: '3-Pack Regular Fit T-shirts',
      brand: 'H&M',
      price: 1199,
      originalPrice: 1499,
      b2bPrice: 1050,
      discount: 20,
      rating: 4.1,
      reviews: 9400,
      images: ['https://picsum.photos/id/305/400/600', 'https://picsum.photos/id/306/400/600'],
      sizes: [ { name: 'S', inStock: false }, { name: 'M', inStock: true }, { name: 'L', inStock: true }, { name: 'XL', inStock: true }, ],
      details: ['Pack of 3 t-shirts in different colors', 'Solid', 'Regular length'],
      fit: 'Regular Fit',
      fabric: '100% Cotton',
      category: 'Men',
      tags: ['tshirt', 't-shirt', 'tee', 'top', 'pack', 'combo', 'men apparel'],
      isCodAvailable: true,
      allowPhotoUpload: false,
      preorderAvailable: true,
    },
    {
      id: '9',
      name: 'Men Slim Fit Casual Shirt',
      brand: 'Roadster',
      price: 799,
      originalPrice: 1599,
      b2bPrice: 700,
      discount: 50,
      rating: 4.1,
      reviews: 22000,
      images: ['https://picsum.photos/id/322/400/600', 'https://picsum.photos/id/323/400/600'],
      sizes: [ { name: 'S', inStock: true }, { name: 'M', inStock: true }, { name: 'L', inStock: true }, { name: 'XL', inStock: true }, ],
      details: ['Checked casual shirt', 'Full sleeves', 'Spread collar'],
      fit: 'Slim Fit',
      fabric: '100% Cotton',
      category: 'Men',
      tags: ['shirt', 'casual shirt', 'checked', 'checks', 'men apparel'],
      isCodAvailable: true,
      allowPhotoUpload: false,
      sizeChartUrl: 'https://picsum.photos/id/11/800/600',
      preorderAvailable: false,
    },
    {
      id: '11',
      name: 'Mid-Rise Slim Fit Jeans',
      brand: 'Levi\'s',
      price: 1799,
      originalPrice: 2999,
      b2bPrice: 1650,
      discount: 40,
      rating: 4.5,
      reviews: 12000,
      images: ['https://picsum.photos/id/145/400/600', 'https://picsum.photos/id/146/400/600'],
      sizes: [ { name: '30', inStock: true }, { name: '32', inStock: true }, { name: '34', inStock: false }, { name: '36', inStock: true }, ],
      details: ['Blue dark wash 5-pocket jeans', 'Slim fit, mid-rise', 'Stretchable denim'],
      fit: 'Slim Fit',
      fabric: '98% Cotton, 2% Elastane',
      category: 'Men',
      tags: ['jeans', 'denim', 'pants', 'bottoms', 'blue', 'men apparel'],
      isCodAvailable: true,
      allowPhotoUpload: false,
      preorderAvailable: true,
    },
    {
      id: '12',
      name: 'Men Solid Running Shoes',
      brand: 'Puma',
      price: 2499,
      originalPrice: 4999,
      b2bPrice: 2200,
      discount: 50,
      rating: 4.3,
      reviews: 8500,
      images: ['https://picsum.photos/id/211/400/600', 'https://picsum.photos/id/212/400/600'],
      sizes: [ { name: '8', inStock: true }, { name: '9', inStock: true }, { name: '10', inStock: false }, { name: '11', inStock: true }, ],
      details: ['Mesh upper for breathability', 'Lace-up closure', 'Cushioned footbed'],
      fit: 'Regular',
      fabric: 'Mesh',
      category: 'Men',
      tags: ['shoes', 'footwear', 'sneakers', 'running', 'sports', 'men footwear'],
      isCodAvailable: true,
      allowPhotoUpload: false,
      preorderAvailable: false,
    },
    // Women
    {
      id: '4',
      name: 'Printed Kurta Set',
      brand: 'Anouk',
      price: 1259,
      originalPrice: 3499,
      b2bPrice: 1100,
      discount: 64,
      rating: 4.3,
      reviews: 2100,
      images: ['https://picsum.photos/id/401/400/600', 'https://picsum.photos/id/402/400/600'],
      sizes: [ { name: 'M', inStock: true }, { name: 'L', inStock: true }, { name: 'XL', inStock: false }, ],
      details: ['Beautiful printed kurta', 'Comes with palazzos', 'Three-quarter sleeves'],
      fit: 'Regular Fit',
      fabric: 'Viscose Rayon',
      category: 'Women',
      tags: ['kurta', 'kurta set', 'ethnic', 'traditional', 'indian wear', 'women apparel'],
      isCodAvailable: true,
      allowPhotoUpload: false,
      preorderAvailable: true,
    },
    {
      id: '5',
      name: 'Floral Print Top',
      brand: 'Tokyo Talkies',
      price: 454,
      originalPrice: 999,
      b2bPrice: 400,
      discount: 55,
      rating: 4.0,
      reviews: 12000,
      images: ['https://picsum.photos/id/503/400/600', 'https://picsum.photos/id/504/400/600'],
      sizes: [ { name: 'S', inStock: true }, { name: 'M', inStock: true }, { name: 'L', inStock: true }, ],
      details: ['Stylish floral print', 'Puff sleeves', 'Square neck'],
      fit: 'Slim Fit',
      fabric: 'Polyester',
      category: 'Women',
      tags: ['top', 'floral', 'women apparel', 'blouse'],
      isCodAvailable: false,
      allowPhotoUpload: false,
      preorderAvailable: false,
    },
    {
      id: '6',
      name: 'High-Rise Jeans',
      brand: 'Mast & Harbour',
      price: 899,
      originalPrice: 1999,
      b2bPrice: 800,
      discount: 55,
      rating: 4.2,
      reviews: 15000,
      images: ['https://picsum.photos/id/601/400/600', 'https://picsum.photos/id/602/400/600'],
      sizes: [ { name: '28', inStock: true }, { name: '30', inStock: true }, { name: '32', inStock: false } ],
      details: ['Blue medium wash 5-pocket jeans', 'High-rise, skinny fit', 'Stretchable denim'],
      fit: 'Skinny Fit',
      fabric: 'Cotton Blend',
      category: 'Women',
      tags: ['jeans', 'denim', 'pants', 'bottoms', 'blue', 'women apparel'],
      isCodAvailable: true,
      allowPhotoUpload: false,
      preorderAvailable: false,
    },
   ];
  }
}
