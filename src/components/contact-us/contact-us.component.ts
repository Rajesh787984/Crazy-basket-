
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactUsComponent {
  stateService = inject(StateService);
  contactInfo = this.stateService.contactInfo;
}
