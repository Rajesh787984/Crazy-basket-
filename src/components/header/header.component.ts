
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { ProductService } from '../../services/product.service';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  stateService = inject(StateService);
  productService = inject(ProductService);

  cartItemCount = this.stateService.cartItemCount;
  currentView = this.stateService.currentView;
  isAuthenticated = this.stateService.isAuthenticated;
  
  searchQuery = signal('');
  suggestions = signal<Product[]>([]);
  showSuggestions = signal(false);
  isMobileSearchActive = signal(false);

  toggleSidebar() {
    this.stateService.isSidebarOpen.update(v => !v);
  }

  goHome() { this.stateService.navigateTo('home'); }
  goToCart() { this.stateService.navigateTo('cart'); }
  goToProfile() { this.stateService.navigateTo('profile'); }

  onSearch() {
    if (this.searchQuery().trim()) {
      this.stateService.navigateTo('productList', { searchQuery: this.searchQuery() });
      this.showSuggestions.set(false);
      this.isMobileSearchActive.set(false);
      this.searchQuery.set('');
    }
  }

  onSearchInput() {
    const query = this.searchQuery().trim().toLowerCase();
    if (query.length > 1) {
      const allProducts = this.productService.getAllProducts();
      const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      ).slice(0, 5);
      this.suggestions.set(filtered);
      this.showSuggestions.set(true);
    } else {
      this.suggestions.set([]);
      this.showSuggestions.set(false);
    }
  }

  selectSuggestion(product: Product) {
      this.stateService.navigateTo('productDetail', { productId: product.id });
      this.showSuggestions.set(false);
      this.isMobileSearchActive.set(false);
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
