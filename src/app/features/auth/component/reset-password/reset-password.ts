import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthFormService } from '../../../../core/services/auth.form.service';
import { AuthLayout } from '../../presentation/auth-layout';
import { AuthField } from '../../presentation/auth-field';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink, AuthLayout, AuthField],
  templateUrl: './reset-password.html',
  styleUrl: '../../presentation/auth-form.css',
})
export class ResetPassword {
  readonly resetForm = inject(AuthFormService).createResetPasswordForm();
  readonly resetStatus = toSignal(this.resetForm.statusChanges, { initialValue: this.resetForm.status });
  readonly isLoading = signal(false);
  readonly message = signal('');
  readonly isSuccess = signal(false);
  readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private redirect?: ReturnType<typeof setTimeout>;

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.redirect));
  }

  get token(): string | null {
    return this.route.snapshot.paramMap.get('token') || this.route.snapshot.queryParamMap.get('token');
  }

  onSubmit(): void {
    if (this.isLoading() || this.isSuccess() || !this.token) return;
    this.message.set('');
    this.resetForm.markAllAsTouched();
    const { newPassword, confirmNewPassword } = this.resetForm.value;
    if (this.resetForm.invalid || newPassword !== confirmNewPassword) return;

    this.isLoading.set(true);
    this.authService.resetPassword(this.token, newPassword, confirmNewPassword)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: res => {
          this.isLoading.set(false);
          this.isSuccess.set(true);
          this.message.set(res.message || 'Your password has been reset.');
          this.redirect = setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: err => {
          this.isLoading.set(false);
          this.message.set(err?.error?.message || 'Could not reset your password. The link may have expired.');
        },
      });
  }
}
