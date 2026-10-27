import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.css'
})
export class BottomNavComponent {
  private router = inject(Router);
  activeUrl = '';

  constructor() {
    this.activeUrl = this.router.url;
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.activeUrl = event.urlAfterRedirects || event.url;
    });
  }

  isActive(route: string): boolean {
    return this.activeUrl.startsWith(route);
  }
}
