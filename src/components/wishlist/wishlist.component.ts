
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WishlistComponent {
  stateService = inject(StateService);
  productService = inject(ProductService);

  wishlistItems = computed(() => {
    const wishlistIds = this.stateService.wishlist();
    return Array.from(wishlistIds)
      .map(id => this.productService.getProductById(id))
      .filter((p): p is Product => p !== undefined);
  });

  removeFromWishlist(productId: string, event: MouseEvent) {
    event.stopPropagation();
    this.stateService.toggleWishlist(productId);
  }

  moveToBag(product: Product, event: MouseEvent) {
    event.stopPropagation();
    const availableSize = product.sizes.find(s => s.inStock);
    if (availableSize) {
      this.stateService.addToCart(product, availableSize.name);
      this.stateService.toggleWishlist(product.id);
    } else {
      this.stateService.showToast('This item is currently out of stock.');
    }
  }
  
  viewProduct(productId: string) {
    this.stateService.navigateTo('productDetail', { productId });
  }
}
