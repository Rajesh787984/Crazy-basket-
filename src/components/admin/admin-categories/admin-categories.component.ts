import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../services/state.service';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Category } from '../../../models/category.model';

@Component({
  selector: 'app-admin-categories',
  templateUrl: './admin-categories.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCategoriesComponent {
  stateService: StateService = inject(StateService);
  // FIX: Explicitly type injected FormBuilder to resolve type inference issue.
  fb: FormBuilder = inject(FormBuilder);

  categories = this.stateService.categories;
  showForm = signal(false);
  editingCategory = signal<Category | null>(null);

  categoryForm = this.fb.group({
    name: ['', Validators.required],
    img: ['', Validators.required],
    bgColor: ['', Validators.required],
  });

  editCategory(category: Category) {
    this.editingCategory.set(category);
    this.categoryForm.setValue({
      name: category.name,
      img: category.img,
      bgColor: category.bgColor,
    });
    this.showForm.set(true);
  }

  newCategory() {
    this.editingCategory.set(null);
    this.categoryForm.reset();
    this.showForm.set(true);
  }

  saveCategory() {
    if (this.categoryForm.invalid) {
      this.stateService.showToast('Please fill all fields.');
      return;
    }

    const editingCat = this.editingCategory();
    if (editingCat) {
      this.stateService.updateCategory({
        ...editingCat,
        ...this.categoryForm.value,
      } as Category);
    } else {
      this.stateService.addCategory(this.categoryForm.value as Omit<Category, 'id'>);
    }

    this.cancel();
  }
  
  deleteCategory(categoryId: string) {
    if (confirm('Are you sure you want to delete this category?')) {
        this.stateService.deleteCategory(categoryId);
    }
  }

  cancel() {
    this.editingCategory.set(null);
    this.categoryForm.reset();
    this.showForm.set(false);
  }
}