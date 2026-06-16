import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  isDarkMode = false;
  isProfileMenuOpen = false;
  
  private toastr = inject(ToastrService);
  private router = inject(Router);

  ngOnInit() {
    // Check local storage or body class on load
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
    
    // Fire a subtle, pretty success notification on theme change
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
      // Simulate logging out by clearing tokens and routing
      localStorage.removeItem('token');
      this.toastr.success('Logged out successfully', 'Goodbye!');
      this.router.navigate(['/auth']);
    } else {
      this.toastr.info(`${featureName} feature will be available soon!`, 'Coming Soon');
    }
  }
}
