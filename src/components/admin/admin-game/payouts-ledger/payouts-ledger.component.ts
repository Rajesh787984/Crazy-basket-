import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payouts-ledger',
  template: '<p class="p-4">Payouts Ledger content goes here.</p>',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayoutsLedgerComponent {}
