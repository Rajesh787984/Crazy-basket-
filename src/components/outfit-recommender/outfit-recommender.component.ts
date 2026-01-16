import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { GeminiService } from '../../services/gemini.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

interface OutfitRecommendation {
  category: string;
  product: Product;
  reasoning: string;
  productId: string;
}

@Component({
  selector: 'app-outfit-recommender',
  templateUrl: './outfit-recommender.component.html',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutfitRecommenderComponent {
  stateService: StateService = inject(StateService);
  geminiService: GeminiService = inject(GeminiService);
  productService: ProductService = inject(ProductService);

  isLoading = signal(false);
  recommendations = signal<OutfitRecommendation[] | null>(null);
  errorMessage = signal<string | null>(null);

  occasion = signal('');
  uploadedImage = signal<{ file: File, previewUrl: string, base64: string } | null>(null);

  async handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      try {
        // Read the file as a Data URL for a more reliable preview.
        const dataUrl = await this.toDataUrl(file);
        // Extract the base64 part for the API call.
        const base64 = dataUrl.split(',')[1];
        this.uploadedImage.set({ file, previewUrl: dataUrl, base64 });
      } catch (error) {
        console.error("Error reading file:", error);
        this.errorMessage.set("Could not process the selected image file.");
      }
    }
  }
  
  removeImage() {
    // With Data URLs, we no longer need to call revokeObjectURL.
    this.uploadedImage.set(null);
  }

  async getRecommendations() {
    if (!this.occasion().trim()) {
      this.errorMessage.set('Please describe the occasion.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.recommendations.set(null);

    try {
      const allProducts = this.productService.getAllProducts();
      const imagePayload = this.uploadedImage() ? {
        mimeType: this.uploadedImage()!.file.type,
        data: this.uploadedImage()!.base64,
      } : undefined;

      const rawRecs = await this.geminiService.getOutfitRecommendations(this.occasion(), allProducts, imagePayload);

      const detailedRecs = rawRecs
        .map(rec => {
          const product = this.productService.getProductById(rec.productId);
          return product ? { ...rec, product } : null;
        })
        .filter((rec): rec is OutfitRecommendation => rec !== null);

      this.recommendations.set(detailedRecs);

    } catch (error) {
      this.errorMessage.set('Sorry, our AI stylist is taking a break. Please try again later.');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }
  
  viewProduct(productId: string) {
    this.stateService.navigateTo('productDetail', { productId });
  }

  private toDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
}