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

  // Forms and Role configurations
  completeProfileForm!: FormGroup;
  roles = Role;
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
        if (userData.role) {
          const roleLower = userData.role.toLowerCase();
          this.completeProfileForm.get('role')?.setValue(roleLower);
        }
        if (userData.parentNumber && !this.completeProfileForm.get('parentNumber')?.value) {
          this.completeProfileForm.get('parentNumber')?.setValue(userData.parentNumber);
        }
        if (userData.organizationName && !this.completeProfileForm.get('organizationName')?.value) {
          this.completeProfileForm.get('organizationName')?.setValue(userData.organizationName);
        }
        if (userData.studentEmail && !this.completeProfileForm.get('studentEmail')?.value) {
          this.completeProfileForm.get('studentEmail')?.setValue(userData.studentEmail);
        }
        if (userData.organizationEmail && !this.completeProfileForm.get('organizationEmail')?.value) {
          this.completeProfileForm.get('organizationEmail')?.setValue(userData.organizationEmail);
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

    // Load existing storage data & fetch course list

  }

  // Getters
  get role(): string {
    const formRole = this.completeProfileForm?.get('role')?.value;
    if (formRole) {
      return formRole.toLowerCase();
    }
    return this.store.userData()?.role?.toLowerCase() || '';
  }

  get courseFormArray(): FormArray {
    return this.completeProfileForm.get('course') as FormArray;
  }

  // Actions
  setRole(selectedRole: string) {
    this.completeProfileForm.get('role')?.setValue(selectedRole);
  }

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
    let isValid = true;
    const currentRole = this.role;

    if (currentRole === this.roles.Parent.toLowerCase()) {
      const parentNumber = this.completeProfileForm.get('parentNumber');
      const studentEmail = this.completeProfileForm.get('studentEmail');

      parentNumber?.markAsTouched();
      studentEmail?.markAsTouched();

      if (parentNumber?.invalid) isValid = false;
      if (studentEmail?.invalid || !studentEmail?.value) {
        studentEmail?.setErrors({ required: true });
        isValid = false;
      }
    } else if (currentRole === this.roles.Teacher.toLowerCase()) {
      const orgName = this.completeProfileForm.get('organizationName');
      const orgEmail = this.completeProfileForm.get('organizationEmail');

      orgName?.markAsTouched();
      orgEmail?.markAsTouched();

      if (orgEmail?.invalid || !orgEmail?.value) {
        orgEmail?.setErrors({ required: true });
        isValid = false;
      }
    }

    return isValid;
  }

  isStep3Valid(): boolean {
    // If Student or Teacher, warn if no courses are selected but let them pass
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

      if (this.role === this.roles.Parent.toLowerCase()) {
        // Parents do not have courses to select, complete here
        this.submitProfile();
      } else {
        // Students and Teachers move to step 3
        this.currentStep.set(3);
      }
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
    const payload = {
      ...this.completeProfileForm.value,
      avatar: this.selectedAvatar(),
      id: this.store.userData()?.id,
      // weeklyCommitment: this.selectedCommitment(),
      role: this.role.toUpperCase(), // Match store expectations if needed
    };

    // Remove unused controls to keep payload clean
    if (this.role === this.roles.Student.toLowerCase()) {
      delete payload.organizationEmail;
      delete payload.studentEmail;
    } else if (this.role === this.roles.Parent.toLowerCase()) {
      delete payload.organizationName;
      delete payload.organizationEmail;
      delete payload.course;
    } else if (this.role === this.roles.Teacher.toLowerCase()) {
      delete payload.parentNumber;
    }

    this.store.completeProfile(payload);
  }
}
