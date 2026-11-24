import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AuthFormService } from '../../../../core/services/auth.form.service';
import { AuthService } from '../../../../core/services/auth.service';
import { authStore } from '../../store/auth.store';
import { AuthLayout } from '../../presentation/auth-layout';
import { AuthField } from '../../presentation/auth-field';
import { ChipSelectComponent } from '../../../../shared/components/ui/chip-select/chip-select';
import { BASE_BACKEND_URL } from '../../../../../enviroment/enviroment';

type Screen = 'login' | 'signup' | 'courses' | 'forgot' | 'verify';

const headings: Record<Screen, string> = {
  login: 'Welcome back', signup: 'Create your account', courses: 'Choose your courses',
  forgot: 'Forgot your password?', verify: 'Verify your email',
};

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, AuthLayout, AuthField, ChipSelectComponent],
  templateUrl: './register.html',
  styleUrl: '../../presentation/auth-form.css',
})
export class Register {
  readonly store = inject(authStore);
  private readonly forms = inject(AuthFormService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  readonly registerForm = this.forms.createRegisterForm();
  readonly loginForm = this.forms.createLoginForm();
  readonly forgotPasswordForm = this.forms.createForgotPasswordForm();
  readonly forgotStatus = toSignal(this.forgotPasswordForm.statusChanges, { initialValue: this.forgotPasswordForm.status });
  readonly courseFormArray = this.registerForm.controls['course'] as FormArray;
  readonly screen = signal<Screen>('login');
  readonly heading = computed(() => headings[this.screen()]);
  readonly courseOptions = computed(() => this.store.courses().map(c => ({ id: c._id, label: c.name })));
  readonly otp = signal(['', '', '', '', '', '']);
  readonly feedback = signal('');
  readonly success = signal('');
  readonly isForgotLoading = signal(false);
  readonly resending = signal(false);
  readonly busy = computed(() => this.isForgotLoading() || this.store.isLoading() || this.store.coursesLoading());
  private verificationBack: Screen = 'login';

  constructor() {
    this.store.clearFormError();
    this.store.loadStorage();
    effect(() => {
      if (!this.store.accessToken() && this.store.userData()) {
        this.screen.set('verify');
      }
    });
    inject(ActivatedRoute).queryParams.pipe(takeUntilDestroyed()).subscribe(params => {
      if (params['token']) this.store.loginWithToken(params['token']);
      if (params['error']) this.feedback.set('Google sign-in did not finish. Please try again.');
    });
  }

  clearFeedback() {
    this.feedback.set('');
    this.success.set('');
    this.store.clearFormError();
  }

  open(screen: Screen) {
    this.clearFeedback();
    this.screen.set(screen);
  }

  backFromCode() {
    this.store.clearUserData();
    this.otp.set(['', '', '', '', '', '']);
    this.open(this.verificationBack);
  }

  login() {
    if (this.busy()) return;
    this.clearFeedback();
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;
    this.verificationBack = 'login';
    this.store.login(this.loginForm.value);
  }

  chooseCourses() {
    this.clearFeedback();
    this.registerForm.markAllAsTouched();
    const { password, confirmPassword } = this.registerForm.value;
    if (this.registerForm.invalid || password !== confirmPassword) return;
    this.screen.set('courses');
    this.store.getAllCourses();
  }

  toggleCourse(id: string | number) {
    this.clearFeedback();
    const index = this.courseFormArray.value.indexOf(id);
    if (index === -1) this.courseFormArray.push(new FormControl(id));
    else this.courseFormArray.removeAt(index);
  }

  register() {
    if (this.busy()) return;
    this.clearFeedback();
    if (!this.courseFormArray.length) {
      this.feedback.set('Choose at least one course to create your account.');
      return;
    }
    const data = this.registerForm.value;
    this.verificationBack = 'signup';
    this.store.register({ ...data, role: data.role.toLowerCase() });
  }

  onOtpInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (/^\d{6}$/.test(input.value)) {
      const code = input.value;
      input.value = code[index];
      this.fillCode(code, input);
      return;
    }
    const value = input.value.slice(-1);
    input.value = value;
    this.otp.update(digits => digits.map((digit, i) => i === index ? value : digit));
    if (value) (input.nextElementSibling as HTMLInputElement | null)?.focus();
  }

  onOtpKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    const backspace = event.key === 'Backspace' && !input.value;
    if ((backspace || event.key === 'ArrowLeft') && index > 0) {
      if (backspace) this.otp.update(digits => digits.map((digit, i) => i === index - 1 ? '' : digit));
      (input.previousElementSibling as HTMLInputElement).focus();
      event.preventDefault();
    } else if (event.key === 'ArrowRight' && index < 5) {
      (input.nextElementSibling as HTMLInputElement).focus();
      event.preventDefault();
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();
    const code = event.clipboardData?.getData('text').trim() || '';
    if (/^\d{6}$/.test(code)) this.fillCode(code, event.target as HTMLInputElement);
  }

  private fillCode(code: string, input: HTMLInputElement) {
    this.otp.set([...code]);
    (input.parentElement?.lastElementChild as HTMLInputElement | null)?.focus();
  }

  resendOtp() {
    if (this.busy()) return;
    this.clearFeedback();
    this.resending.set(true);
    const userData = this.store.userData();
    if (!userData) {
      this.feedback.set('Sign in again to request another code.');
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

  verify() {
    if (this.busy()) return;
    this.clearFeedback();
    this.resending.set(false);
    const email = this.store.userData()?.email || this.registerForm.value.email || this.loginForm.value.email;
    const otp = this.otp().join('');
    if (!email || otp.length !== 6) {
      this.feedback.set(email ? 'Enter the full six-digit code.' : 'Sign in again to verify your email.');
      return;
    }
    this.store.verifyOtp({ email, otp });
  }

  loginWithGoogle() {
    window.location.href = `${BASE_BACKEND_URL}/auth/google`;
  }

  sendForgotPasswordLink() {
    if (this.busy()) return;
    this.clearFeedback();
    this.forgotPasswordForm.markAllAsTouched();
    if (this.forgotPasswordForm.invalid) return;
    this.isForgotLoading.set(true);
    this.authService.forgotPassword(this.forgotPasswordForm.value.email)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: res => {
          this.isForgotLoading.set(false);
          this.open('login');
          this.success.set(res.message || 'Check your email for a password reset link.');
        },
        error: err => {
          this.isForgotLoading.set(false);
          this.feedback.set(err?.error?.message || 'Could not send the reset link. Try again.');
        },
      });
  }
}
