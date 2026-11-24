import { NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, TemplateRef, afterRenderEffect, contentChild, inject, input } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { PlatformDirective } from '../../../shared/directives/platform.directive';
import { PracticeScene } from './practice-scene';
import { AuthMotion } from './auth-motion';

@Component({
  selector: 'app-auth-desktop',
  imports: [NgTemplateOutlet, PracticeScene],
  template: `<main class="desktop">
    <aside class="studio">
      <ng-container [ngTemplateOutlet]="brand()" />
      <app-practice-scene aria-hidden="true" />
      <div class="studio-copy">
        <h2>Your practice studio.</h2>
        <p>Prepare for NEET and JEE with mock tests, performance insights and your AI mentor.</p>
      </div>
    </aside>
    <article class="form-pane"><ng-container [ngTemplateOutlet]="sheet()" /></article>
  </main>`,
  styleUrl: './auth-layout.css',
})
export class AuthDesktop {
  readonly brand = input.required<TemplateRef<unknown>>();
  readonly sheet = input.required<TemplateRef<unknown>>();
}

@Component({
  selector: 'app-auth-layout',
  imports: [IonContent, PlatformDirective, AuthDesktop, NgTemplateOutlet, AuthMotion],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout {
  readonly heading = input.required<string>();
  readonly description = input('');
  readonly step = input(0);
  readonly form = contentChild.required(TemplateRef);

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef);
    let previousHeading: string | undefined;
    afterRenderEffect(() => {
      const heading = this.heading();
      if (previousHeading && previousHeading !== heading) {
        host.nativeElement.querySelector('h1')?.focus();
      }
      previousHeading = heading;
    });
  }
}
