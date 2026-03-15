import { Component } from '@angular/core';

@Component({
  selector: 'app-register',
  imports: [],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  isDarkMode = false;
  isLogin = true;

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;

    // This one line replaces all those if/else blocks
    // It adds the class if isDarkMode is true, and removes it if false
    document.body.classList.toggle('dark', this.isDarkMode);
  }

  toggleAuthMode() {}
}
