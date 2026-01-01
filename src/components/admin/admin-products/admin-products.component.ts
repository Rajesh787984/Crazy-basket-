
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../services/state.service';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductsComponent {
  stateService = inject(StateService);
  productService = inject(ProductService);

  // We need to get products directly from the service to show all of them
  products = computed(() => this.productService.getAllProducts());

  addProduct() {
    this.stateService.navigateToAdminView('product-form');
  }

  editProduct(product: Product) {
    this.stateService.productToEdit.set(product);
    this.stateService.navigateToAdminView('product-form');
  }

  deleteProduct(productId: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(productId);
      // Force a re-computation by getting the signal again
      this.products = computed(() => this.productService.getAllProducts());
      this.stateService.showToast('Product deleted successfully.');
    }
  }

  getInStockCount(product: Product): number {
    return product.sizes.filter(s => s.inStock).length;
  }
}
