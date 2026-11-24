import { TestBed } from '@angular/core/testing';
import {
  Event as RouterEvent, NavigationCancel, NavigationCancellationCode,
  NavigationEnd, NavigationError, Router,
} from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { Capacitor } from '@capacitor/core';
import { App } from './app';
import { SplashScreenComponent } from './shared/components/splash-screen/splash-screen';

// The Ionic elements are inert hosts in this navigation-lifecycle test.
vi.mock('@ionic/angular/standalone', () => ({ IonApp: class {}, IonRouterOutlet: class {} }));

describe('App', () => {
  let navigation: Subject<RouterEvent>;

  beforeEach(async () => {
    navigation = new Subject<RouterEvent>();
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(true);
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: Router, useValue: { events: navigation } }],
    }).overrideComponent(App, {
      set: { imports: [SplashScreenComponent], schemas: [CUSTOM_ELEMENTS_SCHEMA] },
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('keeps the native greeting visible across redirects and a fast first route', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(App);
    const root: HTMLElement = fixture.nativeElement;
    fixture.detectChanges();
    expect(root.querySelector('h1')?.textContent).toBe('Learning Buddy');
    expect(root.querySelector('ion-router-outlet')?.hasAttribute('inert')).toBe(true);
    navigation.next(new NavigationCancel(1, '/', 'login', NavigationCancellationCode.Redirect));
    fixture.detectChanges();
    expect(root.querySelector('app-splash-screen')).toBeTruthy();
    navigation.next(new NavigationEnd(2, '/auth', '/auth'));
    fixture.detectChanges();
    expect(root.querySelector('app-splash-screen')).toBeTruthy();
    root.querySelector('img')!.dispatchEvent(new Event('load'));
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(root.querySelector('app-splash-screen')).toBeNull();
    expect(root.querySelector('ion-router-outlet')?.hasAttribute('inert')).toBe(false);
  });

  it('releases the splash on a failed initial navigation', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    navigation.next(new NavigationError(1, '/', new Error('Route load failed')));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-splash-screen')).toBeNull();
  });

  it('bounds the native overlay if navigation or the artwork stalls', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    vi.advanceTimersByTime(4500);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-splash-screen')).toBeNull();
  });

  it('skips both automatic and replayed greetings on the web', () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    window.dispatchEvent(new Event('replay-splash'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-splash-screen')).toBeNull();
  });
});
