
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StateService } from '../../services/state.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-recently-viewed',
  templateUrl: './recently-viewed.component.html',
  imports: [CommonModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentlyViewedComponent {
  stateService: StateService = inject(StateService);
  productService: ProductService = inject(ProductService);

  recentlyViewedProducts = computed(() => {
    return this.stateService.recentlyViewed()
      .map(id => this.productService.getProductById(id))
      .filter((p): p is Product => p !== undefined);
  });

  viewProduct(productId: string) {
    this.stateService.navigateTo('productDetail', { productId });
  }
}