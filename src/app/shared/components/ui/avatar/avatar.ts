import { Component, Input, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.html',
  styleUrl: './avatar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  private _name = signal<string>('U');
  
  @Input({ required: true }) set name(n: string) {
    this._name.set(n || 'U');
  }
  get name(): string {
    return this._name();
  }

  @Input() imageUrl?: string;
  @Input() size: AvatarSize = 'md';
  @Input() isPremium: boolean = false;

  readonly initial = computed(() => {
    const raw = this._name().trim();
    return raw.length > 0 ? raw.charAt(0).toUpperCase() : 'U';
  });
}
