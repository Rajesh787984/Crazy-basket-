import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { Address } from '../../models/address.model';

@Component({
  selector: 'app-manage-addresses',
  standalone: true,
  templateUrl: './manage-addresses.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageAddressesComponent {
  stateService: StateService = inject(StateService);
  addresses = this.stateService.currentUserAddresses;

  addNewAddress() {
    this.stateService.navigateTo('address-form');
  }

  editAddress(address: Address) {
    this.stateService.navigateTo('address-form', { addressToEdit: address });
  }

  deleteAddress(addressId: string) {
    if(confirm('Are you sure you want to delete this address?')) {
      this.stateService.deleteAddress(addressId);
    }
  }

  setDefaultAddress(addressId: string) {
    this.stateService.setDefaultAddress(addressId);
  }
}
