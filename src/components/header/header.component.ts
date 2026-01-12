import { Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StateService } from '../../services/state.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,  // ✅ यह लाइन बहुत ज़रूरी है
  imports: [CommonModule, FormsModule, RouterModule, NgOptimizedImage],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  stateService = inject(StateService);
  authService = inject(AuthService);
  
  searchQuery = '';

  onSearch() {
    if (this.searchQuery.trim()) {
      this.stateService.navigateTo('productList', { search: this.searchQuery });
    }
  }
}
