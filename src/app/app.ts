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
import { Capacitor } from '@capacitor/core';
import { filter, take } from 'rxjs';
import { SplashScreenComponent } from './shared/components/splash-screen/splash-screen';

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
  protected readonly showSplash = signal(Capacitor.isNativePlatform());
  private routeReady = false;
  private greetingFinished = false;
  private greetingTimer?: ReturnType<typeof setTimeout>;
  private deadline?: ReturnType<typeof setTimeout>;

  constructor() {
    if (!this.showSplash()) return;
    this.startDeadline();
    inject(Router).events.pipe(
      filter(initialNavigationFinished),
      take(1),
      takeUntilDestroyed(),
    ).subscribe(event => {
      this.routeReady = true;
      if (this.greetingFinished || !(event instanceof NavigationEnd)) this.dismiss();
    });

    inject(DestroyRef).onDestroy(() => this.dismiss());
  }

  protected artworkReady(): void {
    if (!this.showSplash() || this.greetingTimer) return;
    // Count from the bundled image loading so fast redirects cannot cut off the greeting.
    this.greetingTimer = setTimeout(() => {
      this.greetingFinished = true;
      if (this.routeReady) this.dismiss();
    }, 1000);
  }

  protected replaySplash(): void {
    if (!Capacitor.isNativePlatform() || this.showSplash()) return;
    this.greetingFinished = false;
    this.showSplash.set(true);
    this.startDeadline();
  }

  private startDeadline(): void {
    this.deadline = setTimeout(() => this.dismiss(), 4500);
  }

  private dismiss(): void {
    clearTimeout(this.deadline);
    clearTimeout(this.greetingTimer);
    this.greetingTimer = undefined;
    this.showSplash.set(false);
  }
}
