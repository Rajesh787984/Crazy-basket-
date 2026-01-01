
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../services/state.service';
import { ProductService } from '../../../services/product.service';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-admin-product-form',
  templateUrl: './admin-product-form.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductFormComponent implements OnInit {
  stateService = inject(StateService);
  productService = inject(ProductService);
  fb = inject(FormBuilder);

  productToEdit: Product | null = null;
  isEditMode = false;

  productForm = this.fb.group({
    name: ['', Validators.required],
    brand: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
    originalPrice: [0, [Validators.required, Validators.min(1)]],
    rating: [0, [Validators.required, Validators.min(0), Validators.max(5)]],
    reviews: [0, [Validators.required, Validators.min(0)]],
    category: ['Men' as const, Validators.required],
    images: this.fb.array([this.fb.control('', Validators.required)]),
    sizes: this.fb.array([], Validators.required),
    details: this.fb.array([this.fb.control('', Validators.required)]),
    fit: [''],
    fabric: ['']
  });

  get images() { return this.productForm.get('images') as FormArray; }
  get sizes() { return this.productForm.get('sizes') as FormArray; }
  get details() { return this.productForm.get('details') as FormArray; }

  ngOnInit() {
    this.productToEdit = this.stateService.productToEdit();
    this.isEditMode = !!this.productToEdit;
    if (this.isEditMode && this.productToEdit) {
      this.productForm.patchValue({
        ...this.productToEdit,
        price: this.productToEdit.price,
        originalPrice: this.productToEdit.originalPrice
      });
      // Set FormArrays
      this.images.clear();
      this.productToEdit.images.forEach(img => this.images.push(this.fb.control(img, Validators.required)));
      this.sizes.clear();
      this.productToEdit.sizes.forEach(size => this.sizes.push(this.fb.group({ name: [size.name], inStock: [size.inStock] })));
      this.details.clear();
      this.productToEdit.details.forEach(detail => this.details.push(this.fb.control(detail, Validators.required)));
    } else {
      // Set default size
      this.addSize();
    }
  }

  addSize() { this.sizes.push(this.fb.group({ name: [''], inStock: [true] })); }
  removeSize(index: number) { this.sizes.removeAt(index); }
  addImage() { this.images.push(this.fb.control('', Validators.required)); }
  removeImage(index: number) { this.images.removeAt(index); }
  addDetail() { this.details.push(this.fb.control('', Validators.required)); }
  removeDetail(index: number) { this.details.removeAt(index); }

  saveProduct() {
    if (this.productForm.invalid) {
      this.stateService.showToast('Please fill all required fields.');
      return;
    }
    
    const formValue = this.productForm.getRawValue();
    const discount = Math.round(((formValue.originalPrice - formValue.price) / formValue.originalPrice) * 100);

    if (this.isEditMode && this.productToEdit) {
      const updatedProduct: Product = {
        ...this.productToEdit,
        ...formValue,
        discount
      };
      this.productService.updateProduct(updatedProduct);
      this.stateService.showToast('Product updated successfully!');
    } else {
      const newProduct: Omit<Product, 'id'> = {
        ...formValue,
        discount
      };
      this.productService.addProduct(newProduct);
      this.stateService.showToast('Product added successfully!');
    }
    this.stateService.navigateToAdminView('products');
  }

  cancel() {
    this.stateService.navigateToAdminView('products');
  }
}
