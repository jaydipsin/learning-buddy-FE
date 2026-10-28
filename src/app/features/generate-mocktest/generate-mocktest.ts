import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { appStore } from '../../core/store/app.store';
import {
  MockTestGenerationJob,
  MockTestGenerationService,
} from './services/mock-test-generation.service';
import {
  BadgeComponent,
  ChipSelectComponent,
  ChipOption,
  SegmentTabsComponent,
  SegmentTab,
  StatCardComponent,
  ProgressBarComponent,
} from '../../shared/components/ui';

export interface SubjectOption {
  id: string;
  name: string;
  icon: string;
  checked: boolean;
}

@Component({
  selector: 'app-generate-mocktest',
  standalone: true,
  imports: [
    CommonModule,
    BadgeComponent,
    ChipSelectComponent,
    SegmentTabsComponent,
    ProgressBarComponent,
  ],
  templateUrl: './generate-mocktest.html',
  styleUrl: './generate-mocktest.css',
})
export class GenerateMockTest implements OnInit {
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private mockTestGeneration = inject(MockTestGenerationService);
  readonly store = inject(appStore);

  testType = signal<'pyq' | 'subject' | 'custom'>('pyq');
  difficulty = signal<'easy' | 'medium' | 'hard' | 'adaptive'>('easy');

  readonly testTypeTabs: SegmentTab[] = [
    { id: 'pyq', label: 'Past PYQ Paper', count: 8 },
    { id: 'subject', label: 'Subject Drill', count: 3 },
    { id: 'custom', label: 'AI Adaptive Drill' },
  ];

  subjects = signal<SubjectOption[]>([
    { id: 'physics', name: 'Physics', icon: '⚛️', checked: true },
    { id: 'chemistry', name: 'Chemistry', icon: '🧪', checked: true },
    { id: 'mathematics', name: 'Mathematics', icon: '📐', checked: true },
    { id: 'biology', name: 'Biology', icon: '🧬', checked: false },
  ]);

  readonly subjectChipOptions = computed<ChipOption[]>(() => {
    return this.subjects().map((s) => ({
      id: s.id,
      label: s.name,
      icon: s.icon,
      badge: '30 Qs',
    }));
  });

  readonly selectedSubjectIds = computed<(string | number)[]>(() => {
    return this.subjects()
      .filter((s) => s.checked)
      .map((s) => s.id);
  });

  availableYears: number[] = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
  selectedYears = signal<number[]>([2024]);

  readonly yearChipOptions = computed<ChipOption[]>(() => {
    return this.availableYears.map((y) => ({
      id: y,
      label: `${y}`,
    }));
  });

  readonly difficultyChipOptions: ChipOption[] = [
    { id: 'easy', label: 'Easy (Confidence Sprint)' },
    { id: 'medium', label: 'Medium (NTA Benchmark)' },
    { id: 'hard', label: 'Hard (Top 1% Crucible)' },
    { id: 'adaptive', label: 'Adaptive (Dynamic AI)' },
  ];

  isLaunching = false;
  launchProgress = 0;
  generatedQuestionIds: string[] = [];
  generationJobId: string | null = null;

  get activeCourseId(): string | null {
    const courses = this.store.appData()?.userDetails?.course;
    if (!courses || courses.length === 0) return null;
    const active = courses.find((c) => c.isCurrentlyActive);
    return active ? active.id : courses[0].id;
  }

  ngOnInit(): void {
    console.log('User Course Info:', this.store.appData());
  }

  onTestTypeChange(type: string): void {
    const t = type as 'pyq' | 'subject' | 'custom';
    this.testType.set(t);

    if (t === 'pyq') {
      this.subjects.update((subs) =>
        subs.map((sub) => ({ ...sub, checked: sub.id !== 'biology' }))
      );
    }
  }

  onSubjectSelectionChange(selectedIds: (string | number)[]): void {
    if (this.testType() === 'pyq') return; // PYQ tests use standard syllabus
    this.subjects.update((subs) =>
      subs.map((sub) => ({
        ...sub,
        checked: selectedIds.includes(sub.id),
      }))
    );
  }

  onYearSelectionChange(years: (string | number)[]): void {
    this.selectedYears.set(years as number[]);
  }

  onDifficultySelectionChange(diffs: (string | number)[]): void {
    if (diffs.length > 0) {
      this.difficulty.set(diffs[0] as 'easy' | 'medium' | 'hard' | 'adaptive');
    }
  }

  get totalQuestions(): number {
    if (this.testType() === 'pyq') {
      return 90;
    }
    const count = this.subjects().filter((s) => s.checked).length;
    return count * 30;
  }

  get timeLimitMinutes(): number {
    if (this.testType() === 'pyq') {
      return 180;
    }
    const count = this.subjects().filter((s) => s.checked).length;
    return count * 60;
  }

  get attemptMode(): string {
    return this.testType() === 'custom' && this.difficulty() === 'adaptive'
      ? 'ADAPTIVE AI'
      : 'NTA SIMULATED';
  }

  get estimatedPercentileRange(): string {
    const t = this.testType();
    const d = this.difficulty();
    if (t === 'custom') {
      if (d === 'easy') return '85 - 92%';
      if (d === 'medium') return '78 - 86%';
      if (d === 'hard') return '70 - 80%';
      return '82 - 90%';
    }
    return '78 - 86%';
  }

  getSelectedSubjectsSummary(): string {
    const checked = this.subjects()
      .filter((s) => s.checked)
      .map((s) => s.name);
    return checked.length > 0 ? checked.join(', ') : 'None';
  }

  startMockTest(): void {
    if (this.testType() === 'pyq' && this.selectedYears().length === 0) {
      this.toastr.error('Please select at least one PYQ year to generate the test.', 'Configuration Incomplete');
      return;
    }

    const checkedCount = this.subjects().filter((s) => s.checked).length;
    if (checkedCount === 0) {
      this.toastr.error('Please select at least one subject to generate the test.', 'Configuration Incomplete');
      return;
    }

    const courseId = this.activeCourseId;
    if (!courseId) {
      this.toastr.error('No active course found. Please complete your profile first.', 'Profile Required');
      return;
    }

    const selectedSubjects = this.subjects()
      .filter((s) => s.checked)
      .map((s) => s.name);

    const apiPayload = {
      courseId,
      isPublic: false,
    } as {
      courseId: string;
      isPublic: boolean;
      pyqYears?: number[];
      subject?: string[];
      difficulty?: 'easy' | 'medium' | 'hard' | 'adaptive';
    };

    if (this.testType() === 'pyq') {
      apiPayload.pyqYears = this.selectedYears();
    } else if (this.testType() === 'subject') {
      apiPayload.subject = selectedSubjects;
    } else if (this.testType() === 'custom') {
      apiPayload.subject = selectedSubjects;
      apiPayload.difficulty = this.difficulty();
    }

    this.isLaunching = true;
    this.launchProgress = 0;

    void this.generateMockTest(apiPayload);
  }

  private async generateMockTest(payload: {
    courseId: string;
    isPublic: boolean;
    pyqYears?: number[];
    subject?: string[];
    difficulty?: 'easy' | 'medium' | 'hard' | 'adaptive';
  }): Promise<void> {
    try {
      const completedJob = await this.mockTestGeneration.generate(
        payload,
        (job: MockTestGenerationJob) => {
          this.generationJobId = job.jobId;
          this.launchProgress = job.progress;
        },
      );

      this.generatedQuestionIds = completedJob.questionIds || [];
      this.launchProgress = 100;
      this.isLaunching = false;
      this.toastr.success(
        `${this.generatedQuestionIds.length} questions are ready.`,
        'Simulation Launched',
      );
      await this.router.navigate(['/student/mock-test/attempt']);
      console.log('Mock test generation completed:', completedJob);
    } catch (error) {
      this.isLaunching = false;
      this.launchProgress = 0;
      const message = error instanceof Error ? error.message : 'Failed to generate mock test.';
      this.toastr.error(message, 'Generation Error');
      console.error('Mock test generation failed:', error);
    }
  }
}