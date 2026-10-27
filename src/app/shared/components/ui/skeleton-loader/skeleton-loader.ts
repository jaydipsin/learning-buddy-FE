import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonVariant = 'card' | 'stat' | 'list-item' | 'text' | 'avatar' | 'rect';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-loader.html',
  styleUrl: './skeleton-loader.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonLoaderComponent {
  @Input() variant: SkeletonVariant = 'text';
  @Input() count: number = 1;
  @Input() height?: string | number;
  @Input() width?: string | number;
  @Input() radius?: string;

  get countArray(): number[] {
    return Array.from({ length: Math.max(1, this.count) }, (_, i) => i);
  }

  get computedHeight(): string | undefined {
    if (this.height === undefined) return undefined;
    return typeof this.height === 'number' ? `${this.height}px` : this.height;
  }

  get computedWidth(): string | undefined {
    if (this.width === undefined) return undefined;
    return typeof this.width === 'number' ? `${this.width}px` : this.width;
  }
}
