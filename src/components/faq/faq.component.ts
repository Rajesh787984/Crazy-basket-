
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqComponent {
  stateService: StateService = inject(StateService);
  faqs = this.stateService.faqs;
}
