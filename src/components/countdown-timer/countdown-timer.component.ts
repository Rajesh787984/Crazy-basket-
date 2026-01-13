import { Component, ChangeDetectionStrategy, input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-countdown-timer',
  template: `
    @if(timeRemaining()) {
      <span class="font-mono text-xs font-bold">{{ timeRemaining() }}</span>
    } @else {
      <span class="font-mono text-xs font-bold">Sale Ended</span>
    }
  `,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountdownTimerComponent {
  endDate = input.required<string>();
  
  timeRemaining = signal('');

  constructor() {
    effect((onCleanup) => {
      // FIX: An input signal must be called as a function to retrieve its value.
      const endDateValue = this.endDate();
      
      if (!endDateValue) {
        this.timeRemaining.set('');
        return;
      }
      
      const endTime = new Date(endDateValue).getTime();

      // This function updates the timer and returns `false` when it's finished.
      const update = (): boolean => {
        const now = new Date().getTime();
        const distance = endTime - now;

        if (distance < 0) {
          this.timeRemaining.set('Sale Ended');
          return false;
        }

        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        this.timeRemaining.set(`${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`);
        return true;
      };

      // Run once immediately. If it has already ended, do not start the interval.
      if (!update()) {
        return;
      }

      const intervalId = setInterval(() => {
        if (!update()) {
          clearInterval(intervalId);
        }
      }, 1000);

      // The onCleanup function is crucial. It runs when the effect is destroyed
      // (e.g., when the component is destroyed or the endDate input changes),
      // preventing memory leaks from old intervals.
      onCleanup(() => {
        clearInterval(intervalId);
      });
    });
  }

  private pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }
}