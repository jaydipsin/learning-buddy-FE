import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { authStore } from '../auth/store/auth.store';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  readonly store = inject(authStore);
  readonly form = inject(FormBuilder).group({
    userName: ['', [Validators.required, Validators.maxLength(50)]],
    avatar: ['', Validators.maxLength(2048)],
    course: [[] as string[]],
  });

  ngOnInit(): void {
    const user = this.store.userData();
    if (user) {
      this.form.patchValue({
        userName: user.userName || '',
        avatar: user.avatar || '',
        course: (user.course || []).map((course: any) => course.id || course._id || course),
      });
    }
    if (this.store.courses().length === 0) this.store.getAllCourses();
  }

  get courses(): any[] {
    return this.store.courses();
  }

  get userEmail(): string {
    return this.store.userData()?.email || '';
  }

  isSelected(courseId: string): boolean {
    return (this.form.controls.course.value || []).includes(courseId);
  }

  toggleCourse(courseId: string): void {
    const selected = this.form.controls.course.value || [];
    this.form.controls.course.setValue(
      selected.includes(courseId)
        ? selected.filter((id) => id !== courseId)
        : [...selected, courseId],
    );
    this.form.controls.course.markAsDirty();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.store.updateProfile({
      userName: value.userName || undefined,
      avatar: value.avatar || undefined,
      course: value.course || undefined,
    });
  }
}
