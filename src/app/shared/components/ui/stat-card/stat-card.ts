import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatCardBadgeVariant = 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'teal';
export type StatTrend = 'up' | 'down' | 'flat';

export interface StatCardBadge {
  text: string;
  variant?: StatCardBadgeVariant;
}

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string | number;
  @Input() subtitle?: string;
  @Input() progress?: number; // 0 - 100
  @Input() progressColor?: string; // Custom color var if needed
  @Input() badge?: StatCardBadge;
  @Input() trend?: StatTrend;
  @Input() trendValue?: string;
  @Input() footerLeft?: string;
  @Input() footerRight?: string;

  get badgeClass(): string {
    const v = this.badge?.variant || 'blue';
    return `badge-${v}`;
  }
}
