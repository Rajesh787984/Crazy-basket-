import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../services/state.service';
import { Firestore, collection, getDocs, doc, deleteDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-products.component.html'
})
export class AdminProductsComponent implements OnInit {
  stateService = inject(StateService);
  private firestore = inject(Firestore);

  // ✅ Fix: Array की जगह Signal का इस्तेमाल
  products = signal<any[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.loadProducts();
  }

  async loadProducts() {
    this.loading.set(true);
    try {
      const colRef = collection(this.firestore, 'products');
      const snapshot = await getDocs(colRef);
      
      const data = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      
      // ✅ Signal Update
      this.products.set(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      this.loading.set(false);
    }
  }

  addProduct() {
    this.stateService.navigateToAdminView('product-form');
  }

  editProduct(product: any) {
    this.stateService.productToEdit.set(product);
    this.stateService.navigateToAdminView('product-form');
  }

  async deleteProduct(productId: string) {
    if (confirm('Are you sure?')) {
      try {
        await deleteDoc(doc(this.firestore, 'products', productId));
        this.loadProducts(); 
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  }

  // ✅ यह फंक्शन अब क्लास के अंदर है (पहले बाहर छूट गया था)
  getInStockCount(product: any): number {
    return product.sizes ? product.sizes.filter((s: any) => s.inStock).length : 0;
  }
}
