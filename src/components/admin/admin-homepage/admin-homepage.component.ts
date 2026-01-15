import { Component, ChangeDetectionStrategy, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../services/state.service';

@Component({
  selector: 'app-admin-homepage',
  templateUrl: './admin-homepage.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHomepageComponent {
  stateService: StateService = inject(StateService);
  sections: WritableSignal<string[]>;

  constructor() {
    // Create a local copy to manipulate before saving
    this.sections = signal([...this.stateService.homePageSections()]);
  }

  moveSection(index: number, direction: 'up' | 'down') {
    this.sections.update(currentSections => {
      const sections = [...currentSections];
      const newIndex = direction === 'up' ? index - 1 : index + 1;

      if (newIndex < 0 || newIndex >= sections.length) {
        return sections;
      }
      
      const temp = sections[index];
      sections[index] = sections[newIndex];
      sections[newIndex] = temp;
      
      return sections;
    });
  }

  getSectionName(id: string): string {
    const names: { [key: string]: string } = {
      slider: 'Hero Slider',
      deals: 'Top Deals',
      trending: 'Trending Products',
      recentlyViewed: 'Recently Viewed Products'
    };
    return names[id] || 'Unknown Section';
  }

  saveLayout() {
    this.stateService.updateHomePageSections(this.sections());
  }
}