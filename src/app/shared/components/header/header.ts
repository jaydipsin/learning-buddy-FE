import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { appStore } from '../../../core/store/app.store';
import { AvatarComponent } from '../ui/avatar/avatar';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarComponent],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  isDarkMode = false;
  isProfileMenuOpen = false;

  private toastr = inject(ToastrService);
  private router = inject(Router);
  readonly store = inject(appStore);

  get activeCourseName(): string {
    const courses = this.store.appData()?.userDetails?.course;
    if (!courses || courses.length === 0) return 'NEET 2026';
    const active = courses.find((c: any) => c.isCurrentlyActive);
    return active ? active.name : courses[0].name || 'NEET 2026';
  }

  get userName(): string {
    const user = this.store.appData()?.userDetails;
    return user?.userName || user?.email?.split('@')[0] || 'Learning Buddy';
  }

  get streak(): number {
    return this.store.appData()?.userDetails?.streak ?? 0;
  }

  get isPremium(): boolean {
    return this.store.appData()?.userDetails?.isPremium ?? false;
  }

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark');
      this.isDarkMode = true;
    } else if (savedTheme === 'light') {
      document.body.classList.remove('dark');
      this.isDarkMode = false;
    } else {
      this.isDarkMode = document.body.classList.contains('dark');
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark', this.isDarkMode);
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');

    this.toastr.success(
      `Switched to ${this.isDarkMode ? 'Dark' : 'Light'} Mode`,
      'Theme Updated',
      { timeOut: 1500, positionClass: 'toast-top-right' }
    );
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  comingSoon(featureName: string) {
    this.isProfileMenuOpen = false;
    if (featureName === 'Logout') {
      localStorage.removeItem('token');
      this.toastr.success('Logged out successfully', 'Goodbye!');
      this.router.navigate(['/auth']);
    } else {
      this.toastr.info(`${featureName} feature will be available soon!`, 'Coming Soon');
    }
  }
}
