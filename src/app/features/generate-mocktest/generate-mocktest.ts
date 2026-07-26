import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { HeaderComponent } from '../../shared/components/header/header';
import { appStore } from '../../core/store/app.store';

interface SubjectOption {
  id: string;
  name: string;
  icon: string;
  checked: boolean;
}

@Component({
  selector: 'app-generate-mocktest',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './generate-mocktest.html',
  styleUrl: './generate-mocktest.css',
})
export class GenerateMockTest implements OnInit {
  private toastr = inject(ToastrService);

  testType: 'pyq' | 'subject' | 'custom' = 'pyq';
  activeCourseId: string | null = null

  subjects: SubjectOption[] = [
    { id: 'physics', name: 'Physics', icon: '⚛️', checked: true },
    { id: 'chemistry', name: 'Chemistry', icon: '🧪', checked: true },
    { id: 'mathematics', name: 'Mathematics', icon: '📐', checked: true },
    { id: 'biology', name: 'Biology', icon: '🧬', checked: false }
  ];

  includePyqs = true;
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive' = 'easy';

  availableYears: number[] = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
  selectedYears: number[] = [2024];

  // Simulation states
  isLaunching = false;
  launchProgress = 0;
  readonly store = inject(appStore)

  ngOnInit(): void {
    console.log("User Course:  ", this.store.appData())
  }

  setTestType(type: 'pyq' | 'subject' | 'custom') {
    this.testType = type;
    if (type === 'pyq') {
      // For PYQ Mock, reset to Physics, Chemistry, Math checked
      this.subjects.forEach(sub => {
        sub.checked = sub.id !== 'biology';
      });
      this.includePyqs = true;
    } else {
      this.includePyqs = false;
    }
  }

  toggleSubject(sub: SubjectOption) {
    if (this.testType === 'pyq') return; // Subject selection is disabled for PYQ Test
    sub.checked = !sub.checked;

    const checkedCount = this.subjects.filter(s => s.checked).length;
    if (checkedCount === 0) {
      // Force at least one checked
      sub.checked = true;
    }
  }

  toggleYear(year: number) {
    if (this.selectedYears.includes(year)) {
      this.selectedYears = this.selectedYears.filter(y => y !== year);
    } else {
      this.selectedYears.push(year);
    }
  }

  setDifficulty(level: 'easy' | 'medium' | 'hard' | 'adaptive') {
    this.difficulty = level;
  }

  // Dynamic calculations based on choices
  get totalQuestions(): number {
    if (this.testType === 'pyq') {
      return 90; // Fixed size mock
    } else {
      const activeSubjects = this.subjects.filter(s => s.checked).length;
      return activeSubjects * 30; // 30 questions per subject
    }
  }

  get timeLimit(): number {
    if (this.testType === 'pyq') {
      return 180; // 180 Mins
    } else {
      const activeSubjects = this.subjects.filter(s => s.checked).length;
      return activeSubjects * 60; // 60 mins per subject
    }
  }

  get attemptMode(): string {
    return this.testType === 'custom' && this.difficulty === 'adaptive' ? 'ADAPTIVE' : 'SIMULATED';
  }

  get estimatedPercentileRange(): string {
    let baseMin = 80;
    let baseMax = 90;

    // Adjust based on difficulty
    if (this.testType === 'custom') {
      if (this.difficulty === 'easy') {
        baseMin = 85;
        baseMax = 92;
      } else if (this.difficulty === 'medium') {
        baseMin = 78;
        baseMax = 86;
      } else if (this.difficulty === 'hard') {
        baseMin = 70;
        baseMax = 80;
      } else if (this.difficulty === 'adaptive') {
        baseMin = 82;
        baseMax = 90;
      }
    } else {
      // For PYQ/Subject Tests (default difficulty)
      baseMin = 78;
      baseMax = 86;
    }

    // Adjust based on subject mix
    const activeSubjects = this.subjects.filter(s => s.checked).length;
    if (activeSubjects === 1) {
      baseMin += 2;
      baseMax += 2;
    }

    return `${baseMin}-${baseMax}%`;
  }

  getSelectedSubjects(): string {
    const checked = this.subjects.filter(s => s.checked).map(s => s.name);
    return checked.length > 0 ? checked.join(', ') : 'None';
  }

  startMockTest() {
    if (this.testType === 'pyq') {
      if (this.selectedYears.length === 0) {
        this.toastr.error('Please select at least one PYQ year to generate the test.', 'Error');
        return;
      }
    } else {
      const checkedCount = this.subjects.filter(s => s.checked).length;
      if (checkedCount === 0) {
        this.toastr.error('Please select at least one subject to generate the test.', 'Error');
        return;
      }
    }

    let payload = {}

    if (this.testType === 'pyq') {
      payload = {
        type: this.testType,
        pyqYears: this.selectedYears,
      }
    } else if (this.testType === 'subject') {
      payload = {
        type: this.testType,
        subjects: this.subjects,
        pyqYears: this.selectedYears
      }
    } else if (this.testType === 'custom') {
      payload = {
        type: this.testType,
        subjects: this.subjects,
        difficulty: this.difficulty,
      }
    }

    this.isLaunching = true;
    this.launchProgress = 0;

    console.log("Payload : ", payload)

    // Simulate loading progress
    const interval = setInterval(() => {
      this.launchProgress += 10;
      if (this.launchProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          this.isLaunching = false;
          this.toastr.success('Your personalized mock test is ready!', 'Test Started 🚀');
        }, 500);
      }
    }, 150);
  }
}