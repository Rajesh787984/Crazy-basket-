import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../services/state.service';
import { ProductService } from '../../../services/product.service';
import { FormBuilder, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Product, ProductSize } from '../../../models/product.model';

@Component({
  selector: 'app-admin-product-form',
  templateUrl: './admin-product-form.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductFormComponent implements OnInit {
  stateService: StateService = inject(StateService);
  productService: ProductService = inject(ProductService);
  fb: FormBuilder = inject(FormBuilder);

  productToEdit: Product | null = null;
  isEditMode = false;
  categories = this.stateService.categories;

  productForm = this.fb.group({
    name: ['', Validators.required],
    brand: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
    originalPrice: [0, [Validators.required, Validators.min(1)]],
    b2bPrice: [null as number | null],
    rating: [0, [Validators.required, Validators.min(0), Validators.max(5)]],
    reviews: [0, [Validators.required, Validators.min(0)]],
    category: ['Men', Validators.required],
    images: this.fb.array([this.fb.control('', Validators.required)]),
    sizes: this.fb.array([], Validators.required),
    details: this.fb.array([this.fb.control('', Validators.required)]),
    fit: [''],
    fabric: [''],
    isCodAvailable: [true],
    videoUrl: [''],
    allowPhotoUpload: [false],
    sizeChartUrl: [''],
    preorderAvailable: [false],
    // New controls
    color: [''],
    pattern: [''],
    idealFor: ['Men'],
    sleeve: [''],
    closure: [''],
    fabricCare: [''],
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
        originalPrice: this.productToEdit.originalPrice,
        b2bPrice: this.productToEdit.b2bPrice || null,
        allowPhotoUpload: this.productToEdit.allowPhotoUpload || false,
        sizeChartUrl: this.productToEdit.sizeChartUrl || '',
        preorderAvailable: this.productToEdit.preorderAvailable || false,
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
        sizes: formValue.sizes as ProductSize[],
        b2bPrice: formValue.b2bPrice || undefined,
        discount
      };
      this.productService.updateProduct(updatedProduct);
      this.stateService.showToast('Product updated successfully!');
    } else {
      const newProduct: Omit<Product, 'id'> = {
        name: formValue.name!,
        brand: formValue.brand!,
        price: formValue.price!,
        originalPrice: formValue.originalPrice!,
        discount,
        rating: formValue.rating!,
        reviews: formValue.reviews!,
        images: formValue.images as string[],
        sizes: formValue.sizes as ProductSize[],
        details: formValue.details as string[],
        fit: formValue.fit || '',
        fabric: formValue.fabric || '',
        category: formValue.category!,
        isCodAvailable: formValue.isCodAvailable!,
        videoUrl: formValue.videoUrl || undefined,
        b2bPrice: formValue.b2bPrice || undefined,
        allowPhotoUpload: formValue.allowPhotoUpload!,
        sizeChartUrl: formValue.sizeChartUrl || undefined,
        preorderAvailable: formValue.preorderAvailable!,
        // New fields
        color: formValue.color || '',
        pattern: formValue.pattern || '',
        idealFor: formValue.idealFor || 'Unisex',
        sleeve: formValue.sleeve || '',
        closure: formValue.closure || '',
        fabricCare: formValue.fabricCare || '',
        // These don't exist on new products
        flashSale: undefined, 
        bundleOffer: undefined,
        tags: undefined
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