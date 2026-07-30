import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, FormControl, FormsModule } from '@angular/forms';
import { AuthFormService } from '../../core/services/auth.form.service';
import { Role } from '../../shared/models/global.interface';
import { authStore } from '../auth/store/auth.store';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { LocalStorageService } from '../../core/services/local-storage.service';

@Component({
  selector: 'app-complete-profile',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './complete-profile.html',
  styleUrl: './complete-profile.css',
})
export class CompleteProfile implements OnInit {

  // Theme and UI States
  isDarkMode = false;
  currentStep = signal(1);
  selectedAvatar = signal('🦊');
  selectedCommitment = signal('5h');

  // Forms
  completeProfileForm!: FormGroup;
  courses = signal<any[] | null | undefined>(null);

  // Inject Dependencies
  store = inject(authStore);
  authFormService = inject(AuthFormService);
  toastr = inject(ToastrService);

  constructor(
    private route: ActivatedRoute,
    private storageService: LocalStorageService
  ) {
    // Synchronize store courses with local courses signal
    effect(() => {
      this.courses.set(this.store.courses());
    });

    // Optionally populate form with existing user data when it arrives
    effect(() => {
      const userData = this.store.userData();
      if (userData) {
        if (userData.userName && !this.completeProfileForm.get('userName')?.value) {
          this.completeProfileForm.get('userName')?.setValue(userData.userName);
        }

        // Populate course array
        if (userData.course && Array.isArray(userData.course) && this.courseFormArray.length === 0) {
          userData.course.forEach((c: any) => {
            const courseId = typeof c === 'string' ? c : (c.id || c._id);
            if (courseId) {
              this.courseFormArray.push(new FormControl(courseId));
            }
          });
        }
      }
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      console.log("Token : ", token);
      if (token) {
        this.storageService.saveUserData({ accessToken: token });
      }
      this.store.loadStorage();
      if (this.store.accessToken()) {
        this.store.fetchProfile();
      }
      this.store.getAllCourses();
    });
    // Initialize form controls
    this.completeProfileForm = this.authFormService.createCompleteProfileForm();
  }

  // Getters
  get courseFormArray(): FormArray {
    return this.completeProfileForm.get('course') as FormArray;
  }

  // Actions
  selectAvatar(avatar: string) {
    this.selectedAvatar.set(avatar);
  }

  setCommitment(hours: string) {
    this.selectedCommitment.set(hours);
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

  isCourseSelected(id: string): boolean {
    return this.courseFormArray.value.includes(id);
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark', this.isDarkMode);
  }

  // Validations per Step
  isStep1Valid(): boolean {
    const userNameControl = this.completeProfileForm.get('userName');
    userNameControl?.markAsTouched();
    return !!userNameControl?.valid;
  }

  isStep2Valid(): boolean {
    // Step 2 has optional organization name, always valid
    return true;
  }

  isStep3Valid(): boolean {
    if (this.courseFormArray.length === 0) {
      this.toastr.warning('Please select at least one course before finishing.', 'Course Selection');
      return false;
    }
    return true;
  }

  // Step Navigation
  handleBack() {
    if (this.currentStep() > 1) {
      this.currentStep.update((step) => step - 1);
    }
  }

  handleNext() {
    // Step 1 check
    if (this.currentStep() === 1) {
      if (!this.isStep1Valid()) {
        this.toastr.error('Please enter a valid name.', 'Validation Error');
        return;
      }
      this.currentStep.set(2);
      return;
    }

    // Step 2 check
    if (this.currentStep() === 2) {
      if (!this.isStep2Valid()) {
        this.toastr.error('Please correct the validation errors.', 'Validation Error');
        return;
      }
      this.currentStep.set(3);
      return;
    }

    // Step 3 check
    if (this.currentStep() === 3) {
      if (!this.isStep3Valid()) {
        return;
      }
      this.submitProfile();
    }
  }

  // Submit complete profile form
  submitProfile() {
    const userData = this.store.userData();
    const userId = userData?.id || (userData as any)?._id;

    const payload = {
      ...this.completeProfileForm.value,
      avatar: this.selectedAvatar(),
      id: userId,
      role: Role.Student.toUpperCase(),
    };

    this.store.completeProfile(payload);
  }
}
