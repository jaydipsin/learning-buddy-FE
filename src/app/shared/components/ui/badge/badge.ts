import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'teal' | 'neutral';
export type BadgeSize = 'sm' | 'md';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.html',
  styleUrl: './badge.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'blue';
  @Input() size: BadgeSize = 'sm';
  @Input() dot: boolean = false;
  @Input() text?: string;

  get badgeClasses(): string {
    return `badge-minimal badge-${this.variant} badge-size-${this.size}`;
  }
}
