import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../../services/state.service';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-admin-flash-sales',
  templateUrl: './admin-flash-sales.component.html',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminFlashSalesComponent {
  stateService: StateService = inject(StateService);
  productService: ProductService = inject(ProductService);

  products = computed(() => this.productService.getAllProducts());
  editingProduct = signal<{ product: Product, salePrice: number, endDate: string } | null>(null);

  isSaleActive(product: Product): boolean {
    if (!product.flashSale) {
      return false;
    }
    return new Date(product.flashSale.endDate) > new Date();
  }

  startEditing(product: Product) {
    const salePrice = product.flashSale?.price || product.price * 0.9;
    const endDate = product.flashSale?.endDate ? this.formatDateForInput(product.flashSale.endDate) : this.formatDateForInput(new Date(Date.now() + 24 * 3600 * 1000).toISOString());
    
    this.editingProduct.set({
      product,
      salePrice: Math.round(salePrice),
      endDate
    });
  }

  saveFlashSale() {
    const editData = this.editingProduct();
    if (!editData) return;

    if (editData.salePrice <= 0 || !editData.endDate) {
      this.stateService.showToast('Please enter a valid price and end date.');
      return;
    }

    const updatedProduct = { ...editData.product };
    updatedProduct.flashSale = {
      price: editData.salePrice,
      endDate: new Date(editData.endDate).toISOString(),
    };
    
    this.productService.updateProduct(updatedProduct);
    this.stateService.showToast(`Flash sale updated for ${updatedProduct.name}.`);
    this.cancelEditing();
  }
  
  removeFlashSale(product: Product) {
    if (confirm(`Are you sure you want to remove the flash sale from "${product.name}"?`)) {
        const updatedProduct = { ...product };
        delete updatedProduct.flashSale;
        this.productService.updateProduct(updatedProduct);
        this.stateService.showToast(`Flash sale removed for ${product.name}.`);
    }
  }

  cancelEditing() {
    this.editingProduct.set(null);
  }

  private formatDateForInput(isoDate: string): string {
    const date = new Date(isoDate);
    // Adjust for timezone offset to display correctly in local time
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16);
  }
}