
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-partner-program',
  templateUrl: './partner-program.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartnerProgramComponent {
  stateService: StateService = inject(StateService);
  currentUser = this.stateService.currentUser;

  copyCode() {
    const user = this.currentUser();
    if (user && user.referralCode) {
        const link = `crazybasket.com/ref/${user.referralCode}`;
        navigator.clipboard.writeText(link).then(() => {
            this.stateService.showToast('Invite link copied!');
        });
    }
  }
}
