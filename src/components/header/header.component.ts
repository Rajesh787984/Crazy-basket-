

import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { FormsModule } from '@angular/forms';

type Suggestion = Product | { type: 'category', name: string };

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  stateService: StateService = inject(StateService);
  productService: ProductService = inject(ProductService);

  cartItemCount = this.stateService.cartItemCount;
  wishlistItemCount = this.stateService.wishlistItemCount;
  currentView = this.stateService.currentView;
  isAuthenticated = this.stateService.isAuthenticated;
  categories = this.stateService.categories;
  
  searchQuery = signal('');
  suggestions = signal<Suggestion[]>([]);
  showSuggestions = signal(false);

  toggleSidebar() {
    this.stateService.isSidebarOpen.update(v => !v);
  }

  goHome() { this.stateService.navigateTo('home'); }
  goToCart() { this.stateService.navigateTo('cart'); }
  goToProfile() { this.stateService.navigateTo('profile'); }
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