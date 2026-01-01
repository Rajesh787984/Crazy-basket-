
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../../services/state.service';
import { Address } from '../../../models/address.model';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressComponent {
  stateService = inject(StateService);
  addresses = this.stateService.userAddresses;
  selectedAddressId = this.stateService.selectedAddressId;

  selectAddress(id: string) {
    this.selectedAddressId.set(id);
  }

  addNewAddress() {
    this.stateService.navigateTo('address-form');
  }

  editAddress(address: Address, event: MouseEvent) {
    event.stopPropagation();
    this.stateService.navigateTo('address-form', { addressToEdit: address });
  }

  deleteAddress(addressId: string, event: MouseEvent) {
    event.stopPropagation();
    if(confirm('Are you sure you want to delete this address?')) {
      this.stateService.deleteAddress(addressId);
    }
  }

  proceedToPayment() {
    if (this.selectedAddressId()) {
      this.stateService.navigateTo('payment');
    } else {
      this.stateService.showToast('Please select a delivery address.');
    }
  }
}
