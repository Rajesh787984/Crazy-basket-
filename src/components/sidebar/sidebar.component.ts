import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StateService } from '../../services/state.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  imports: [CommonModule, NgOptimizedImage, ThemeToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  stateService: StateService = inject(StateService);
  isOpen = input.required<boolean>();
  currentUser = this.stateService.currentUser;
  themeSettings = this.stateService.themeSettings;
  
  categories = this.stateService.categories;

  currentYear = new Date().getFullYear();

  selectCategory(category: string) {
    this.stateService.navigateTo('productList', { category });
  }

  login() {
    this.stateService.navigateTo('login');
  }
}