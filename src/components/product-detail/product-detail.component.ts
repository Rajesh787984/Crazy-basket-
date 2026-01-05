import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed, OnDestroy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { StateService } from '../../services/state.service';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Review } from '../../models/review.model';
import { DomSanitizer, SafeResourceUrl, Title, Meta } from '@angular/platform-browser';


@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  imports: [CommonModule, ReactiveFormsModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  productService: ProductService = inject(ProductService);
  stateService: StateService = inject(StateService);
  fb: FormBuilder = inject(FormBuilder);
  sanitizer: DomSanitizer = inject(DomSanitizer);
  titleService: Title = inject(Title);
  metaService: Meta = inject(Meta);

  product = signal<Product | undefined>(undefined);
  selectedSize = signal<string | null>(null);
  activeImageIndex = signal(0);
  pincode = signal('');
  deliveryStatus = signal('');
  
  similarProducts = signal<Product[]>([]);
  showReviewForm = signal(false);
  jsonLdScript = signal<string>('');
  customization = signal<{ file: File, previewUrl: string } | null>(null);

  private intervalId?: any;
  private countdownIntervalId?: any;
  
  flashSaleTimeRemaining = signal('');

  productWithDisplayPrice = computed(() => {
    const p = this.product();
    if (!p) return undefined;
    const isB2B = this.stateService.isB2B();
    return {
      ...p,
      displayPrice: (isB2B && p.b2bPrice) ? p.b2bPrice : p.price
    };
  });

  isFlashSaleActive = computed(() => {
    const p = this.product();
    if (!p || !p.flashSale) {
      return false;
    }
    return new Date(p.flashSale.endDate) > new Date();
  });

  reviewForm = this.fb.group({
    rating: [5, Validators.required],
    comment: ['', [Validators.required, Validators.minLength(10)]]
  });

  productReviews = computed(() => {
    const pId = this.product()?.id;
    if (!pId) return [];
    return this.stateService.userReviews().filter(r => r.productId === pId);
  });

  safeVideoUrl = computed(() => {
    const url = this.product()?.videoUrl;
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });

  ngOnInit() {
    this.loadProduct();
  }

  ngOnDestroy() {
    this.stopSlider();
    this.stopCountdown();
    // Reset meta tags when leaving the page
    this.titleService.setTitle('Crazy Basket');
  }

  loadProduct() {
    this.stopSlider();
    this.stopCountdown();
    const pId = this.stateService.selectedProductId();
    if (pId) {
      const p = this.productService.getProductById(pId);
      this.product.set(p);
      this.activeImageIndex.set(0);
      this.selectedSize.set(null);
      this.showReviewForm.set(false);
      this.customization.set(null); // Reset customization on new product load
      this.reviewForm.reset({ rating: 5, comment: ''});
      if (p) {
        this.updateMetaAndJsonLd(p);
        this.stateService.trackProductView(p.id); // Track product view
        if (p.flashSale && new Date(p.flashSale.endDate) > new Date()) {
          this.startCountdown(p.flashSale.endDate);
        }
        this.similarProducts.set(
          this.productService.getProducts(p.category).filter(sp => sp.id !== p.id).slice(0, 5)
        );
        if (p.images.length > 1) {
          this.startSlider();
        }
      }
    }
  }

  private updateMetaAndJsonLd(product: Product) {
    // 1. On-Page Optimization (Meta Tags)
    const title = `${product.name} - Buy Online at Best Price in India | ${product.brand}`;
    const description = `Buy ${product.name} online at the best price from ${product.brand} on Crazy Basket. ${product.details[0]}. Explore our collection of customized gifts and personalized t-shirts with fast delivery.`;
    
    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });

    // 2. Technical SEO & Rich Snippets (JSON-LD)
    const availability = product.sizes.some(s => s.inStock) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: product.images,
      description: product.details.join('. '),
      sku: product.id,
      brand: {
        '@type': 'Brand',
        name: product.brand,
      },
      offers: {
        '@type': 'Offer',
        url: window.location.href, // Or a canonical URL if routing was present
        priceCurrency: 'INR',
        price: product.price,
        availability: availability,
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Valid for 1 year
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviews,
      },
    };
    this.jsonLdScript.set(JSON.stringify(jsonLd));
  }

  startSlider() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 3000);
  }

  stopSlider() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  
  startCountdown(endDate: string) {
    this.updateCountdown(endDate);
    this.countdownIntervalId = setInterval(() => {
      this.updateCountdown(endDate);
    }, 1000);
  }

  stopCountdown() {
    if (this.countdownIntervalId) {
      clearInterval(this.countdownIntervalId);
    }
  }
  
  updateCountdown(endDate: string) {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const distance = end - now;

    if (distance < 0) {
      this.flashSaleTimeRemaining.set('Sale Ended');
      this.stopCountdown();
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    this.flashSaleTimeRemaining.set(`${days}d ${hours}h ${minutes}m ${seconds}s`);
  }

  nextSlide() {
    const p = this.product();
    if (p && p.images.length > 0) {
      this.activeImageIndex.update(current => (current + 1) % p.images.length);
    }
  }

  goToSlide(index: number) {
    this.activeImageIndex.set(index);
    this.stopSlider();
    this.startSlider();
  }

  selectSize(size: string) {
    this.selectedSize.set(size);
  }

  handlePhotoUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.customization.set({
          file: file,
          previewUrl: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto() {
    this.customization.set(null);
  }

  addToBag() {
    const p = this.product();
    const s = this.selectedSize();
    const sizeInfo = p?.sizes.find(sz => sz.name === s);
    const cust = this.customization();

    if (p && s && sizeInfo?.inStock) {
      const customizationData = cust ? { photoPreviewUrl: cust.previewUrl, fileName: cust.file.name } : undefined;
      this.stateService.addToCart(p, s, customizationData);
      return true;
    } else if (!s) {
      this.stateService.showToast('Please select a size!');
    } else {
      this.stateService.showToast('This size is out of stock!');
    }
    return false;
  }
  
  buyNow() {
    if (this.addToBag()) {
      this.stateService.navigateTo('address');
    }
  }

  submitReview() {
    if (this.reviewForm.valid && this.product()) {
      const { rating, comment } = this.reviewForm.value;
      this.stateService.addReview({
        productId: this.product()!.id,
        rating: rating!,
        comment: comment!
      });
      this.showReviewForm.set(false);
      this.reviewForm.reset({ rating: 5, comment: '' });
    }
  }

  checkDelivery() { if (this.pincode().length === 6) { this.deliveryStatus.set('Delivery by tomorrow, 10 AM'); } else { this.deliveryStatus.set('Please enter a valid 6-digit pincode'); } }
  
  viewSimilarProduct(productId: string) {
    this.stateService.navigateTo('productDetail', { productId });
    window.scrollTo(0, 0);
    this.loadProduct(); // Reload product data on navigation
  }

  formatReviews(reviews: number): string { return reviews >= 1000 ? `${(reviews / 1000).toFixed(1)}k` : reviews.toString(); }
}
