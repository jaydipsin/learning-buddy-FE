import {
  afterNextRender, Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, ElementRef, inject, signal,
} from '@angular/core';
import type { ModelViewerElement } from '@google/model-viewer';
import type { gsap } from 'gsap';

@Component({
  selector: 'app-practice-scene',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './practice-scene.html',
  styleUrl: './practice-scene.css',
})
export class PracticeScene {
  readonly viewerEnabled = signal(false);
  readonly modelReady = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroy = inject(DestroyRef);
  private motion?: gsap.Context;

  constructor() {
    afterNextRender(() => {
      const preference = matchMedia('(prefers-reduced-motion: no-preference)');
      let generation = 0;
      const update = async () => {
        const version = ++generation;
        this.motion?.revert();
        this.viewerEnabled.set(false);
        this.modelReady.set(false);
        if (!preference.matches) return;

        const animate = import('gsap').then(({ gsap }) => {
          if (version !== generation) return;
          const host = this.host.nativeElement;
          const studio = host.parentElement ?? host;
          const planet = host.querySelector('.planet')!;
          const crystal = host.querySelector('.crystal')!;
          const portrait = host.querySelector('.portrait')!;
          const orbits = host.querySelector('.orbits')!;

          this.motion = gsap.context(() => {
            const objects = gsap.timeline();
            objects.from(planet, { y: 20, rotation: -12, duration: 0.9, ease: 'sine.out' }, 0)
              .from(crystal, { y: -16, rotation: 16, duration: 1, ease: 'sine.out' }, 0)
              .to(planet, { y: -8, duration: 1.25, repeat: 1, yoyo: true, ease: 'sine.inOut' })
              .to(crystal, { y: 6, duration: 1.45, repeat: 1, yoyo: true, ease: 'sine.inOut' }, '<');

            const follow = { duration: 0.55, ease: 'power3.out' };
            const owlX = gsap.quickTo(portrait, 'x', follow);
            const owlY = gsap.quickTo(portrait, 'y', follow);
            const planetX = gsap.quickTo(planet, 'x', follow);
            const crystalX = gsap.quickTo(crystal, 'x', follow);
            const orbitTurn = gsap.quickTo(orbits, 'rotation', follow);

            const shift = (x: number, y: number) => {
              owlX(x * 14);
              owlY(y * 11);
              planetX(x * 26);
              crystalX(x * -23);
              orbitTurn(x * 3);
            };
            const events = new AbortController();
            const options = { passive: true, signal: events.signal };
            studio.addEventListener('pointermove', event => {
              if (event.pointerType !== 'mouse') return;
              const bounds = studio.getBoundingClientRect();
              shift(
                2 * (event.clientX - bounds.left) / bounds.width - 1,
                2 * (event.clientY - bounds.top) / bounds.height - 1,
              );
            }, options);
            studio.addEventListener('pointerleave', () => shift(0, 0), options);
            return () => events.abort();
          }, host);
        });
        const viewer = import('@google/model-viewer').then(() => {
          if (version === generation) this.viewerEnabled.set(true);
        });
        // The poster is already visible if a graphics context or chunk is unavailable.
        await Promise.allSettled([animate, viewer]);
      };
      preference.addEventListener('change', update);
      void update();
      this.destroy.onDestroy(() => {
        ++generation;
        preference.removeEventListener('change', update);
        this.motion?.revert();
      });
    });
  }

  greet(event: Event): void {
    const model = event.currentTarget as ModelViewerElement;
    if (!this.viewerEnabled()) return;
    this.modelReady.set(true);
    model.cameraOrbit = '6deg 86deg 105%';
    model.play({ repetitions: 1, pingpong: false });
  }

  showPoster(): void {
    this.modelReady.set(false);
    this.viewerEnabled.set(false);
  }
}
