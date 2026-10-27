import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-countdown-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './countdown-timer.html',
  styleUrl: './countdown-timer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountdownTimerComponent {
  private _remainingSeconds = signal<number>(0);
  private _totalSeconds = signal<number>(0);

  @Input({ required: true }) set remainingSeconds(sec: number) {
    this._remainingSeconds.set(Math.max(0, sec));
  }
  get remainingSeconds(): number {
    return this._remainingSeconds();
  }

  @Input() set totalSeconds(sec: number) {
    this._totalSeconds.set(Math.max(0, sec));
  }
  get totalSeconds(): number {
    return this._totalSeconds();
  }

  @Input() warningThreshold: number = 300; // 5 mins
  @Input() criticalThreshold: number = 60; // 1 min

  @Output() timeUp = new EventEmitter<void>();

  readonly formattedTime = computed(() => {
    const s = this._remainingSeconds();
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  });

  readonly urgencyState = computed<'normal' | 'warning' | 'critical'>(() => {
    const s = this._remainingSeconds();
    if (s <= this.criticalThreshold) return 'critical';
    if (s <= this.warningThreshold) return 'warning';
    return 'normal';
  });

  constructor() {
    effect(() => {
      if (this._remainingSeconds() === 0) {
        this.timeUp.emit();
      }
    });
  }
}
