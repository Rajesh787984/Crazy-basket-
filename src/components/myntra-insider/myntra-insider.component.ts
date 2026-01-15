
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-myntra-insider',
  template: '<p class="p-4">Myntra Insider content goes here.</p>',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyntraInsiderComponent {}