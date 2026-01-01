
import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { StateService } from '../../services/state.service';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Review } from '../../models/review.model';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  productService = inject(ProductService);
  stateService = inject(StateService);
  fb = inject(FormBuilder);

  product = signal<Product | undefined>(undefined);
  selectedSize = signal<string | null>(null);
  activeImageIndex = signal(0);
  pincode = signal('');
  deliveryStatus = signal('');
  
  similarProducts = signal<Product[]>([]);
  showReviewForm = signal(false);

  private intervalId?: any;

  reviewForm = this.fb.group({
    rating: [5, Validators.required],
    comment: ['', [Validators.required, Validators.minLength(10)]]
  });

  productReviews = computed(() => {
    const pId = this.product()?.id;
    if (!pId) return [];
    return this.stateService.userReviews().filter(r => r.productId === pId);
  });
  
  ngOnInit() {
    this.loadProduct();
  }

  ngOnDestroy() {
    this.stopSlider();
  }

  loadProduct() {
    this.stopSlider();
    const pId = this.stateService.selectedProductId();
    if (pId) {
      const p = this.productService.getProductById(pId);
      this.product.set(p);
      this.activeImageIndex.set(0);
      this.selectedSize.set(null);
      this.showReviewForm.set(false);
      this.reviewForm.reset({ rating: 5, comment: ''});
      if (p) {
        this.similarProducts.set(
          this.productService.getProducts(p.category).filter(sp => sp.id !== p.id).slice(0, 5)
        );
        if (p.images.length > 1) {
          this.startSlider();
        }
      }
    }
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

  addToBag() {
    const p = this.product();
    const s = this.selectedSize();
    const sizeInfo = p?.sizes.find(sz => sz.name === s);

    if (p && s && sizeInfo?.inStock) {
      this.stateService.addToCart(p, s);
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
