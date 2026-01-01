
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { Address } from '../../models/address.model';

@Component({
  selector: 'app-address-form',
  templateUrl: './address-form.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressFormComponent implements OnInit {
  stateService = inject(StateService);
  fb = inject(FormBuilder);
  
  addressToEdit: Address | null = null;
  isEditMode = false;

  addressForm = this.fb.group({
    name: ['', Validators.required],
    mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
    locality: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required]
  });

  ngOnInit() {
    this.addressToEdit = this.stateService.addressToEdit();
    this.isEditMode = !!this.addressToEdit;
    if (this.isEditMode && this.addressToEdit) {
      this.addressForm.patchValue(this.addressToEdit);
    }
  }

  saveAddress() {
    if (this.addressForm.valid) {
      if (this.isEditMode && this.addressToEdit) {
        const updatedAddress: Address = {
          ...this.addressToEdit,
          ...this.addressForm.value
        };
        this.stateService.updateAddress(updatedAddress);
      } else {
        this.stateService.addAddress(this.addressForm.value as Omit<Address, 'id' | 'isDefault'>);
      }
    } else {
        this.stateService.showToast('Please fill all the fields correctly.');
    }
  }
}
