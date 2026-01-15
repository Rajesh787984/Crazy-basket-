
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { StateService } from '../../../services/state.service';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-admin-bulk-updater',
  templateUrl: './admin-bulk-updater.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminBulkUpdaterComponent {
  stateService: StateService = inject(StateService);
  productService: ProductService = inject(ProductService);
  // FIX: Explicitly type injected FormBuilder to resolve type inference issue.
  fb: FormBuilder = inject(FormBuilder);

  updateForm = this.fb.group({
    type: ['category' as const, Validators.required],
    name: ['', Validators.required],
    updateType: ['percent' as const, Validators.required],
    direction: ['decrease' as const, Validators.required],
    value: [0, [Validators.required, Validators.min(0)]],
  });

  availableCategories = computed(() => {
    const products = this.productService.getAllProducts();
    return [...new Set(products.map(p => p.category))];
  });

  availableBrands = computed(() => {
    const products = this.productService.getAllProducts();
    return [...new Set(products.map(p => p.brand))];
  });

  nameOptions = computed(() => {
    return this.updateForm.value.type === 'category'
      ? this.availableCategories()
      : this.availableBrands();
  });

  applyUpdate() {
    if (this.updateForm.invalid) {
      this.stateService.showToast('Please fill out all fields correctly.');
      return;
    }

    const { type, name, updateType, direction, value } = this.updateForm.getRawValue();

    if (!name || !value) {
      this.stateService.showToast('Please select a target and provide a value.');
      return;
    }
    
    const updatedCount = this.productService.bulkUpdatePrices(type!, name, updateType!, direction!, value);
    this.stateService.showToast(`Successfully updated prices for ${updatedCount} products.`);
    this.updateForm.reset({
      type: 'category',
      name: '',
      updateType: 'percent',
      direction: 'decrease',
      value: 0
    });
  }
}
