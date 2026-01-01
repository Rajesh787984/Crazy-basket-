
import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { StateService } from '../../services/state.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, OnDestroy {
  stateService = inject(StateService);
  productService = inject(ProductService);

  heroSlides = this.stateService.heroSlides;
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
