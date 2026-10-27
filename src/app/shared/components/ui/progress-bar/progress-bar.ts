import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent {
  @Input({ required: true }) value: number = 0; // 0 - 100
  @Input() label?: string;
  @Input() valueLabel?: string;
  @Input() height: number = 6;
  @Input() color: string = 'var(--color-primary)';
  @Input() trackColor: string = 'var(--color-bg-alt)';
  @Input() showHeader: boolean = true;

  get normalizedValue(): number {
    return Math.min(100, Math.max(0, this.value));
  }
}
