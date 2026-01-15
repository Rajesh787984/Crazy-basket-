

import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StateService } from '../../services/state.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

declare var Tawk_API: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  imports: [CommonModule, TranslatePipe, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  stateService: StateService = inject(StateService);
  currentUser = this.stateService.currentUser;

  logout() {
    this.stateService.logout();
  }

  openLiveChat() {
    if (typeof Tawk_API !== 'undefined' && Tawk_API.maximize) {
      Tawk_API.maximize();
    } else {
      this.stateService.showToast('Live chat is currently unavailable.');
    }
  }
}
