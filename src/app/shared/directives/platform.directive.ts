import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type PlatformTarget = 'mobile' | 'desktop';

@Directive({
  selector: '[appPlatform]',
  standalone: true,
})
export class PlatformDirective implements OnInit, OnDestroy {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private platformId = inject(PLATFORM_ID);

  private targetPlatform: PlatformTarget = 'desktop';
  private mediaQueryList?: MediaQueryList;
  private hasView = false;

  @Input('appPlatform') set appPlatform(target: PlatformTarget) {
    this.targetPlatform = target;
    this.updateView();
  }

  private listener = () => {
    this.updateView();
  };

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // 768px corresponds to the md breakpoint
      this.mediaQueryList = window.matchMedia('(max-width: 767px)');
      if (this.mediaQueryList.addEventListener) {
        this.mediaQueryList.addEventListener('change', this.listener);
      } else {
        // Fallback for older browsers
        (this.mediaQueryList as any).addListener(this.listener);
      }
      this.updateView();
    }
  }

  ngOnDestroy(): void {
    if (this.mediaQueryList) {
      if (this.mediaQueryList.removeEventListener) {
        this.mediaQueryList.removeEventListener('change', this.listener);
      } else {
        (this.mediaQueryList as any).removeListener(this.listener);
      }
    }
  }

  private updateView(): void {
    if (!isPlatformBrowser(this.platformId)) {
      // On SSR or initial render, default to desktop view
      if (this.targetPlatform === 'desktop' && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      }
      return;
    }

    const isMobile = this.mediaQueryList ? this.mediaQueryList.matches : window.innerWidth < 768;
    const shouldRender = (this.targetPlatform === 'mobile' && isMobile) ||
                         (this.targetPlatform === 'desktop' && !isMobile);

    if (shouldRender && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!shouldRender && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
