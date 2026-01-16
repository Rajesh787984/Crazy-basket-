import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService, HeroSlide } from '../../../services/state.service';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-banners',
  templateUrl: './admin-banners.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminBannersComponent {
  stateService: StateService = inject(StateService);
  fb: FormBuilder = inject(FormBuilder);

  banners = this.stateService.heroSlides;
  showForm = signal(false);

  bannerForm = this.fb.group({
    img: ['', Validators.required],
    title: ['', Validators.required],
    subtitle: [''],
    productId: [''],
  });

  saveBanner() {
    if (this.bannerForm.invalid) {
      this.stateService.showToast('Image and Title are required.');
      return;
    }
    
    const newBannerData = {
        img: this.bannerForm.value.img!,
        title: this.bannerForm.value.title!,
        subtitle: this.bannerForm.value.subtitle || '',
        productId: this.bannerForm.value.productId || undefined
    };

    this.stateService.addBanner(newBannerData);
    this.cancel();
  }

  deleteBanner(bannerId: string) {
    if (confirm('Are you sure you want to delete this banner?')) {
      this.stateService.deleteBanner(bannerId);
    }
  }

  cancel() {
    this.bannerForm.reset();
    this.showForm.set(false);
  }
}