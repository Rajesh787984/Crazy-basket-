import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { StateService } from '../../../services/state.service';
import { ThemeSettings } from '../../../models/theme-settings.model';

@Component({
  selector: 'app-admin-theme',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-theme.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminThemeComponent implements OnInit {
  stateService: StateService = inject(StateService);
  fb: FormBuilder = inject(FormBuilder);

  themeForm = this.fb.group({
    defaultTheme: ['dark', Validators.required],
    allowUserOverride: [true, Validators.required],
  });

  ngOnInit() {
    this.themeForm.patchValue(this.stateService.themeSettings());
  }

  saveSettings() {
    if (this.themeForm.valid) {
      this.stateService.updateThemeSettings(this.themeForm.value as ThemeSettings);
    }
  }
}
