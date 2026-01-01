
import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { StateService, ActiveFilters } from '../../services/state.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent implements OnInit {
  productService = inject(ProductService);
  stateService = inject(StateService);

  allProducts = signal<Product[]>([]);
  showFilters = signal(false);

  // Filter options derived from products
  priceRanges = [
    { label: 'Under 500', value: '0-500' },
    { label: '500 to 1000', value: '500-1000' },
    { label: '1000 to 2000', value: '1000-2000' },
    { label: 'Over 2000', value: '2000-Infinity' }
  ];
  discounts = [10, 20, 30, 40, 50];
  
  // Local copy of filters for UI binding
  localFilters = signal<ActiveFilters>({ priceRanges: [], discounts: [] });

  pageTitle = computed(() => {
    if (this.stateService.searchQuery()) {
      return `Search results for "${this.stateService.searchQuery()}"`;
    }
    if (this.stateService.selectedCategory()) {
      return `${this.stateService.selectedCategory()} Collection`;
    }
    return 'All Products';
  });

  filteredAndSortedProducts = computed(() => {
    let products = this.allProducts();
    const filters = this.stateService.activeFilters();
    const sortOption = this.stateService.sortOption();
    const query = this.stateService.searchQuery().toLowerCase();

    // Search
    if (query) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.brand.toLowerCase().includes(query)
      );
    }
    
    // Filtering
    if (filters.discounts.length > 0) {
      const minDiscount = Math.min(...filters.discounts);
      products = products.filter(p => p.discount >= minDiscount);
    }
    if (filters.priceRanges.length > 0) {
      products = products.filter(p => {
        return filters.priceRanges.some(range => {
          const [min, max] = range.split('-').map(Number);
          return p.price >= min && p.price <= (max || Infinity);
        });
      });
    }

    // Sorting
    switch (sortOption) {
      case 'price_asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'discount_desc':
        products.sort((a, b) => b.discount - a.discount);
        break;
    }

    return products;
  });

  ngOnInit() {
    const category = this.stateService.selectedCategory();
    const products = category ? this.productService.getProducts(category) : this.productService.getAllProducts();
    this.allProducts.set(products);
    this.localFilters.set(JSON.parse(JSON.stringify(this.stateService.activeFilters())));
  }

  viewProduct(productId: string) {
    this.stateService.navigateTo('productDetail', { productId });
  }
  
  onSortChange(event: Event) {
    this.stateService.setSortOption((event.target as HTMLSelectElement).value);
  }

  toggleFilter(filterType: 'priceRanges' | 'discounts', value: string | number) {
    const current = this.localFilters();
    const filterArray = current[filterType as keyof ActiveFilters] as (string | number)[];
    const index = filterArray.indexOf(value as never);

    if (index > -1) {
      filterArray.splice(index, 1);
    } else {
      filterArray.push(value as never);
    }
    this.localFilters.set({ ...current });
  }

  applyFilters() {
    this.stateService.setFilters(this.localFilters());
    this.showFilters.set(false);
  }
  
  clearFilters() {
    this.localFilters.set({ priceRanges: [], discounts: [] });
    this.stateService.resetFilters();
  }

  formatReviews(reviews: number): string {
    return reviews >= 1000 ? `${(reviews / 1000).toFixed(1)}k` : reviews.toString();
  }
}
