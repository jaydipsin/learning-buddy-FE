import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  isDarkMode = false;
  activeTimeTab: 'section' | 'question' = 'section';
  chatMessage = '';
  isChatExpanded = false;

  latestTest = {
    name: 'Full Mock Test #7',
    date: 'Apr 15, 2026',
    totalMarks: 720,
    scored: 512,
    percentage: 71.1,
    percentile: 89.4,
    rank: 1247,
    totalStudents: 11832,
    timeSpent: 168,
    totalTime: 180,
    correct: 128,
    incorrect: 34,
    skipped: 18,
    totalQuestions: 180,
  };

  performanceTrend = [
    { test: '#3', score: 58.2 },
    { test: '#4', score: 62.5 },
    { test: '#5', score: 65.0 },
    { test: '#6', score: 68.3 },
    { test: '#7', score: 71.1 },
  ];

  subjects = [
    { name: 'Physics', icon: '⚛️', correct: 42, incorrect: 12, skipped: 6, total: 60, accuracy: 70, avgTime: 1.8, targetAccuracy: 75 },
    { name: 'Chemistry', icon: '🧪', correct: 38, incorrect: 14, skipped: 8, total: 60, accuracy: 63.3, avgTime: 2.1, targetAccuracy: 70 },
    { name: 'Mathematics', icon: '📐', correct: 48, incorrect: 8, skipped: 4, total: 60, accuracy: 80, avgTime: 1.5, targetAccuracy: 80 },
  ];

  timeBySection = [
    { section: 'Physics', spent: 58, allocated: 60, overUnder: -2 },
    { section: 'Chemistry', spent: 65, allocated: 60, overUnder: 5 },
    { section: 'Mathematics', spent: 45, allocated: 60, overUnder: -15 },
  ];

  strengths = [
    { topic: 'Coordinate Geometry', subject: 'Mathematics', accuracy: 95, tests: 5 },
    { topic: 'Mechanics — NLM', subject: 'Physics', accuracy: 88, tests: 4 },
    { topic: 'Matrices & Determinants', subject: 'Mathematics', accuracy: 92, tests: 3 },
    { topic: 'Electrostatics', subject: 'Physics', accuracy: 85, tests: 6 },
  ];

  weaknesses = [
    { topic: 'Organic Chemistry — Reactions', subject: 'Chemistry', accuracy: 38, tests: 5, trend: 'declining' },
    { topic: 'Thermodynamics', subject: 'Physics', accuracy: 42, tests: 4, trend: 'flat' },
    { topic: 'Inorganic Chemistry', subject: 'Chemistry', accuracy: 45, tests: 6, trend: 'improving' },
    { topic: 'Probability', subject: 'Mathematics', accuracy: 48, tests: 3, trend: 'flat' },
  ];

  recentTests = [
    { name: 'Full Mock Test #7', date: 'Apr 15', score: 512, total: 720, percentage: 71.1, delta: 2.8, type: 'Full Mock' },
    { name: 'Full Mock Test #6', date: 'Apr 12', score: 492, total: 720, percentage: 68.3, delta: 3.3, type: 'Full Mock' },
    { name: 'Physics — Optics', date: 'Apr 10', score: 42, total: 60, percentage: 70.0, delta: -2.0, type: 'Subject' },
    { name: 'Full Mock Test #5', date: 'Apr 8', score: 468, total: 720, percentage: 65.0, delta: 2.5, type: 'Full Mock' },
    { name: 'Chemistry — Organic', date: 'Apr 6', score: 22, total: 60, percentage: 36.7, delta: -5.3, type: 'Subject' },
  ];

  insights = [
    { icon: '🚨', title: 'Organic Chemistry needs immediate attention', description: 'Accuracy dropped from 43% to 38% over 3 tests. You\'re losing ~24 marks.', action: 'Start Practice', actionType: 'danger' },
    { icon: '⏱️', title: 'Chemistry is eating your time', description: '2.1 min/q vs 1.0 target. This steals time from Math.', action: 'Time Drills', actionType: 'warning' },
    { icon: '📈', title: 'Math is your strongest suit', description: '80% accuracy, fastest section. Maintain and protect this.', action: 'Keep Going', actionType: 'success' },
    { icon: '🎯', title: '18 questions were left blank', description: 'Push attempt rate past 95% with better time management.', action: 'Strategy', actionType: 'info' },
  ];

  chatMessages = [
    { from: 'ai', text: 'I noticed your Organic Chemistry accuracy dropped to 38%. Want me to create a focused quiz on reaction mechanisms?' },
    { from: 'user', text: 'Yes please, focus on named reactions and reagents' },
    { from: 'ai', text: 'Got it! I\'ll prepare a 15-question quiz on Named Reactions — Grignard, Wittig, Aldol, and Cannizzaro. Ready in a moment.' },
  ];

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark', this.isDarkMode);
  }

  setTimeTab(tab: 'section' | 'question') {
    this.activeTimeTab = tab;
  }

  toggleChat() {
    this.isChatExpanded = !this.isChatExpanded;
  }

  sendMessage() {
    if (this.chatMessage.trim()) {
      this.chatMessages.push({ from: 'user', text: this.chatMessage.trim() });
      this.chatMessage = '';
      // Simulate AI response
      setTimeout(() => {
        this.chatMessages.push({ from: 'ai', text: 'I\'ll analyze that and get back to you with a personalized plan.' });
      }, 800);
    }
  }

  getScoreColor(pct: number): string {
    if (pct >= 75) return 'text-green-500';
    if (pct >= 60) return 'text-amber-400';
    return 'text-red-400';
  }

  getScoreBg(pct: number): string {
    if (pct >= 75) return 'score-badge-green';
    if (pct >= 60) return 'score-badge-amber';
    return 'score-badge-red';
  }

  getBarColor(pct: number): string {
    if (pct >= 75) return 'bar-green';
    if (pct >= 60) return 'bar-amber';
    return 'bar-red';
  }

  getTrendIcon(trend: string): string {
    return trend === 'improving' ? '↗' : trend === 'declining' ? '↘' : '→';
  }

  getTrendClass(trend: string): string {
    return trend === 'improving' ? 'trend-up' : trend === 'declining' ? 'trend-down' : 'trend-flat';
  }

  getInsightClass(type: string): string {
    switch (type) {
      case 'danger': return 'insight-danger';
      case 'warning': return 'insight-warning';
      case 'success': return 'insight-success';
      default: return 'insight-info';
    }
  }

  getActionClass(type: string): string {
    switch (type) {
      case 'danger': return 'action-btn-danger';
      case 'warning': return 'action-btn-warning';
      case 'success': return 'action-btn-success';
      default: return 'action-btn-info';
    }
  }
}
