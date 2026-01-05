
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-language-settings',
  templateUrl: './language-settings.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSettingsComponent {
  stateService: StateService = inject(StateService);

  languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
  ];

  selectLanguage(langName: string) {
    // In a real app, this would change the app's language state.
    // For now, we just show a toast message.
    this.stateService.showToast(`Language set to ${langName}.`);
  }
}
