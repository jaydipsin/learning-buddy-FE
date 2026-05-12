import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { AuthService } from '../../../core/services/auth.service';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { IAuthResponse, ILoginPayload, Iregistrationpayload } from '../../../shared/models/auth.interface';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { ToastrService } from 'ngx-toastr';
import { IStateData, Role } from '../../../shared/models/global.interface';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { Router } from '@angular/router';


export interface AuthState extends IStateData {
  isLoading: boolean;
  courses: any[];
}

const initialState: AuthState = {
  accessToken: null,
  userData: null,
  themePreference: 'light',
  isLoading: false,
  courses: [],
};

export const authStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withMethods((store, localStorage = inject(LocalStorageService)) => ({
    setStorage: () => {
      localStorage.saveUserData({ userData: store.userData(), accessToken: store.accessToken() });
    },
    clearUserData: () => {
      localStorage.clearUserData();
      patchState(store, {
        accessToken: null,
        userData: null,
      })
    }
  })),

  withMethods((store, router = inject(Router)) => ({
    redirectToDashboard: () => {
      const userData = store.userData();
      if (userData) {
        const role = userData.role.toLowerCase();
        if (role === Role.Student.toLowerCase()) {
          router.navigateByUrl(`/student/dashboard`);
        } else if (role === Role.Teacher.toLowerCase()) {
          router.navigateByUrl(`/teacher/dashboard`);
        } else if (role === Role.Admin.toLowerCase()) {
          router.navigateByUrl(`/admin/dashboard`);
        } else if (role === Role.Parent.toLowerCase()) {
          router.navigateByUrl(`/parent/dashboard`);
        }
      }
    },

  })),

  withMethods((store, authService = inject(AuthService), toastr = inject(ToastrService)) => ({
    register: rxMethod<Iregistrationpayload>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((payload) =>
          authService.register(payload).pipe(
            tapResponse({
              next: (res: IAuthResponse) => {
                toastr.success(res?.message || "Registration successfull", 'Success');
                patchState(store, { isLoading: false, accessToken: res.data.accessToken, userData: res.data.userData })
                store.setStorage();
                store.redirectToDashboard();
              },
              error: (err: any) => {
                toastr.error(err?.error?.message || 'Registration failed. Please try again.', 'Error');
                patchState(store, {
                  isLoading: false,
                })
              }
            }),
          ),
        ),
      ),
    ),

    getAllCourses: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          authService.getAllCourses().pipe(
            tapResponse({
              next: (res: { message: string, courses: any[] }) => {
                console.log(res);

                patchState(store, { courses: res.courses })
              },
              error: (err: any) => {
                toastr.error(err?.error?.message || 'Courses fetch failed. Please try again.', 'Error');
              }
            }),
          ),
        ),
      ),
    ),


    login: rxMethod<ILoginPayload>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((payload) =>
          authService.login(payload).pipe(
            tapResponse({
              next: (res: IAuthResponse) => {
                patchState(store, {
                  isLoading: false,
                  accessToken: res.data.accessToken,
                  userData: res.data.userData
                });
                store.setStorage()

                toastr.success(res?.message || "Login successfull", 'Success');
              },
              error: (err: any) => {
                toastr.error(err?.error?.message || 'Login failed. Please try again.', 'Error');
                patchState(store, {
                  isLoading: false,
                });
              },
            }),
          ),
        ),
      ),
    ),

  })),


);
