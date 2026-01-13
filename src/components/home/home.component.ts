import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StateService, HeroSlide } from '../../services/state.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { RecentlyViewedComponent } from '../recently-viewed/recently-viewed.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [CommonModule, RecentlyViewedComponent, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, OnDestroy {
  stateService: StateService = inject(StateService);
  productService: ProductService = inject(ProductService);

  homePageSections = this.stateService.homePageSections;
  heroSlides = this.stateService.heroSlides;
  smallBanner = this.stateService.smallBanner;
  homeCategories = this.stateService.categories;

  topDeals = [
    { img: 'https://picsum.photos/id/211/400/300', title: 'SPORTS SHOES', discount: 'MIN. 50% OFF', category: 'Men' },
    { img: 'https://picsum.photos/id/322/400/300', title: 'CASUAL SHIRTS', discount: 'UPTO 60% OFF', category: 'Men' },
    { img: 'https://picsum.photos/id/411/400/300', title: 'KURTAS & SETS', discount: 'FLAT 70% OFF', category: 'Women' },
    { img: 'https://picsum.photos/id/621/400/300', title: 'HEELS & BOOTS', discount: 'UNDER ₹999', category: 'Women' }
  ];

  featuredProducts = signal<Product[]>([]);
  activeSlide = signal(0);
  private intervalId?: any;

  ngOnInit() {
    this.startSlider();
    this.loadFeaturedProducts();
  }

  ngOnDestroy() {
    this.stopSlider();
  }

  startSlider() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopSlider() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextSlide() {
    this.activeSlide.update(current => (current + 1) % this.heroSlides().length);
  }

  goToSlide(index: number) {
    this.activeSlide.set(index);
    this.stopSlider();
    this.startSlider();
  }

  onBannerClick(slide: HeroSlide) {
    if (slide.productId) {
      this.stateService.navigateTo('productDetail', { productId: slide.productId });
    }
  }

  loadFeaturedProducts() {
    const allProducts = this.productService.getAllProducts();
    const shuffled = allProducts.sort(() => 0.5 - Math.random());
    this.featuredProducts.set(shuffled.slice(0, 8));
  }

  viewProduct(productId: string) {
    this.stateService.navigateTo('productDetail', { productId });
  }

  selectCategory(categoryName: string) {
    this.stateService.navigateTo('productList', { category: categoryName });
  }
}
