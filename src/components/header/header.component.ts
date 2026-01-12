

import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StateService } from '../../services/state.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { FormsModule } from '@angular/forms';

type Suggestion = Product | { type: 'category', name: string };

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [CommonModule, FormsModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnDestroy {
  stateService: StateService = inject(StateService);
  productService: ProductService = inject(ProductService);
  // FIX: Explicitly type the injected ElementRef to resolve type inference issue.
  private elementRef: ElementRef<HTMLElement> = inject(ElementRef);

  cartItemCount = this.stateService.cartItemCount;
  wishlistItemCount = this.stateService.wishlistItemCount;
  currentView = this.stateService.currentView;
  isAuthenticated = this.stateService.isAuthenticated;
  categories = this.stateService.categories;
  isAdmin = this.stateService.isAdmin;
  
  searchQuery = signal('');
  suggestions = signal<Suggestion[]>([]);
  showSuggestions = signal(false);

  showMiniCart = signal(false);
  cartItems = this.stateService.cartItemsWithPrices;
  cartTotal = this.stateService.cartTotal;
  miniCartItems = computed(() => this.cartItems().slice(0, 3));
  
  private onDocumentClick = (event: MouseEvent): void => {
    // FIX: Cast event.target to Node as the 'contains' method expects a Node, which resolves the type error.
    if (this.showMiniCart() && this.elementRef.nativeElement && !this.elementRef.nativeElement.contains(event.target as Node)) {
      if (!(event.target as HTMLElement).closest('.relative[data-minicart-container]')) {
         this.showMiniCart.set(false);
      }
    }
  };

  ngOnInit(): void {
    document.addEventListener('click', this.onDocumentClick, true);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocumentClick, true);
  }

  toggleSidebar() {
    this.stateService.isSidebarOpen.update(v => !v);
  }

  toggleOrGoToCart(event: MouseEvent) {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) { // lg breakpoint is 1024px
      if (this.cartItemCount() > 0) {
        event.stopPropagation();
        this.showMiniCart.update(v => !v);
      } else {
        this.stateService.navigateTo('cart');
      }
    } else {
      this.stateService.navigateTo('cart');
    }
  }

  goHome() { this.stateService.navigateTo('home'); }
  goToCart() { 
    this.showMiniCart.set(false);
    this.stateService.navigateTo('cart'); 
  }
  goToCheckout() {
    this.showMiniCart.set(false);
    this.stateService.navigateTo('address');
  }
  goToProfile() { this.stateService.navigateTo('profile'); }
  goToAdmin() { this.stateService.navigateTo('admin'); }
  goToWishlist() { this.stateService.navigateTo('wishlist'); }
  selectCategory(categoryName: string) {
    this.stateService.navigateTo('productList', { category: categoryName });
  }

  onSearch() {
    if (this.searchQuery().trim()) {
      this.stateService.navigateTo('productList', { searchQuery: this.searchQuery() });
      this.showSuggestions.set(false);
      this.searchQuery.set('');
    }
  }

  onSearchInput() {
    const query = this.searchQuery().trim().toLowerCase();
    if (query.length > 1) {
      const allProducts = this.productService.getAllProducts();
      const allCategories = this.stateService.categories();
      
      const searchKeywords = query.split(' ').filter(k => k);

      const productSuggestions = allProducts.filter(p => {
        const searchableText = [
          p.name.toLowerCase(),
          p.brand.toLowerCase(),
          p.category.toLowerCase(),
          ...(p.tags || []).map(t => t.toLowerCase())
        ].join(' ');
        
        return searchKeywords.every(keyword => searchableText.includes(keyword));
      }).slice(0, 5);

      const categorySuggestions = allCategories.filter(c => 
        c.name.toLowerCase().includes(query)
      ).map(c => ({ type: 'category' as const, name: c.name }));

      this.suggestions.set([...categorySuggestions, ...productSuggestions]);
      this.showSuggestions.set(true);
    } else {
      this.suggestions.set([]);
      this.showSuggestions.set(false);
    }
  }

  selectSuggestion(suggestion: Suggestion) {
      if ('type' in suggestion && suggestion.type === 'category') {
        this.stateService.navigateTo('productList', { category: suggestion.name });
      } else {
        this.stateService.navigateTo('productDetail', { productId: (suggestion as Product).id });
      }
      this.showSuggestions.set(false);
      this.searchQuery.set('');
  }
  
  goBack() {
    const fromView = this.stateService.lastNavigatedView();
    if (fromView && fromView !== this.currentView()) {
      this.stateService.navigateTo(fromView);
    } else {
       this.stateService.navigateTo('home');
    }
  }
}