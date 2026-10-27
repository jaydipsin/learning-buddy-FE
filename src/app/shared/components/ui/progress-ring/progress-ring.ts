import { Component, Input, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ProgressRingSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-progress-ring',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-ring.html',
  styleUrl: './progress-ring.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressRingComponent {
  private _value = signal(0);
  private _size = signal<ProgressRingSize | number>('md');
  private _strokeWidth = signal<number | undefined>(undefined);

  @Input({ required: true }) set value(v: number) {
    this._value.set(Math.min(100, Math.max(0, v)));
  }
  get value(): number {
    return this._value();
  }

  @Input() set size(s: ProgressRingSize | number) {
    this._size.set(s);
  }
  get size(): ProgressRingSize | number {
    return this._size();
  }

  @Input() set strokeWidth(w: number) {
    this._strokeWidth.set(w);
  }

  @Input() color: string = 'var(--color-primary)';
  @Input() trackColor: string = 'var(--color-border-subtle)';
  @Input() showLabel: boolean = true;
  @Input() label?: string;
  @Input() subLabel?: string;

  readonly pixelSize = computed(() => {
    const s = this._size();
    if (typeof s === 'number') return s;
    switch (s) {
      case 'sm': return 44;
      case 'lg': return 96;
      case 'md':
      default: return 64;
    }
  });

  readonly stroke = computed(() => {
    const custom = this._strokeWidth();
    if (custom !== undefined) return custom;
    const px = this.pixelSize();
    if (px <= 44) return 4;
    if (px >= 96) return 8;
    return 6;
  });

  readonly radius = computed(() => {
    return (this.pixelSize() - this.stroke()) / 2;
  });

  readonly circumference = computed(() => {
    return 2 * Math.PI * this.radius();
  });

  readonly strokeDashoffset = computed(() => {
    const pct = this._value();
    return this.circumference() - (pct / 100) * this.circumference();
  });
}
