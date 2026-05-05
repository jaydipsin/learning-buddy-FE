import { Component, inject, OnInit } from '@angular/core';
import { AuthFormService } from '../services/auth.form.service';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Role } from '../../shared/types/global.interface';
import { authStore } from '../store/auth.store';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
  providers: [authStore],
})
export class Register implements OnInit {
  isDarkMode = false;
  isLogin = true;
  registerForm!: FormGroup;
  loginForm!: FormGroup;
  roles = Role;

  store = inject(authStore)
  authFormService = inject(AuthFormService);


  ngOnInit(): void {
    this.registerForm = this.authFormService.createRegisterForm();
    this.loginForm = this.authFormService.createLoginForm();
  }

  get role(): string {
    return this.registerForm.get('role')?.value;
  }


  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark', this.isDarkMode);
  }

  currentStep: number = 1;

  toggleAuthMode() {
    this.isLogin = !this.isLogin;
    this.currentStep = 1;
  }

  handleNext() {
    if (this.isLogin) {
      this.store.login(this.loginForm.value);
    } else {
      if (this.currentStep < 3 && this.role === this.roles.Student) {
        this.currentStep++;
      } else {
        this.store.register(this.registerForm.value)
      }
    }

  }
}
