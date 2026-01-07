import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  imports: [CommonModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  stateService: StateService = inject(StateService);
  isOpen = input.required<boolean>();
  currentUser = this.stateService.currentUser;
  
  categories = this.stateService.categories;

  currentYear = new Date().getFullYear();

  selectCategory(category: string) {
    this.stateService.navigateTo('productList', { category });
  }

  login() {
    this.stateService.navigateTo('login');
  }
}