
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletComponent {
  stateService: StateService = inject(StateService);
  currentUser = this.stateService.currentUser;

  transactions = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    return this.stateService.transactions().filter(tx => tx.userId === user.id);
  });
}
