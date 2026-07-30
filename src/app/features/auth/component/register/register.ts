import { Component, computed, effect, inject, OnInit, signal, Signal } from '@angular/core';
import { AuthFormService } from '../../../../core/services/auth.form.service';
import {
  FormGroup,
  ReactiveFormsModule,
  FormArray,
  FormControl,
  FormsModule,
} from '@angular/forms';
import { Role } from '../../../../shared/models/global.interface';
import { authStore } from '../../store/auth.store';
import { JsonPipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, JsonPipe, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  isDarkMode = false;
  isLogin = true;
  registerForm!: FormGroup;
  loginForm!: FormGroup;
  courses = signal<any[] | null | undefined>(null);
  store = inject(authStore);
  authFormService = inject(AuthFormService);
  toastr = inject(ToastrService);
  route = inject(ActivatedRoute);
  otp = signal<{ [key: number]: string }>({
    0: '',
    1: '',
    2: '',
    3: '',
    4: '',
    5: '',
  });
  currentStep = signal(1);

  constructor() {
    effect(() => {
      this.courses.set(this.store.courses());
      const accessToken = this.store.accessToken();
      const userData = this.store.userData();
      if (!accessToken && userData) {
        this.currentStep.set(4);
        console.log('User is not verified. Please verify your email address.');
      }
      console.log('course : ', this.store.courses());
      console.log('userData: ', this.store.userData());
      console.log('token: ', this.store.accessToken());
    });
  }

  ngOnInit(): void {
    this.registerForm = this.authFormService.createRegisterForm();
    this.loginForm = this.authFormService.createLoginForm();
    this.store.loadStorage();

    // Check for query parameters from social login redirect
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      if (token) {
        this.store.loginWithToken(token);
      }
      const error = params['error'];
      console.log('error: ', !!error);
    });
  }

  get courseFormArray(): FormArray {
    return this.registerForm.get('course') as FormArray;
  }

  isCourseSelected(id: string): boolean {
    return this.courseFormArray.value.includes(id);
  }

  onOtpInput(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    if (value.length > 1) {
      value = value.charAt(value.length - 1);
      input.value = value;
    }
    this.otp.update((otp) => {
      const newOtp = { ...otp };
      newOtp[index] = value;
      return newOtp;
    });

    if (value && index < 5) {
      const nextInput = input.nextElementSibling as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  onOtpKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace') {
      if (!input.value && index > 0) {
        const prevInput = input.previousElementSibling as HTMLInputElement;
        if (prevInput) {
          this.otp.update((otp) => {
            const newOtp = { ...otp };
            newOtp[index - 1] = '';
            return newOtp;
          });
          prevInput.focus();
          event.preventDefault();
        }
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      const prevInput = input.previousElementSibling as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
        event.preventDefault();
      }
    } else if (event.key === 'ArrowRight' && index < 5) {
      const nextInput = input.nextElementSibling as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
        event.preventDefault();
      }
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;
    const pastedText = clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedText)) {
      const otpUpdate: { [key: number]: string } = {};
      for (let i = 0; i < 6; i++) {
        otpUpdate[i] = pastedText[i];
      }
      this.otp.set(otpUpdate);

      const container = (event.target as HTMLElement).parentElement;
      if (container) {
        const inputs = container.querySelectorAll('input');
        if (inputs && inputs.length > 5) {
          inputs[5].focus();
        }
      }
    }
  }

  handleBack() {
    if (this.currentStep() === 4) {
      this.store.clearUserData();
      this.currentStep.set(1);
    } else {
      this.currentStep.update((step) => step - 1);
    }
  }

  resendOtp() {
    const userData = this.store.userData();
    if (!userData) {
      this.toastr.error('User data is missing. Please try logging in or registering again.', 'Error');
      return;
    }
    const payload = {
      email: userData.email,
      userName: userData.userName,
      course: this.registerForm.get('course')?.value || userData.course || [],
      role: userData.role,
      password: this.registerForm.get('password')?.value || this.loginForm.get('password')?.value || 'viewonly123!',
      confirmPassword: this.registerForm.get('confirmPassword')?.value || this.loginForm.get('password')?.value || 'viewonly123!',
    };
    this.store.register(payload);
  }

  handleOtpVerification() {
    const email = this.store.userData()?.email || this.registerForm.get('email')?.value || this.loginForm.get('email')?.value;
    const otpValue = Object.values(this.otp()).join('');
    if (!email) {
      this.toastr.error('Email is missing.', 'Error');
      return;
    }
    if (otpValue.length !== 6) {
      this.toastr.warning('Please enter a 6-digit OTP.', 'Warning');
      return;
    }
    this.store.verifyOtp({ email, otp: otpValue });
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

  toggleAuthMode() {
    this.isLogin = !this.isLogin;
    this.currentStep.set(1);
  }

  isStep1Valid(): boolean {
    const controls = ['userName', 'email', 'password', 'confirmPassword'];
    let isValid = true;
    controls.forEach((control) => {
      this.registerForm.get(control)?.markAsTouched();
      if (this.registerForm.get(control)?.invalid) {
        isValid = false;
      }
    });

    if (
      this.registerForm.get('password')?.value !== this.registerForm.get('confirmPassword')?.value
    ) {
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

  handleNext() {
    if (this.isLogin) {
      if (this.loginForm.valid) {
        this.store.login(this.loginForm.value);
      } else {
        this.loginForm.markAllAsTouched();
      }
    } else {
      if (this.currentStep() === 1) {
        if (!this.isStep1Valid()) {
          this.toastr.error('Please fill all required fields correctly.');
          return;
        }
        this.currentStep.set(2);
        this.store.getAllCourses();
        return;
      }

      if (this.currentStep() === 2) {
        if (!this.isStep2Valid()) return;
        const formData = { ...this.registerForm.value };
        formData.role = formData.role.toLowerCase();
        this.store.register(formData);
      }
    }
  }

  loginWithGoogle() {
    window.location.href = 'http://localhost:4000/auth/google';
  }
}
