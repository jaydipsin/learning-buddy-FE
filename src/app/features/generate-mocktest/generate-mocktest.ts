import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../shared/components/header/header';
import { ToastrService } from 'ngx-toastr';

interface SubjectOption {
  id: string;
  name: string;
  icon: string;
  checked: boolean;
}

@Component({
  selector: 'app-generate-mocktest',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './generate-mocktest.html',
  styleUrl: './generate-mocktest.css',
})
export class GenerateMockTest {
  private toastr = inject(ToastrService);

  testType: 'full' | 'subject' = 'full';
  
  subjects: SubjectOption[] = [
    { id: 'physics', name: 'Physics', icon: '⚛️', checked: true },
    { id: 'chemistry', name: 'Chemistry', icon: '🧪', checked: true },
    { id: 'mathematics', name: 'Mathematics', icon: '📐', checked: true },
    { id: 'biology', name: 'Biology', icon: '🧬', checked: false }
  ];

  includePyqs = true;
  startYear = 2018;
  endYear = 2024;
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive' = 'easy';

  // For year range slider
  minAvailableYear = 2015;
  maxAvailableYear = 2026;

  // Simulation states
  isLaunching = false;
  launchProgress = 0;

  setTestType(type: 'full' | 'subject') {
    this.testType = type;
    if (type === 'full') {
      // For Full Mock, reset to Physics, Chemistry, Math checked
      this.subjects.forEach(sub => {
        sub.checked = sub.id !== 'biology';
      });
    } else {
    }
  }

  toggleSubject(sub: SubjectOption) {
    if (this.testType === 'full') return; // Subject selection is disabled for Full Mock
    sub.checked = !sub.checked;
    
    const checkedCount = this.subjects.filter(s => s.checked).length;
    if (checkedCount === 0) {
      // Force at least one checked
      sub.checked = true;
    }
  }

  setDifficulty(level: 'easy' | 'medium' | 'hard' | 'adaptive') {
    this.difficulty = level;
    let desc = '';
    switch (level) {
      case 'easy': desc = 'Questions tailored to solidify fundamentals.'; break;
      case 'medium': desc = 'Balanced standard exam level questions.'; break;
      case 'hard': desc = 'Challenging questions to test top rank readiness.'; break;
      case 'adaptive': desc = 'Difficulty scales dynamically based on your answers!'; break;
    }
  }

  // Dynamic calculations based on choices
  get totalQuestions(): number {
    if (this.testType === 'full') {
      return 90; // Fixed size mock
    } else {
      const activeSubjects = this.subjects.filter(s => s.checked).length;
      return activeSubjects * 30; // 30 questions per subject
    }
  }

  get timeLimit(): number {
    if (this.testType === 'full') {
      return 180; // 180 Mins
    } else {
      const activeSubjects = this.subjects.filter(s => s.checked).length;
      return activeSubjects * 60; // 60 mins per subject
    }
  }

  get attemptMode(): string {
    return this.difficulty === 'adaptive' ? 'ADAPTIVE' : 'SIMULATED';
  }

  get estimatedPercentileRange(): string {
    let baseMin = 80;
    let baseMax = 90;

    // Adjust based on difficulty
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

    // Adjust based on subject mix
    const activeSubjects = this.subjects.filter(s => s.checked).length;
    if (activeSubjects === 1) {
      baseMin += 2;
      baseMax += 2;
    }

    return `${baseMin}-${baseMax}%`;
  }

  // Handle year range slider changes
  onYearSliderChange(event: any, field: 'start' | 'end') {
    const value = parseInt(event.target.value, 10);
    if (field === 'start') {
      this.startYear = Math.min(value, this.endYear);
    } else {
      this.endYear = Math.max(value, this.startYear);
    }
  }

  startMockTest() {
    const checkedCount = this.subjects.filter(s => s.checked).length;
    if (checkedCount === 0) {
      this.toastr.error('Please select at least one subject to generate the test.', 'Error');
      return;
    }

    this.isLaunching = true;
    this.launchProgress = 0;
    
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