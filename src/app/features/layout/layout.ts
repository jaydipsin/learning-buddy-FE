import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav';
import { SplashScreenComponent } from '../../shared/components/splash-screen/splash-screen';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, HeaderComponent, BottomNavComponent, SplashScreenComponent, RouterModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  showSplash = false;

  private splashListener = () => {
    this.showSplash = true;
  };

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
      if (!hasSeenSplash) {
        this.showSplash = true;
        sessionStorage.setItem('hasSeenSplash', 'true');
      }
      window.addEventListener('replay-splash', this.splashListener);
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('replay-splash', this.splashListener);
    }
  }

  onSplashFinished() {
    this.showSplash = false;
  }
}
