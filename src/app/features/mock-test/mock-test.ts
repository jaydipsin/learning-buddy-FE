import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BASE_BACKEND_URL } from '../../../enviroment/enviroment';
import {
  QuestionNavPaletteComponent,
  QuestionPaletteItem,
  QuestionStatus,
} from '../../shared/components/ui';

interface QuestionDiagram {
  ref: string;
  description?: string;
  page?: number;
}

interface MockQuestion {
  id: string;
  subject: string;
  prompt: string;
  passageText?: string;
  options: { label: string; text: string }[];
  diagrams?: QuestionDiagram[];
  diagramRef?: string;
  diagramDescription?: string;
}

interface AttemptResponse {
  success: boolean;
  data: {
    attemptId: string;
    testId: string;
    title: string;
    remainingSeconds: number;
    status: string;
    questions: MockQuestion[];
    answers: { questionId: string; selectedOptionIndex?: number; isSkipped?: boolean }[];
  };
}

@Component({
  selector: 'app-mock-test',
  standalone: true,
  imports: [CommonModule, QuestionNavPaletteComponent],
  templateUrl: './mock-test.html',
  styleUrl: './mock-test.css',
})
export class MockTest implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private attemptId = '';
  private testId = '';
  private deadline = 0;
  private timerHandle: ReturnType<typeof setInterval> | null = null;

  readonly title = signal('Mock test');
  readonly loadedQuestions = signal<MockQuestion[]>([]);
  readonly currentIndex = signal(0);
  readonly answers = signal<Record<string, string>>({});
  readonly submitted = signal<Set<string>>(new Set());
  readonly marked = signal<Set<string>>(new Set());
  readonly failedImages = signal<Set<string>>(new Set());
  readonly isLoadingQuestion = signal(true);
  readonly isSubmitting = signal(false);
  readonly isComplete = signal(false);
  readonly error = signal('');
  readonly feedback = signal<'idle' | 'saved' | 'marked'>('idle');
  readonly remainingSeconds = signal(0);

  readonly currentQuestion = computed(() => this.loadedQuestions()[this.currentIndex()]);
  readonly subjects = computed(() => [...new Set(this.loadedQuestions().map((q) => q.subject))].join(', '));
  readonly answeredCount = computed(() => this.submitted().size);
  readonly progressPercent = computed(() => this.loadedQuestions().length
    ? Math.round((this.answeredCount() / this.loadedQuestions().length) * 100) : 0);
  readonly paletteQuestions = computed<QuestionPaletteItem[]>(() =>
    this.loadedQuestions().map((question, index) => ({
      id: question.id,
      index: index + 1,
      status: this.questionStatus(question.id),
    })),
  );

  ngOnInit(): void {
    this.attemptId = this.route.snapshot.queryParamMap.get('attemptId') || '';
    if (!this.attemptId) {
      this.error.set('Open an attempt from the mock-test generator to load your questions.');
      this.isLoadingQuestion.set(false);
      return;
    }
    void this.loadAttempt();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  private async loadAttempt(): Promise<void> {
    this.isLoadingQuestion.set(true);
    this.error.set('');
    try {
      const response = await firstValueFrom(this.http.get<AttemptResponse>(
        `${BASE_BACKEND_URL}/api/test/attempts/${encodeURIComponent(this.attemptId)}/questions`,
      ));
      const attempt = response.data;
      this.testId = attempt.testId;
      this.title.set(attempt.title || 'Mock test');
      this.loadedQuestions.set(attempt.questions);
      const answers: Record<string, string> = {};
      for (const saved of attempt.answers || []) {
        const question = attempt.questions.find((q) => q.id === saved.questionId);
        const option = saved.selectedOptionIndex == null ? undefined
          : question?.options[saved.selectedOptionIndex];
        if (option && !saved.isSkipped) answers[saved.questionId] = option.label;
      }
      this.answers.set(answers);
      this.submitted.set(new Set(Object.keys(answers)));
      this.remainingSeconds.set(attempt.remainingSeconds);
      this.isComplete.set(attempt.status !== 'in-progress' && attempt.status !== 'expired');
      if (attempt.status === 'expired') {
        await this.completeRequest();
      } else if (!this.isComplete()) {
        this.deadline = Date.now() + attempt.remainingSeconds * 1000;
        this.timerHandle = setInterval(() => {
          this.remainingSeconds.set(Math.max(0, Math.ceil((this.deadline - Date.now()) / 1000)));
          if (!this.remainingSeconds() && !this.isSubmitting()) {
            this.stopTimer();
            void this.finishAttempt();
          }
        }, 1000);
      }
    } catch (error) {
      this.error.set(this.errorMessage(error, 'Unable to load this test. Please try again.'));
    } finally {
      this.isLoadingQuestion.set(false);
    }
  }

  formatTime(totalSeconds: number): string {
    return [Math.floor(totalSeconds / 3600), Math.floor((totalSeconds % 3600) / 60), totalSeconds % 60]
      .map((part) => String(part).padStart(2, '0')).join(':');
  }

  selectAnswer(option: string): void {
    const question = this.currentQuestion();
    if (!question || this.submitted().has(question.id) || this.isSubmitting()
      || !this.remainingSeconds() || this.questionHasImageError(question)) return;
    this.answers.update((answers) => ({ ...answers, [question.id]: option }));
    this.feedback.set('idle');
  }

  toggleMark(): void {
    const id = this.currentQuestion()?.id;
    if (!id) return;
    this.marked.update((marked) => {
      const next = new Set(marked);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    this.feedback.set(this.marked().has(id) ? 'marked' : 'idle');
  }

  goToQuestion(index: number): void {
    if (index < 0 || index >= this.loadedQuestions().length || this.isSubmitting()) return;
    this.currentIndex.set(index);
    this.feedback.set('idle');
  }

  async submitAndContinue(): Promise<void> {
    const question = this.currentQuestion();
    if (!question || this.isSubmitting() || !this.answers()[question.id]
      || !this.remainingSeconds() || this.questionHasImageError(question)) return;
    this.isSubmitting.set(true);
    this.error.set('');
    try {
      if (!this.submitted().has(question.id)) {
        await firstValueFrom(this.http.patch(
          `${BASE_BACKEND_URL}/api/test/submit-answer/${encodeURIComponent(this.attemptId)}`,
          { testId: this.testId, questionId: question.id, answer: this.answers()[question.id] },
        ));
        this.submitted.update((submitted) => new Set(submitted).add(question.id));
      }
      this.feedback.set('saved');
      if (this.currentIndex() === this.loadedQuestions().length - 1) {
        await this.completeRequest();
      } else {
        this.currentIndex.update((index) => index + 1);
      }
    } catch (error) {
      this.error.set(this.errorMessage(error, 'Your answer could not be saved. Please try again.'));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async finishAttempt(): Promise<void> {
    if (this.isSubmitting() || this.isComplete() || !this.testId) return;
    this.isSubmitting.set(true);
    this.error.set('');
    try {
      await this.completeRequest();
    } catch (error) {
      this.error.set(this.errorMessage(error, 'Unable to finish your test. Please try again.'));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private async completeRequest(): Promise<void> {
    await firstValueFrom(this.http.post(
      `${BASE_BACKEND_URL}/api/test/attempts/${encodeURIComponent(this.attemptId)}/complete`, {},
    ));
    this.isComplete.set(true);
    this.stopTimer();
  }

  diagramsFor(question: MockQuestion): QuestionDiagram[] {
    if (question.diagrams?.length) return question.diagrams;
    return question.diagramRef
      ? [{ ref: question.diagramRef, description: question.diagramDescription }] : [];
  }

  diagramUrl(ref: string): string {
    // The scraper only writes images served by our own API; do not load arbitrary URLs.
    return ref.startsWith('/media/pyq/') ? `${BASE_BACKEND_URL}${ref}` : '';
  }

  onDiagramError(ref: string): void {
    this.failedImages.update((images) => new Set(images).add(ref));
  }

  questionHasImageError(question: MockQuestion): boolean {
    return this.diagramsFor(question).some((diagram) =>
      this.failedImages().has(diagram.ref) || !this.diagramUrl(diagram.ref));
  }

  private questionStatus(id: string): QuestionStatus {
    const answered = this.submitted().has(id);
    const marked = this.marked().has(id);
    if (answered && marked) return 'marked-answered';
    if (marked) return 'marked';
    return answered ? 'answered' : 'unanswered';
  }

  private errorMessage(error: unknown, fallback: string): string {
    return error instanceof HttpErrorResponse && typeof error.error?.message === 'string'
      ? error.error.message : fallback;
  }

  private stopTimer(): void {
    if (this.timerHandle) clearInterval(this.timerHandle);
    this.timerHandle = null;
  }

  previousQuestion(): void {
    this.goToQuestion(this.currentIndex() - 1);
  }

  exitTest(): void {
    void this.router.navigate(['/student/mock-test']);
  }
}
