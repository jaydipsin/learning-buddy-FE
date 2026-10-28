import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  QuestionNavPaletteComponent,
  QuestionPaletteItem,
  QuestionStatus,
} from '../../shared/components/ui';

interface MockQuestion {
  id: string;
  subject: 'Physics' | 'Chemistry' | 'Mathematics';
  prompt: string;
  options: string[];
  explanation: string;
}

const QUESTION_BANK: MockQuestion[] = [
  {
    id: 'physics-01',
    subject: 'Physics',
    prompt: 'A particle of mass m moves in a circular path of constant radius r. If its centripetal acceleration is v²/r, which expression gives the power delivered by the centripetal force?',
    options: ['mv²/r', 'Zero', 'mv²', 'mr²'],
    explanation: 'The centripetal force is perpendicular to instantaneous velocity, so its work and power are both zero.',
  },
  {
    id: 'chemistry-01',
    subject: 'Chemistry',
    prompt: 'Which property of a catalyst changes the rate of a reaction without changing the equilibrium constant?',
    options: ['It changes the enthalpy', 'It lowers activation energy', 'It changes the temperature', 'It changes the equilibrium composition'],
    explanation: 'A catalyst provides an alternate pathway with lower activation energy for both forward and reverse reactions.',
  },
  {
    id: 'mathematics-01',
    subject: 'Mathematics',
    prompt: 'If the roots of x² − 6x + k = 0 differ by 2, what is the value of k?',
    options: ['5', '8', '9', '10'],
    explanation: 'The difference between roots is √(b² − 4ac)/a. Therefore √(36 − 4k) = 2, giving k = 8.',
  },
  {
    id: 'physics-02',
    subject: 'Physics',
    prompt: 'A body is projected vertically upward with speed u. At what height is its kinetic energy one-fourth of its initial value?',
    options: ['u²/8g', '3u²/8g', 'u²/2g', '3u²/4g'],
    explanation: 'At the required height, v² = u²/4. Using v² = u² − 2gh gives h = 3u²/8g.',
  },
  {
    id: 'chemistry-02',
    subject: 'Chemistry',
    prompt: 'The pH of a 0.001 M strong monoprotic acid solution at 25°C is:',
    options: ['1', '2', '3', '11'],
    explanation: 'A strong acid dissociates completely, so [H⁺] = 10⁻³ M and pH = 3.',
  },
  {
    id: 'mathematics-02',
    subject: 'Mathematics',
    prompt: 'The derivative of sin⁻¹(2x√(1 − x²)) for 0 ≤ x ≤ 1/√2 is:',
    options: ['2', '1', '2x', '√(1 − x²)'],
    explanation: 'The expression inside the inverse sine is sin(2 sin⁻¹x), so the derivative is 2 on this interval.',
  },
  {
    id: 'physics-03',
    subject: 'Physics',
    prompt: 'Two resistors of 4 Ω and 6 Ω are connected in parallel across a 12 V battery. The total current is:',
    options: ['1.2 A', '2 A', '5 A', '10 A'],
    explanation: 'The parallel resistance is 2.4 Ω. Hence total current is 12/2.4 = 5 A.',
  },
  {
    id: 'chemistry-03',
    subject: 'Chemistry',
    prompt: 'Which quantum number determines the orientation of an orbital in space?',
    options: ['Principal quantum number', 'Azimuthal quantum number', 'Magnetic quantum number', 'Spin quantum number'],
    explanation: 'The magnetic quantum number (mₗ) specifies the orientation of an orbital.',
  },
  {
    id: 'mathematics-03',
    subject: 'Mathematics',
    prompt: 'If A is a 2 × 2 matrix and |A| = 3, then |2A| is:',
    options: ['6', '9', '12', '18'],
    explanation: 'For a 2 × 2 matrix, |cA| = c²|A|. Thus |2A| = 4 × 3 = 12.',
  },
  {
    id: 'physics-04',
    subject: 'Physics',
    prompt: 'A wave has frequency 500 Hz and wavelength 0.68 m. Its speed is:',
    options: ['340 m/s', '735 m/s', '250 m/s', '0.00136 m/s'],
    explanation: 'Wave speed v = fλ = 500 × 0.68 = 340 m/s.',
  },
  {
    id: 'chemistry-04',
    subject: 'Chemistry',
    prompt: 'The hybridisation of the central atom in BF₃ is:',
    options: ['sp', 'sp²', 'sp³', 'dsp²'],
    explanation: 'Boron forms three sigma bonds and has a trigonal planar arrangement: sp² hybridisation.',
  },
  {
    id: 'mathematics-04',
    subject: 'Mathematics',
    prompt: 'The area enclosed between y = x and y = x² from x = 0 to x = 1 is:',
    options: ['1/3', '1/6', '1/2', '2/3'],
    explanation: 'The area is ∫₀¹(x − x²)dx = 1/2 − 1/3 = 1/6.',
  },
  {
    id: 'physics-05',
    subject: 'Physics',
    prompt: 'The dimensional formula of impulse is the same as that of:',
    options: ['Force', 'Momentum', 'Energy', 'Power'],
    explanation: 'Impulse equals change in momentum, so both have dimensions [MLT⁻¹].',
  },
  {
    id: 'chemistry-05',
    subject: 'Chemistry',
    prompt: 'Which of these is a colligative property?',
    options: ['Viscosity', 'Surface tension', 'Elevation in boiling point', 'Refractive index'],
    explanation: 'Elevation in boiling point depends on the number of solute particles, not their identity.',
  },
  {
    id: 'mathematics-05',
    subject: 'Mathematics',
    prompt: 'The sum of the first n odd natural numbers is:',
    options: ['n²', 'n(n + 1)', '2n²', 'n² + 1'],
    explanation: 'The first n odd numbers form an arithmetic progression whose sum is n².',
  },
];

@Component({
  selector: 'app-mock-test',
  standalone: true,
  imports: [CommonModule, QuestionNavPaletteComponent],
  templateUrl: './mock-test.html',
  styleUrl: './mock-test.css',
})
export class MockTest implements OnInit, OnDestroy {
  private readonly router = inject(Router);

  readonly batchSize = 5;
  readonly loadedQuestions = signal<MockQuestion[]>(QUESTION_BANK.slice(0, this.batchSize));
  readonly currentIndex = signal(0);
  readonly answers = signal<Record<string, string>>({});
  readonly submitted = signal<Set<string>>(new Set());
  readonly marked = signal<Set<string>>(new Set());
  readonly isPrefetching = signal(false);
  readonly isLoadingQuestion = signal(false);
  readonly isSubmitting = signal(false);
  readonly isComplete = signal(false);
  readonly feedback = signal<'idle' | 'saved' | 'marked'>('idle');
  readonly remainingSeconds = signal(180 * 60);
  private prefetchPromise: Promise<void> | null = null;
  private timerHandle: ReturnType<typeof setInterval> | null = null;

  readonly currentQuestion = computed(() => this.loadedQuestions()[this.currentIndex()]);
  readonly answeredCount = computed(() => Object.keys(this.answers()).length);
  readonly progressPercent = computed(() =>
    Math.round((this.answeredCount() / QUESTION_BANK.length) * 100),
  );
  readonly paletteQuestions = computed<QuestionPaletteItem[]>(() =>
    QUESTION_BANK.map((question, index) => ({
      id: question.id,
      index: index + 1,
      status: this.questionStatus(question.id),
    })),
  );

  ngOnInit(): void {
    this.timerHandle = setInterval(() => {
      if (this.remainingSeconds() <= 1) {
        this.remainingSeconds.set(0);
        this.isComplete.set(true);
        this.stopTimer();
        return;
      }
      this.remainingSeconds.update((seconds) => seconds - 1);
    }, 1000);
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  formatTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
  }

  selectAnswer(option: string): void {
    const question = this.currentQuestion();
    if (!question || this.submitted().has(question.id)) return;
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

  async goToQuestion(index: number): Promise<void> {
    if (index < 0 || index >= QUESTION_BANK.length || this.isLoadingQuestion()) return;

    this.currentIndex.set(index);
    this.feedback.set('idle');
    this.prefetchWhenReady(index);

    if (!this.loadedQuestions()[index]) {
      this.isLoadingQuestion.set(true);
      const question = await this.mockFetchQuestion(index);
      this.loadedQuestions.update((questions) => {
        const next = [...questions];
        next[index] = question;
        return next;
      });
      this.isLoadingQuestion.set(false);
    }
  }

  async submitAndContinue(): Promise<void> {
    const question = this.currentQuestion();
    if (!question || this.isSubmitting()) return;

    if (!this.answers()[question.id]) {
      this.feedback.set('idle');
      return;
    }

    this.isSubmitting.set(true);
    await this.mockSubmitAnswer(question.id, this.answers()[question.id]);
    this.submitted.update((submitted) => new Set(submitted).add(question.id));
    this.isSubmitting.set(false);
    this.feedback.set('saved');

    if (this.currentIndex() === this.loadedQuestions().length - 1 && this.loadedQuestions().length === QUESTION_BANK.length) {
      this.isComplete.set(true);
      return;
    }

    if (this.currentIndex() === this.loadedQuestions().length - 1 && this.isPrefetching()) {
      await this.prefetchNextBatch();
    }

    await this.goToQuestion(Math.min(this.currentIndex() + 1, QUESTION_BANK.length - 1));
  }

  previousQuestion(): void {
    void this.goToQuestion(this.currentIndex() - 1);
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  private questionStatus(id: string): QuestionStatus {
    const answered = this.submitted().has(id);
    const marked = this.marked().has(id);
    if (answered && marked) return 'marked-answered';
    if (marked) return 'marked';
    if (answered) return 'answered';
    return 'unanswered';
  }

  private prefetchWhenReady(index: number): void {
    const isFourthQuestion = (index + 1) % this.batchSize === this.batchSize - 1;
    if (isFourthQuestion && this.loadedQuestions().length < QUESTION_BANK.length) {
      void this.prefetchNextBatch();
    }
  }

  private async prefetchNextBatch(): Promise<void> {
    if (this.prefetchPromise) return this.prefetchPromise;
    this.isPrefetching.set(true);
    this.prefetchPromise = new Promise((resolve) => setTimeout(resolve, 650)).then(() => {
      const nextEnd = Math.min(this.loadedQuestions().length + this.batchSize, QUESTION_BANK.length);
      this.loadedQuestions.set(QUESTION_BANK.slice(0, nextEnd));
      this.isPrefetching.set(false);
      this.prefetchPromise = null;
    });
    return this.prefetchPromise;
  }

  private async mockSubmitAnswer(questionId: string, answer: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 420));
    console.info('Mock submit /api/mock-tests/answers', { questionId, answer });
  }

  private async mockFetchQuestion(index: number): Promise<MockQuestion> {
    await new Promise((resolve) => setTimeout(resolve, 320));
    console.info('Mock fetch /api/mock-tests/questions/' + (index + 1));
    return QUESTION_BANK[index];
  }

  private stopTimer(): void {
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
  }

  exitTest(): void {
    void this.router.navigate(['/student/mock-test']);
  }
}
