import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Role } from '../../shared/models/global.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthFormService {
  constructor(private fb: FormBuilder) {}

  createRegisterForm(): FormGroup {
    return this.fb.group({
      userName: ['test1', Validators.required],
      email: ['test1@gmail.com', [Validators.required, Validators.email]],
      password: ['1234Qwer!', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['1234Qwer!', [Validators.required, Validators.minLength(6)]],
      role: [Role.Student, Validators.required],
      parentNumber: [''],
      organizationName: [''],
      studentEmail: ['', [Validators.email]],
      organizationEmail: ['', [Validators.email]],
      course: this.fb.array([]),
    });
  }

  createOtpForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });
  }

  createLoginForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
}
