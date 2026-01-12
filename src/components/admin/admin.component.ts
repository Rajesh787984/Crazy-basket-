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

  // ✅ Signals (Build Error ठीक करने के लिए)
  products = signal<any[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.loadProducts();
  }

  async loadProducts() {
    this.loading.set(true);
    try {
      const snapshot = await getDocs(collection(this.firestore, 'products'));
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      this.products.set(data);
    } catch (e) {
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }

  addProduct() { this.stateService.navigateToAdminView('product-form'); }

  editProduct(product: any) {
    this.stateService.productToEdit.set(product);
    this.stateService.navigateToAdminView('product-form');
  }

  async deleteProduct(productId: string) {
    if (confirm('Delete?')) {
      await deleteDoc(doc(this.firestore, 'products', productId));
      this.loadProducts();
    }
  }

  getInStockCount(product: any): number {
    return product.sizes ? product.sizes.filter((s: any) => s.inStock).length : 0;
  }
}
