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

currentStep: number = 1;

toggleAuthMode() {
  this.isLogin = !this.isLogin;
  this.currentStep = 1; // Reset steps when switching
}

handleNext() {
  if (this.isLogin) {
    // Perform Login Logic
  } else {
    if (this.currentStep < 3) {
      this.currentStep++;
    } else {
      // Perform Signup Final Submission
    }
  }
}
}
