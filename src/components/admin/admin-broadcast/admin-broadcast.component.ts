import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { StateService } from '../../../services/state.service';

@Component({
  selector: 'app-admin-broadcast',
  standalone: true,
  templateUrl: './admin-broadcast.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminBroadcastComponent {
  stateService: StateService = inject(StateService);
  fb: FormBuilder = inject(FormBuilder);
  
  isSending = signal(false);

  broadcastForm = this.fb.group({
    amount: [null, [Validators.required, Validators.min(1)]],
    reason: ['', [Validators.required, Validators.minLength(5)]],
    confirmation: ['', [Validators.required, Validators.pattern('CONFIRM')]],
  });

  async sendBroadcast() {
    if (this.broadcastForm.invalid) {
      this.stateService.showToast('Please fill out all fields correctly and type CONFIRM.');
      return;
    }

    if (this.isSending()) return;
    this.isSending.set(true);
    
    const { amount, reason } = this.broadcastForm.getRawValue();

    try {
      const userCount = await this.stateService.broadcastWalletCredit(amount!, reason!);
      this.stateService.showToast(`Successfully credited ₹${amount} to ${userCount} users.`);
      this.broadcastForm.reset();
    } catch (error) {
      console.error('Broadcast failed:', error);
      this.stateService.showToast('An error occurred during the broadcast.');
    } finally {
      this.isSending.set(false);
    }
  }
}