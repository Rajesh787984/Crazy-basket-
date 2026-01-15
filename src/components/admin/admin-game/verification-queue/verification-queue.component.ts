
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verification-queue',
  template: '<p class="p-4">Verification Queue content goes here.</p>',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationQueueComponent {}