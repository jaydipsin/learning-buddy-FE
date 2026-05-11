import { Component, computed, effect, inject, OnInit, signal, Signal } from '@angular/core';
import { AuthFormService } from '../services/auth.form.service';
import { FormGroup, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { Role } from '../../shared/types/global.interface';
import { authStore } from '../store/auth.store';
import { JsonPipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, JsonPipe],
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
  courses = signal<any[] | null | undefined>(null)
  store = inject(authStore)
  authFormService = inject(AuthFormService);
  toastr = inject(ToastrService);


  constructor() {
    effect(() => {
      this.courses.set(this.store.courses())
      console.log("course : ", this.store.courses());
    })
  }

  ngOnInit(): void {
    this.registerForm = this.authFormService.createRegisterForm();
    this.loginForm = this.authFormService.createLoginForm();
  }

  get role(): string {
    return this.registerForm.get('role')?.value;
  }

  get courseFormArray(): FormArray {
    return this.registerForm.get('course') as FormArray;
  }

  isCourseSelected(id: string): boolean {
    return this.courseFormArray.value.includes(id);
  }

  toggleCourse(id: string) {
    const courses = this.courseFormArray;
    const index = courses.value.indexOf(id);
    if (index === -1) {
      courses.push(new FormControl(id));
    } else {
      courses.removeAt(index);
    }
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

  isStep1Valid(): boolean {
    const controls = ['userName', 'email', 'password', 'confirmPassword', 'role'];
    let isValid = true;
    controls.forEach(control => {
      this.registerForm.get(control)?.markAsTouched();
      if (this.registerForm.get(control)?.invalid) {
        isValid = false;
      }
    });
    if (this.registerForm.get('password')?.value !== this.registerForm.get('confirmPassword')?.value) {
      this.registerForm.get('confirmPassword')?.setErrors({ mismatch: true });
      isValid = false;
    }
    return isValid;
  }

  isStep2Valid(): boolean {
    if (this.courseFormArray.length === 0) {
      this.toastr.warning('Please select at least one course to continue.');
      return false;
    }
    return true;
  }

  isStep3Valid(): boolean {
    let controls = ['organizationName'];
    if (this.role === this.roles.Student.toLowerCase()) {
      controls.push('parentEmail');
    }
    let isValid = true;
    controls.forEach(control => {
      this.registerForm.get(control)?.markAsTouched();
      if (this.registerForm.get(control)?.value === "") {
        this.registerForm.removeControl(control);
      }
      // if (this.registerForm.get(control)?.invalid) {
      //   isValid = false;
      // }
    });
    return isValid;
  }

  handleNext() {
    if (this.isLogin) {
      if (this.loginForm.valid) {
        this.store.login(this.loginForm.value);
      } else {
        this.loginForm.markAllAsTouched();
      }
    } else {
      if (this.currentStep === 1) {
        if (!this.isStep1Valid()) {
          this.toastr.error('Please fill all required fields correctly.');
          return;
        }

        if (this.role === this.roles.Student.toLowerCase()) {
          this.currentStep++;
          this.store.getAllCourses();
          return;
        } else {
          const formData = this.registerForm.value;
          this.store.register(formData);
          return;
        }
      }

      if (this.currentStep === 2) {
        if (!this.isStep2Valid()) return;
        this.currentStep++;
        return;
      }

      if (this.currentStep === 3) {



        if (!this.isStep3Valid()) {
          this.toastr.error('Please fix the errors in the form.');
          return;
        }
        const formData = this.registerForm.value;
        this.store.register(formData);
      }
    }
  }
}
