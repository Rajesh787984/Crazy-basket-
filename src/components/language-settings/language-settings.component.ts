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
  currentLanguage = this.stateService.currentLanguage;

  languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
  ];

  selectLanguage(langCode: string) {
    this.stateService.setLanguage(langCode);
  }
}