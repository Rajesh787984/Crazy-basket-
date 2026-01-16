import { Component, ChangeDetectionStrategy, inject, signal, OnInit, effect, OnDestroy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StateService, HeroSlide } from '../../services/state.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { RecentlyViewedComponent } from '../recently-viewed/recently-viewed.component';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [CommonModule, RecentlyViewedComponent, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, OnDestroy {
  // ✅ FIX: inject() को यहाँ सबसे ऊपर रखा गया है
  stateService: StateService = inject(StateService);
  productService: ProductService = inject(ProductService);
  private seoService: SeoService = inject(SeoService);

  homePageSections = this.stateService.homePageSections;
  heroSlides = this.stateService.heroSlides;

  featuredProducts = signal<Product[]>([]);
  activeSlide = signal(0);
  
  private sliderTimeoutId: any = null;
  private readonly SLIDER_INTERVAL = 3000; 

  // ✅ NOTE: अगर आप डिस्काउंट नहीं दिखाना चाहते तो HTML में बदलेंगे, 
  // यहाँ डेटा रहने दें, इससे एरर नहीं आएगा।
  topDeals = [
    { title: 'New Collection', discount: 'Trending', img: 'https://picsum.photos/seed/deal1/400/300', category: 'Men' },
    { title: 'Best Sellers', discount: 'Hot', img: 'https://picsum.photos/seed/deal2/400/300', category: 'Women' },
    { title: 'New Arrivals', discount: 'Fresh', img: 'https://picsum.photos/seed/deal3/400/300', category: 'Men' },
    { title: 'Premium', discount: 'Exclusive', img: 'https://picsum.photos/seed/deal4/400/300', category: 'Women' }
  ];

  constructor() {
    effect(() => {
      const allProducts = this.productService.products();
      if (allProducts.length > 0 && this.featuredProducts().length === 0) {
        const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
        this.featuredProducts.set(shuffled.slice(0, 20));
      }
    });

    effect((onCleanup) => {
      const slides = this.heroSlides();
      if (slides.length > 1) {
        this.startSlider();
      } else {
        this.stopSlider();
      }
      onCleanup(() => {
        this.stopSlider();
      });
    });
  }

  ngOnInit() {
    this.setupSeo();
  }

  ngOnDestroy() {
    this.stopSlider();
  }

  private setupSeo() {
    this.seoService.updateTitle(); 
    this.seoService.updateDescription(); 
    // अपनी असली इमेज URL यहाँ डालें
    this.seoService.updateImageUrl('https://crazy-basket-app.com/social-preview.png'); 

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'Crazy Basket',
      'url': 'https://crazy-basket-app.com/',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': 'https://crazy-basket-app.com/#/productList;searchQuery={search_term_string}'
        },
        'query-input': 'required name=search_term_string',
      },
    };
    this.seoService.updateJsonLd(schema);
  }

  startSlider() {
    this.stopSlider();
    if (this.heroSlides().length > 1) {
      this.sliderTimeoutId = setTimeout(() => this.nextSlide(false), this.SLIDER_INTERVAL);
    }
  }

  stopSlider() {
    if (this.sliderTimeoutId) {
      clearTimeout(this.sliderTimeoutId);
      this.sliderTimeoutId = null;
    }
  }

  nextSlide(userInitiated = true) {
    const slides = this.heroSlides();
    if (slides.length > 0) {
      this.activeSlide.update(current => (current + 1) % slides.length);
    }

    if (userInitiated) {
      this.startSlider(); 
    } else {
      this.startSlider();
    }
  }

  goToSlide(index: number) {
    this.activeSlide.set(index);
    this.startSlider(); 
  }

  onBannerClick(slide: HeroSlide) {
    if (slide.productId) {
      this.stateService.navigateTo('productDetail', { productId: slide.productId });
    }
  }

  viewProduct(productId: string) {
    this.stateService.navigateTo('productDetail', { productId });
  }

  selectCategory(categoryName: string) {
    this.stateService.navigateTo('productList', { category: categoryName });
  }
}
