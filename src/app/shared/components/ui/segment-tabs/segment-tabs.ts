import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SegmentTab {
  id: string;
  label: string;
  icon?: string;
  count?: number;
  disabled?: boolean;
}

@Component({
  selector: 'app-segment-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './segment-tabs.html',
  styleUrl: './segment-tabs.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentTabsComponent {
  @Input({ required: true }) tabs: SegmentTab[] = [];
  @Input({ required: true }) activeTab!: string;
  @Input() size: 'sm' | 'md' = 'md';
  @Input() fullWidth: boolean = false;

  @Output() tabChange = new EventEmitter<string>();

  selectTab(tab: SegmentTab): void {
    if (tab.disabled || tab.id === this.activeTab) return;
    this.activeTab = tab.id;
    this.tabChange.emit(tab.id);
  }
}
