
import { Component, ChangeDetectionStrategy, input, signal, OnInit, OnDestroy } from '@angular/core';
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
export class CountdownTimerComponent implements OnInit, OnDestroy {
  endDate = input.required<string>();
  
  timeRemaining = signal('');
  private intervalId?: any;

  ngOnInit() {
    this.startCountdown();
  }

  ngOnDestroy() {
    this.stopCountdown();
  }

  startCountdown() {
    this.updateCountdown();
    this.intervalId = setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  stopCountdown() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  
  updateCountdown() {
    const now = new Date().getTime();
    const end = new Date(this.endDate()).getTime();
    const distance = end - now;

    if (distance < 0) {
      this.timeRemaining.set('');
      this.stopCountdown();
      return;
    }

    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    this.timeRemaining.set(`${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`);
  }

  private pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }
}
