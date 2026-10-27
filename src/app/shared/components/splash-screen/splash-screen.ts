import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash-screen.html',
  styleUrl: './splash-screen.css'
})
export class SplashScreenComponent implements OnInit {
  @Output() finished = new EventEmitter<void>();

  progress = 0;
  isFadingOut = false;
  tagline = 'Initializing Diagnostic Engine...';

  private taglines = [
    'Initializing Diagnostic Engine...',
    'Calibrating Personalized Weakness Detector...',
    'Loading High-Yield PYQ Vault...',
    'Ready for Exam Prep!'
  ];

  ngOnInit(): void {
    let tagIdx = 0;
    const interval = setInterval(() => {
      this.progress += 25;
      if (this.progress % 25 === 0 && tagIdx < this.taglines.length - 1) {
        tagIdx++;
        this.tagline = this.taglines[tagIdx];
      }

      if (this.progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          this.dismiss();
        }, 300);
      }
    }, 150);
  }

  dismiss(): void {
    this.isFadingOut = true;
    setTimeout(() => {
      this.finished.emit();
    }, 350);
  }
}
