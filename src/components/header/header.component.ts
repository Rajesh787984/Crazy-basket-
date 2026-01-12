import { Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StateService } from '../../services/state.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true, // ✅ यह सबसे ज़रूरी है
  imports: [CommonModule, FormsModule, RouterModule, NgOptimizedImage], 
})
export class HeaderComponent {
  stateService = inject(StateService);
  authService = inject(AuthService);
  
  searchQuery = '';

  // सर्च बार के लिए लॉजिक
  onSearch() {
    if (this.searchQuery.trim()) {
      this.stateService.navigateTo('productList', { search: this.searchQuery });
    }
  }

  // अगर यूजर लॉगआउट करना चाहे
  logout() {
    this.authService.logout();
  }
}
