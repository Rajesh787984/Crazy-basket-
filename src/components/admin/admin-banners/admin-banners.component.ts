
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService, HeroSlide } from '../../../services/state.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-banners',
  templateUrl: './admin-banners.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminBannersComponent {
  stateService = inject(StateService);
  fb = inject(FormBuilder);

  heroSlides = this.stateService.heroSlides;

  bannerForm = this.fb.group({
    img: ['', Validators.required],
    title: ['', Validators.required],
    subtitle: ['', Validators.required],
  });

  addBanner() {
    if (this.bannerForm.valid) {
      this.stateService.addBanner(this.bannerForm.value as HeroSlide);
      this.bannerForm.reset();
    } else {
      this.stateService.showToast('Please fill all fields for the banner.');
    }
  }

  deleteBanner(index: number) {
    if (confirm('Are you sure you want to delete this banner?')) {
      this.stateService.deleteBanner(index);
    }
  }
}
