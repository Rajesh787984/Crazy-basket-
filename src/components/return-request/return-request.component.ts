import { Component, ChangeDetectionStrategy, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StateService } from '../../services/state.service';
import { Order, OrderItem } from '../../models/order.model';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-return-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, NgOptimizedImage],
  templateUrl: './return-request.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReturnRequestComponent implements OnInit {
  stateService: StateService = inject(StateService);
  fb: FormBuilder = inject(FormBuilder);

  orderItemData = signal<{ order: Order, item: OrderItem } | null>(null);
  uploadedPhoto = signal<{ file: File, previewUrl: string } | null>(null);

  returnReasons = [
    'Size issue',
    'Received wrong item',
    'Item damaged or defective',
    'Not as described',
    'Changed my mind'
  ];

  returnForm = this.fb.group({
    reason: ['', Validators.required],
    comment: ['', Validators.required],
  });

  ngOnInit() {
    const selection = this.stateService.selectedOrderItemForReturn();
    if (selection) {
      const order = this.stateService.orders().find(o => o.id === selection.orderId);
      if (order) {
        const item = order.items.find(i => i.id === selection.itemId);
        if (item) {
          this.orderItemData.set({ order, item });
        }
      }
    }
  }

  handlePhotoUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.uploadedPhoto.set({
          file: file,
          previewUrl: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  }

  submitRequest() {
    if (this.returnForm.invalid) {
      this.stateService.showToast('Please select a reason and add a comment.');
      return;
    }
    const data = this.orderItemData();
    if (data) {
      const { reason, comment } = this.returnForm.value;
      this.stateService.requestReturn(
        data.order.id,
        data.item.id,
        reason!,
        comment!,
        this.uploadedPhoto()?.previewUrl
      );
    }
  }
}