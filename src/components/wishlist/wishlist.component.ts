import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StateService } from '../../services/state.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-wishlist',
  template: `
    <div class="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">My Wishlist ({{ wishlistProducts().length }} items)</h1>
      @if (wishlistProducts().length > 0) {
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          @for (product of wishlistProducts(); track product.id; let i = $index) {
            <div class="border dark:border-gray-700 rounded-lg overflow-hidden group relative flex flex-col">
              <div class="absolute top-2 right-2 z-10">
                <button (click)="removeFromWishlist(product.id)" title="Remove from wishlist" class="bg-white/70 backdrop-blur-sm rounded-full p-2 text-gray-700 hover:text-red-500 hover:bg-white transition-all duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="aspect-[2/3] overflow-hidden cursor-pointer" (click)="viewProduct(product.id)">
                <img [ngSrc]="product.images[0]" [alt]="product.name" width="200" height="300" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" [priority]="i < 4">
              </div>
              <div class="p-3 bg-white dark:bg-gray-800 flex-grow flex flex-col">
                <h3 class="font-bold text-sm truncate text-gray-800 dark:text-gray-100">{{ product.brand }}</h3>
                <p class="text-xs text-gray-600 dark:text-gray-400 truncate flex-grow">{{ product.name }}</p>
                <div class="flex items-baseline mt-2">
                  <p class="font-bold text-gray-900 dark:text-white">
                    ₹{{ (isB2B() && product.b2bPrice) ? product.b2bPrice : product.price }}
                  </p>
                  @if (product.originalPrice > product.price) {
                    <p class="text-xs text-gray-500 dark:text-gray-400 line-through ml-2">₹{{ product.originalPrice }}</p>
                    <p class="text-xs text-pink-500 font-semibold ml-2">({{ product.discount }}% OFF)</p>
                  }
                </div>
                <button (click)="moveToBag(product)" class="w-full mt-3 border border-pink-500 text-pink-500 py-2 rounded-md text-sm font-semibold hover:bg-pink-500 hover:text-white transition-colors">
                  MOVE TO BAG
                </button>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-16">
          <h2 class="text-xl font-bold mb-2">YOUR WISHLIST IS EMPTY</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">Add your favourite items to your wishlist and they will show up here.</p>
          <button (click)="stateService.navigateTo('home')" class="bg-pink-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-pink-600 transition-colors">
            CONTINUE SHOPPING
          </button>
        </div>
      }
    </div>
  `,
  imports: [CommonModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WishlistComponent {
  stateService: StateService = inject(StateService);
  productService: ProductService = inject(ProductService);

  wishlistProducts = computed(() => {
    const wishlistIds = this.stateService.wishlist();
    // FIX: Explicitly provide the generic type to Array.from to ensure correct type inference.
    // This resolves an issue where the 'id' was being inferred as 'unknown' in the map function.
    return Array.from<string>(wishlistIds)
      .map(id => this.productService.getProductById(id))
      .filter((p): p is Product => p !== undefined);
  });
  
  isB2B = this.stateService.isB2B;

  removeFromWishlist(productId: string) {
    this.stateService.toggleWishlist(productId);
  }

  moveToBag(product: Product) {
    const defaultSize = product.sizes.find(s => s.inStock)?.name;
    if (defaultSize) {
      this.stateService.addToCart(product, defaultSize);
      this.stateService.toggleWishlist(product.id);
      this.stateService.showToast(`${product.name} moved to bag.`);
    } else {
      this.stateService.showToast('This item is out of stock.');
    }
  }

  viewProduct(productId: string) {
    this.stateService.navigateTo('productDetail', { productId });
  }
}