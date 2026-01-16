import { Component, ChangeDetectionStrategy, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Theme } from '../../models/theme-settings.model';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div (click)="toggleTheme()" [title]="'Switch to ' + nextTheme() + ' mode'" class="flex items-center p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 w-full cursor-pointer">
      @switch (currentTheme()) {
        @case ('light') {
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          <span class="font-semibold dark:text-gray-200">Light Mode</span>
        }
        @case ('dark') {
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          <span class="font-semibold dark:text-gray-200">Dark Mode</span>
        }
        @case ('system') {
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          <span class="font-semibold dark:text-gray-200">System</span>
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent implements OnInit {
  themes: Theme[] = ['light', 'dark', 'system'];
  currentTheme = signal<Theme>('system');
  nextTheme = signal<Theme>('light');

  ngOnInit() {
    this.loadTheme();
    // Listen for storage changes from other tabs to keep UI in sync
    window.addEventListener('storage', (event) => {
      if (event.key === 'theme') {
        this.loadTheme();
      }
    });
  }

  loadTheme() {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    this.currentTheme.set(storedTheme && this.themes.includes(storedTheme) ? storedTheme : 'system');
    this.updateNextTheme();
  }

  toggleTheme() {
    const currentIndex = this.themes.indexOf(this.currentTheme());
    const nextIndex = (currentIndex + 1) % this.themes.length;
    const newTheme = this.themes[nextIndex];
    localStorage.setItem('theme', newTheme);
    
    // Manually dispatch a storage event so the app component in the current tab picks up the change immediately.
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'theme',
        newValue: newTheme,
      })
    );
    
    this.currentTheme.set(newTheme);
    this.updateNextTheme();
  }

  private updateNextTheme() {
    const currentIndex = this.themes.indexOf(this.currentTheme());
    const nextIndex = (currentIndex + 1) % this.themes.length;
    this.nextTheme.set(this.themes[nextIndex]);
  }
}
