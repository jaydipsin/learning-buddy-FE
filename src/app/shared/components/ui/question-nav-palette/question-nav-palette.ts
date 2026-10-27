import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type QuestionStatus = 'answered' | 'unanswered' | 'marked' | 'marked-answered';

export interface QuestionPaletteItem {
  id: string | number;
  index: number; // 1-based index (e.g. 1, 2, 3...)
  status: QuestionStatus;
}

@Component({
  selector: 'app-question-nav-palette',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './question-nav-palette.html',
  styleUrl: './question-nav-palette.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionNavPaletteComponent {
  @Input({ required: true }) questions: QuestionPaletteItem[] = [];
  @Input() currentIndex: number = 0; // 0-based active index
  @Input() showLegend: boolean = true;

  @Output() selectQuestion = new EventEmitter<number>();

  onSelect(index: number): void {
    this.selectQuestion.emit(index);
  }
}
