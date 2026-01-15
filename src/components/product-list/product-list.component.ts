import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { StateService, ActiveFilters } from '../../services/state.service';
import { CountdownTimerComponent } from '../countdown-timer/countdown-timer.component';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  imports: [CommonModule, CountdownTimerComponent, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent implements OnInit {
  productService: ProductService = inject(ProductService);
  stateService: StateService = inject(StateService);
  private seoService: SeoService = inject(SeoService);

  allProducts = computed(() => {
    const category = this.stateService.selectedCategory();
    if (category) {
      return this.productService.getProducts(category);
    }
    return this.productService.getAllProducts();
  });
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

  productsWithDisplayPrice = computed(() => {
    const isB2B = this.stateService.isB2B();
    return this.allProducts().map(p => ({
      ...p,
      displayPrice: (isB2B && p.b2bPrice) ? p.b2bPrice : p.price
    }));
  });

  filteredAndSortedProducts = computed(() => {
    let products = this.productsWithDisplayPrice();
    const filters = this.stateService.activeFilters();
    const sortOption = this.stateService.sortOption();
    const query = this.stateService.searchQuery().toLowerCase().trim();

    // Search
    if (query) {
      const searchKeywords = query.split(' ').filter(k => k); // split by space and remove empty strings

      products = products.filter(p => {
        // Create a single searchable string for each product
        const searchableText = [
          p.name.toLowerCase(),
          p.brand.toLowerCase(),
          p.category.toLowerCase(),
          ...(p.tags || []).map(t => t.toLowerCase()),
          ...p.details.map(d => d.toLowerCase())
        ].join(' ');

        // Check if all keywords are present in the searchable text
        return searchKeywords.every(keyword => searchableText.includes(keyword));
      });
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
          return p.displayPrice >= min && p.displayPrice <= (max || Infinity);
        });
      });
    }

    // Sorting
    switch (sortOption) {
      case 'price_asc':
        products.sort((a, b) => a.displayPrice - b.displayPrice);
        break;
      case 'price_desc':
        products.sort((a, b) => b.displayPrice - a.displayPrice);
        break;
      case 'discount_desc':
        products.sort((a, b) => b.discount - a.discount);
        break;
    }

    return products;
  });
  
  constructor() {
    effect(() => {
      const title = this.pageTitle();
      const description = `Shop our ${title} on Crazy Basket. Find great deals on fashion, electronics, and personalized gifts. Fast delivery across India.`;
      this.seoService.updateTitle(title);
      this.seoService.updateDescription(description);

      const products = this.filteredAndSortedProducts();
      if (products.length > 0) {
        // Set first product image as the OG image for the page
        this.seoService.updateImageUrl(products[0].images[0]);
        
        const itemListSchema = {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          'itemListElement': products.slice(0, 12).map((p, index) => ({ // Limit for performance
            '@type': 'ListItem',
            'position': index + 1,
            'item': {
              '@type': 'Product',
              'name': p.name,
              'image': p.images[0],
              'url': `https://crazy-basket-app.com/#/productDetail;productId=${p.id}`,
              'offers': {
                '@type': 'Offer',
                'priceCurrency': 'INR',
                'price': p.displayPrice
              }
            }
          }))
        };
        this.seoService.updateJsonLd(itemListSchema);
      } else {
        this.seoService.updateJsonLd(null);
      }
    });
  }

  ngOnInit() {
    const currentFilters = this.stateService.activeFilters();
    this.localFilters.set({
      priceRanges: [...currentFilters.priceRanges],
      discounts: [...currentFilters.discounts],
    });
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

  isSaleActive(product: Product): boolean {
    if (!product.flashSale) return false;
    return new Date(product.flashSale.endDate) > new Date();
  }
}