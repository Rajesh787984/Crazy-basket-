import { Component, ChangeDetectionStrategy, signal, computed, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pull-to-refresh',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pull-to-refresh.component.html',
  host: {
    '(touchstart)': 'onTouchStart($event)',
    '(touchmove)': 'onTouchMove($event)',
    '(touchend)': 'onTouchEnd()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PullToRefreshComponent {
  private elementRef: ElementRef<HTMLElement> = inject(ElementRef);

  private readonly PULL_THRESHOLD = 80; // pixels to pull to trigger refresh
  private readonly PULL_RESISTANCE = 0.6; // makes pulling feel heavier

  private startY = 0;
  private isDragging = signal(false);
  
  pullPosition = signal(0);
  isRefreshing = signal(false);

  // Dynamic styles for the content wrapper to create the pull effect
  wrapperStyle = computed(() => ({
    transform: `translateY(${this.pullPosition()}px)`,
    transition: this.isDragging() ? 'none' : 'transform 0.3s ease-out'
  }));
  
  // Opacity of the refresh icon, fades in as user pulls
  iconOpacity = computed(() => {
    return Math.min(this.pullPosition() / this.PULL_THRESHOLD, 1);
  });
  
  // Rotation of the refresh icon to provide feedback
  iconTransform = computed(() => {
    const rotation = Math.min((this.pullPosition() / this.PULL_THRESHOLD) * 360, 360);
    return `rotate(${rotation}deg)`;
  });

  onTouchStart(event: TouchEvent) {
    if (this.isRefreshing()) return;
    
    // Find the main scrollable element within this component's content
    const mainContent = this.elementRef.nativeElement.querySelector('.overflow-y-auto');

    // Only start tracking if the user is at the very top of the scrollable content
    if (mainContent && mainContent.scrollTop === 0) {
      // Check if the touch is inside a horizontally scrollable element
      let target = event.target as HTMLElement | null;
      while(target && target !== this.elementRef.nativeElement) {
          // If an element's scroll width is larger than its client width, it's scrollable
          if (target.scrollWidth > target.clientWidth) {
              this.isDragging.set(false);
              return; // Don't initiate pull-to-refresh, allow horizontal scroll
          }
          target = target.parentElement;
      }

      this.startY = event.touches[0].pageY;
      this.isDragging.set(true);
    } else {
      this.isDragging.set(false);
    }
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging() || this.isRefreshing()) return;

    const currentY = event.touches[0].pageY;
    let diff = currentY - this.startY;
    
    // We only care about pulling down
    if (diff < 0) {
      diff = 0;
    }
    
    // Apply resistance to make the pull feel more natural
    const resistedDiff = diff * this.PULL_RESISTANCE;
    this.pullPosition.set(resistedDiff);
  }

  onTouchEnd() {
    if (!this.isDragging() || this.isRefreshing()) return;

    this.isDragging.set(false);

    // If the user pulled past the threshold, trigger the refresh
    if (this.pullPosition() >= this.PULL_THRESHOLD) {
      this.triggerRefresh();
    } else {
      // Snap back to original position if threshold not met
      this.pullPosition.set(0);
    }
  }

  private triggerRefresh() {
    this.isRefreshing.set(true);
    // Keep the indicator visible during the refresh animation
    this.pullPosition.set(60); 
    
    // Wait for a moment to show the spinner, then reload the page
    setTimeout(() => {
        window.location.reload();
    }, 800); 
  }
}
