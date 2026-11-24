import { Directive, ElementRef, afterRenderEffect, inject, input } from '@angular/core';

@Directive({ selector: '[appAuthMotion]' })
export class AuthMotion {
  readonly screen = input.required<string>({ alias: 'appAuthMotion' });

  constructor() {
    const { nativeElement: sheet } = inject<ElementRef<HTMLElement>>(ElementRef);

    afterRenderEffect(onCleanup => {
      this.screen();
      let active = true;
      const preference = matchMedia('(prefers-reduced-motion: no-preference)');
      let motion: ReturnType<typeof import('gsap')['gsap']['matchMedia']> | undefined;
      onCleanup(() => {
        active = false;
        motion?.revert();
      });

      if (!preference.matches) return;
      void import('gsap').then(({ gsap }) => {
        if (!active) return;
        motion = gsap.matchMedia();
        motion.add(preference.media, context => {
          gsap.from(sheet.querySelectorAll(':scope > .intro, :scope > .flow'), {
            opacity: 0.68,
            y: 9,
            duration: 0.36,
            stagger: 0.05,
            ease: 'power2.out',
            clearProps: 'opacity,transform',
          });

          const events = new AbortController();
          const options = { signal: events.signal };
          for (const control of sheet.querySelectorAll<HTMLInputElement>('.form-control')) {
            const label = control.labels?.[0];
            if (!label) continue;
            const lift = gsap.quickTo(label, 'y', { duration: 0.18, ease: 'power2.out' });
            control.addEventListener('focus', () => lift(-3), options);
            control.addEventListener('blur', () => lift(0), options);
          }

          for (const button of sheet.querySelectorAll<HTMLButtonElement>('.btn-primary, .btn-secondary')) {
            const lift = gsap.quickTo(button, '--auth-lift', { duration: 0.22, ease: 'power2.out' });
            button.addEventListener('pointerenter', event => {
              if (event.pointerType === 'mouse' && !button.disabled) lift(-2);
            }, options);
            button.addEventListener('pointerleave', () => lift(0), options);
            button.addEventListener('click', () => {
              context.add(() => {
                gsap.fromTo(button, { '--auth-press': 0.975 }, {
                  '--auth-press': 1,
                  duration: 0.28,
                  ease: 'back.out(2)',
                  overwrite: 'auto',
                });
              });
            }, options);
          }
          return () => events.abort();
        }, sheet);
      }).catch(() => {
        // The form remains usable if the animation chunk fails to load.
      });
    });
  }
}
