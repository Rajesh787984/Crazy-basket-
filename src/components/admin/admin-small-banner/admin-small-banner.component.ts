
import { Component, ChangeDetectionStrategy, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService, HeroSlide } from '../../../services/state.service';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-admin-small-banner',
  templateUrl: './admin-small-banner.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSmallBannerComponent implements OnInit {
  stateService: StateService = inject(StateService);
  productService: ProductService = inject(ProductService);
  fb: FormBuilder = inject(FormBuilder);

  smallBanner = this.stateService.smallBanner;
  allProducts = computed(() => this.productService.getAllProducts());

  bannerForm = this.fb.group({
    img: ['', Validators.required],
    title: ['', Validators.required],
    productId: [''],
  });

  ngOnInit(): void {
    const currentBanner = this.smallBanner();
    this.bannerForm.patchValue({
      img: currentBanner.img,
      title: currentBanner.title,
      productId: currentBanner.productId || ''
    });
  }

  saveBanner() {
    if (this.bannerForm.valid) {
      const formValue = this.bannerForm.getRawValue();
      const updatedBanner: HeroSlide = {
        // FIX: Added missing 'id' property to satisfy the HeroSlide interface.
        id: this.smallBanner().id,
        img: formValue.img!,
        title: formValue.title!,
        subtitle: '', // Not used for small banner
        productId: formValue.productId || undefined
      };
      this.stateService.updateSmallBanner(updatedBanner);
      this.stateService.showToast('Small banner updated successfully!');
    } else {
      this.stateService.showToast('Please fill all fields for the banner.');
    }
  }

  getProductName(productId?: string): string {
    if (!productId) return 'N/A';
    return this.allProducts().find(p => p.id === productId)?.name || 'Unknown Product';
  }
}
