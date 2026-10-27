import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ChipOption {
  id: string | number;
  label: string;
  icon?: string;
  badge?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-chip-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chip-select.html',
  styleUrl: './chip-select.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipSelectComponent {
  @Input({ required: true }) options: ChipOption[] = [];
  @Input() selected: (string | number)[] = [];
  @Input() mode: 'single' | 'multi' = 'multi';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled: boolean = false;
  @Input() minRequired: number = 0; // Prevent deselecting below this threshold

  @Output() selectionChange = new EventEmitter<(string | number)[]>();
  @Output() toggleOption = new EventEmitter<string | number>();

  isSelected(id: string | number): boolean {
    return this.selected.includes(id);
  }

  onChipClick(option: ChipOption): void {
    if (this.disabled || option.disabled) return;

    const id = option.id;
    let next: (string | number)[];

    if (this.mode === 'single') {
      if (this.isSelected(id) && this.minRequired === 0) {
        next = [];
      } else {
        next = [id];
      }
    } else {
      if (this.isSelected(id)) {
        if (this.selected.length <= this.minRequired) {
          return; // Block deselecting below minimum
        }
        next = this.selected.filter(item => item !== id);
      } else {
        next = [...this.selected, id];
      }
    }

    this.selected = next;
    this.selectionChange.emit(next);
    this.toggleOption.emit(id);
  }
}
