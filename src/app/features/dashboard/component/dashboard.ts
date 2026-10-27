import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { dashboardStore } from '../store/dashboard.store';
import { appStore } from '../../../core/store/app.store';
import {
  StatCardComponent,
  ProgressRingComponent,
  ProgressBarComponent,
  BadgeComponent,
  SkeletonLoaderComponent,
  EmptyStateComponent,
} from '../../../shared/components/ui';
import { TimeFormatPipe, OrdinalPipe } from '../../../shared/pipes';
import { ChatComponent } from '../../chat/component/chat.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatCardComponent,
    ProgressRingComponent,
    ProgressBarComponent,
    BadgeComponent,
    SkeletonLoaderComponent,
    ChatComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  readonly dashboardStore = inject(dashboardStore);
  readonly appStore = inject(appStore);
  readonly Math = Math;

  ngOnInit(): void {
    this.dashboardStore.getDashboardData();
  }

  readonly isLoading = computed(() => this.dashboardStore.isLoading());

  readonly userDisplayName = computed(() => {
    return (
      this.dashboardStore.userName() ||
      this.appStore.appData()?.userDetails?.userName ||
      'Candidate'
    );
  });

  readonly hasTestData = computed(() => {
    const details = this.dashboardStore.lastMockTestDetails();
    const recent = this.dashboardStore.recentMockTests();
    return (
      (details && details.scoreDetails && details.scoreDetails.totalMarks > 0) ||
      (recent && recent.length > 0)
    );
  });

  // Latest mock test metrics computed from real store or high-yield demo baseline
  readonly latestScore = computed(() => {
    const d = this.dashboardStore.lastMockTestDetails();
    if (d && d.scoreDetails && d.scoreDetails.totalMarks > 0) {
      const scored = Math.round(d.scoreDetails.marksObtained);
      const total = d.scoreDetails.totalMarks;
      const percentage = Math.round((scored / total) * 100);
      return {
        scored,
        total,
        percentage,
        correct: d.questionAnalysis?.correctAnswers ?? 0,
        wrong: d.questionAnalysis?.wrongAnswers ?? 0,
      };
    }
    return { scored: 512, total: 720, percentage: 71, correct: 128, wrong: 34 };
  });

  readonly percentile = computed(() => {
    const d = this.dashboardStore.lastMockTestDetails();
    if (d?.scoreDetails?.percentile && d.scoreDetails.percentile > 0) {
      return d.scoreDetails.percentile;
    }
    return 89.4;
  });

  readonly airRank = computed(() => {
    const r = this.dashboardStore.airRank();
    if (r && r > 0) return r;
    return 1247;
  });

  readonly timeVelocity = computed(() => {
    const d = this.dashboardStore.lastMockTestDetails();
    if (d?.attemptDetails && d.attemptDetails.timeLimit > 0) {
      const spentMin = Math.round(d.attemptDetails.timeTaken / 60);
      const totalMin = Math.round(d.attemptDetails.timeLimit / 60);
      return { spentMin, totalMin };
    }
    return { spentMin: 168, totalMin: 180 };
  });

  readonly subjects = computed(() => {
    const subList = this.dashboardStore.lastMockTestDetails()?.subjectWisePerformance;
    if (subList && subList.length > 0) {
      return subList.map((s) => ({
        name: s.subjectName || 'Subject',
        accuracy: Math.round(s.score || 0),
        correct: Math.round(s.marksObtained / 4), // 4 marks per question standard
        total: Math.round(s.idealTime / 30) || 45,
        avgTime: (s.averageTimePerQuestion / 60).toFixed(1),
        targetAccuracy: 75,
      }));
    }
    // High-yield STEM defaults
    return [
      { name: 'Physics', accuracy: 70, correct: 42, total: 60, avgTime: '1.8', targetAccuracy: 75 },
      { name: 'Chemistry', accuracy: 63, correct: 38, total: 60, avgTime: '2.1', targetAccuracy: 70 },
      { name: 'Mathematics', accuracy: 80, correct: 48, total: 60, avgTime: '1.5', targetAccuracy: 80 },
    ];
  });

  readonly strengths = computed(() => {
    const list = this.dashboardStore.strengthAreas();
    if (list && list.length > 0) {
      return list.map((item) => ({
        topic: item.topic,
        subject: 'STEM High-Yield',
        accuracy: item.score,
      }));
    }
    return [
      { topic: 'Coordinate Geometry', subject: 'Mathematics', accuracy: 95 },
      { topic: 'Mechanics — Laws of Motion', subject: 'Physics', accuracy: 88 },
      { topic: 'Matrices & Determinants', subject: 'Mathematics', accuracy: 92 },
      { topic: 'Electrostatics', subject: 'Physics', accuracy: 85 },
    ];
  });

  readonly weaknesses = computed(() => {
    const list = this.dashboardStore.needsImprovementAreas();
    if (list && list.length > 0) {
      return list.map((item) => ({
        topic: item.topic,
        subject: item.subject || 'Chemistry',
        accuracy: item.score,
        trend: item.status === 'declined' ? 'declining' : item.status === 'improved' ? 'improving' : 'flat',
      }));
    }
    return [
      { topic: 'Organic Chemistry — Reactions', subject: 'Chemistry', accuracy: 38, trend: 'declining' },
      { topic: 'Thermodynamics', subject: 'Physics', accuracy: 42, trend: 'flat' },
      { topic: 'Inorganic Coordination', subject: 'Chemistry', accuracy: 45, trend: 'improving' },
      { topic: 'Probability & Permutations', subject: 'Mathematics', accuracy: 48, trend: 'flat' },
    ];
  });

  readonly recentTests = computed(() => {
    const list = this.dashboardStore.recentMockTests();
    if (list && list.length > 0) {
      return list.map((t) => ({
        name: t.mockTestLabel || 'Mock Test',
        date: t.date ? new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent',
        score: Math.round(t.score),
        total: 100, // percentage based
        delta: 2.5,
        type: t.mockTestType || 'Mock',
      }));
    }
    return [
      { name: 'Full Mock Test #7', date: 'Apr 15', score: 512, total: 720, delta: 2.8, type: 'Full Mock' },
      { name: 'Full Mock Test #6', date: 'Apr 12', score: 492, total: 720, delta: 3.3, type: 'Full Mock' },
      { name: 'Physics — Optics Special', date: 'Apr 10', score: 42, total: 60, delta: -2.0, type: 'Subject' },
      { name: 'Full Mock Test #5', date: 'Apr 08', score: 468, total: 720, delta: 2.5, type: 'Full Mock' },
    ];
  });

  readonly insights = computed(() => {
    const list = this.dashboardStore.whatToDoNext();
    if (list && list.length > 0) {
      return list.map((item, idx) => ({
        title: item.action,
        description: item.details,
        action: item.tag || 'Start Practice',
        actionType: idx === 0 ? 'danger' : 'info',
      }));
    }
    return [
      {
        title: 'Organic Chemistry requires rapid drills',
        description: 'Accuracy slipped from 43% to 38% across your last 3 attempts. Estimated mark leak: ~24 marks.',
        action: 'Launch Drill',
        actionType: 'danger',
      },
      {
        title: 'Chemistry pace exceeds target benchmark',
        description: '2.1 min/question vs 1.0 min ideal budget. This reduces buffer time for Mathematics.',
        action: 'Time Sprints',
        actionType: 'warning',
      },
      {
        title: 'Mathematics accuracy remains elite',
        description: '80% subject accuracy. Protect this score while targeting higher speed on questions 1-15.',
        action: 'Maintain Lead',
        actionType: 'success',
      },
    ];
  });
}
