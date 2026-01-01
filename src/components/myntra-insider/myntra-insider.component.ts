
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-myntra-insider',
  templateUrl: './myntra-insider.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyntraInsiderComponent {
  stateService = inject(StateService);
  currentUser = this.stateService.currentUser;
}
