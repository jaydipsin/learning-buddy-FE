import { Component, inject, OnInit, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthFormService } from '../../../../core/services/auth.form.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  resetForm!: FormGroup;
  token = signal<string>('');
  isLoading = signal<boolean>(false);
  message = signal<string>('');
  isSuccess = signal<boolean>(false);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private authFormService = inject(AuthFormService);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.resetForm = this.authFormService.createResetPasswordForm();

    this.route.queryParams.subscribe((params) => {
      const tokenParam = params['token'];
      if (tokenParam) {
        this.token.set(tokenParam);
      }
    });

    this.route.params.subscribe((params) => {
      const tokenParam = params['token'];
      if (tokenParam) {
        this.token.set(tokenParam);
      }
    });
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.toastr.error('Please enter valid passwords (at least 8 characters).');
      return;
    }

    const token = this.token();
    if (!token) {
      this.toastr.error('Invalid or missing password reset token.');
      return;
    }

    const { newPassword, confirmNewPassword } = this.resetForm.value;

    if (newPassword !== confirmNewPassword) {
      this.toastr.error('Passwords do not match.');
      return;
    }

    this.isLoading.set(true);
    this.authService.resetPassword(token, newPassword, confirmNewPassword).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.isSuccess.set(true);
        this.message.set(res.message || 'Password reset successful!');
        this.toastr.success(this.message());
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading.set(false);
        const errorMsg = err?.error?.message || 'Failed to reset password. Token may be expired.';
        this.message.set(errorMsg);
        this.toastr.error(errorMsg);
      },
    });
  }
}
