import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Event as RouterEvent,
  NavigationCancel,
  NavigationCancellationCode,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  Router,
} from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { filter, take } from 'rxjs';
import { SplashScreenComponent } from './shared/components/splash-screen/splash-screen';

function firstLaunchInTab(): boolean {
  try {
    const seen = sessionStorage.getItem('hasSeenSplash');
    sessionStorage.setItem('hasSeenSplash', 'true');
    return !seen;
  } catch {
    return true;
  }
}

function initialNavigationFinished(event: RouterEvent): boolean {
  if (event instanceof NavigationCancel) {
    // Redirects and superseded navigations hand readiness to the next navigation.
    return event.code !== NavigationCancellationCode.Redirect &&
      event.code !== NavigationCancellationCode.SupersededByNewNavigation;
  }
  return event instanceof NavigationEnd || event instanceof NavigationError ||
    event instanceof NavigationSkipped;
}

@Component({
  selector: 'app-root',
  imports: [IonApp, IonRouterOutlet, SplashScreenComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: { '(window:replay-splash)': 'replaySplash()' },
})
export class App {
  protected readonly showSplash = signal(firstLaunchInTab());
  private replayTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(Router).events.pipe(
      filter(initialNavigationFinished),
      take(1),
      takeUntilDestroyed(),
    ).subscribe(() => this.showSplash.set(false));

    inject(DestroyRef).onDestroy(() => clearTimeout(this.replayTimer));
  }

  protected replaySplash(): void {
    if (this.showSplash()) return;
    this.showSplash.set(true);
    // Only an explicitly requested preview plays for a fixed interval.
    this.replayTimer = setTimeout(() => this.showSplash.set(false), 600);
  }
}
