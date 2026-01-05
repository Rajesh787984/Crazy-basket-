import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-live-chat',
  templateUrl: './admin-live-chat.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLiveChatComponent {
  dashboardUrl = 'https://dashboard.tawk.to/';
}
