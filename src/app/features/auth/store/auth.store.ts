import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { AuthService } from '../../../core/services/auth.service';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  IAuthResponse,
  ILoginPayload,
  IRegisterResponse,
  Iregistrationpayload,
} from '../../../shared/models/auth.interface';
import { exhaustMap, pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { ToastrService } from 'ngx-toastr';
import { IStateData, Role } from '../../../shared/models/global.interface';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { Router } from '@angular/router';
import { withDevtools } from '../../../core/store/devtools';

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
  withDevtools('authStore'),
  withState(initialState),

  withMethods((store, localStorage = inject(LocalStorageService)) => ({
    setStorage: () => {
      localStorage.saveUserData({ userData: store.userData(), accessToken: store.accessToken() });
    },
    setUnverifiedUserStorage: () => {
      localStorage.saveUserData({
        userData: store.userData(),
        accessToken: null,
      });
    },
    clearUserData: () => {
      localStorage.clearUserData();
      patchState(store, {
        accessToken: null,
        userData: null,
      });
    },
    loadStorage: () => {
      const userDetails = localStorage.getUserData();
      if (userDetails && userDetails.accessToken && userDetails.userData) {
        patchState(store, {
          userData: userDetails.userData || null,
          accessToken: userDetails.accessToken || null,
        });
      }
    },
  })),

  withMethods((store, router = inject(Router)) => ({
    redirectToDashboard: () => {
      const userData = store.userData();
      if (userData) {
        const role = userData.role;
        if (role) {
          const roleLower = role.toLowerCase();
          if (roleLower === Role.Student.toLowerCase()) {
            router.navigateByUrl(`/student/dashboard`);
          } else if (roleLower === Role.Teacher.toLowerCase()) {
            router.navigateByUrl(`/teacher/dashboard`);
          } else if (roleLower === Role.Admin.toLowerCase()) {
            router.navigateByUrl(`/admin/dashboard`);
          } else if (roleLower === Role.Parent.toLowerCase()) {
            router.navigateByUrl(`/parent/dashboard`);
          }
        } else {
          router.navigateByUrl('/auth');
        }
      }
    },

    redirectToLogin: () => {
      router.navigateByUrl('/login');
    },
  })),

  withMethods((store, authService = inject(AuthService), toastr = inject(ToastrService)) => ({
    register: rxMethod<Iregistrationpayload>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((payload) =>
          authService.register(payload).pipe(
            tapResponse({
              next: (res: IRegisterResponse) => {
                toastr.success(res?.message || 'Registration successfull', 'Success');
                patchState(store, {
                  isLoading: false,
                  userData: res.data.userData,
                });
                store.setUnverifiedUserStorage();
              },
              error: (err: any) => {
                toastr.error(
                  err?.error?.message || 'Registration failed. Please try again.',
                  'Error',
                );
                patchState(store, {
                  isLoading: false,
                });
              },
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
              next: (res: { message: string; courses: any[] }) => {
                console.log(res);
                patchState(store, { courses: res.courses });
                store.setStorage();
              },
              error: (err: any) => {
                toastr.error(
                  err?.error?.message || 'Courses fetch failed. Please try again.',
                  'Error',
                );
              },
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
                  accessToken: res.data.accessToken || null,
                  userData: res.data.userData,
                });
                console.log("RES : ", res)
                if (!res.data.accessToken) {
                  store.setUnverifiedUserStorage();
                  toastr.info(res?.message || 'Please verify your email address.', 'Info');
                } else {
                  store.setStorage();
                  toastr.success(res?.message || 'Login successfull', 'Success');
                  store.redirectToDashboard();
                }
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

    loginWithToken: rxMethod<string>(
      pipe(
        tap((token) => {
          patchState(store, { isLoading: true, accessToken: token });
        }),
        switchMap(() =>
          authService.getProfile().pipe(
            tapResponse({
              next: (res) => {
                patchState(store, {
                  isLoading: false,
                  userData: res.data.userData,
                });
                store.setStorage();
                toastr.success(res?.message || 'Login successful', 'Success');
                store.redirectToDashboard();
              },
              error: (err: any) => {
                toastr.error(err?.error?.message || 'Failed to retrieve profile details.', 'Error');
                patchState(store, {
                  isLoading: false,
                  accessToken: null,
                  userData: null,
                });
              },
            }),
          ),
        ),
      ),
    ),

    completeProfile: rxMethod<any>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((payload) =>
          authService.completeProfile(payload).pipe(
            tapResponse({
              next: (res: IAuthResponse) => {
                patchState(store, {
                  isLoading: false,
                  userData: res.data.userData,
                });
                store.setStorage();
                toastr.success(res?.message || 'Profile completed successfully', 'Success');
                store.redirectToDashboard();
              },
              error: (err: any) => {
                toastr.error(
                  err?.error?.message || 'Failed to complete profile. Please try again.',
                  'Error',
                );
                patchState(store, {
                  isLoading: false,
                });
              },
            }),
          ),
        ),
      ),
    ),

    logOut: rxMethod<void>(
      pipe(
        exhaustMap(() =>
          authService.logout().pipe(
            tapResponse({
              next: () => {
                patchState(store, {
                  isLoading: false,
                  accessToken: null,
                  userData: null,
                });
                store.clearUserData();
                store.redirectToLogin();
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

    verifyOtp: rxMethod<{ email: string; otp: string }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        exhaustMap((payload) =>
          authService.verifyOtp(payload.email, payload.otp).pipe(
            tapResponse({
              next: (res: IAuthResponse) => {
                const currentUserData = store.userData();
                const updatedUserData = currentUserData ? { ...currentUserData, isUserVerified: true } : null;
                patchState(store, {
                  isLoading: false,
                  accessToken: res.data.accessToken || null,
                  userData: updatedUserData,
                });
                store.setStorage();
                toastr.success(res?.message || 'OTP verified successfully', 'Success');
                store.redirectToDashboard();
              },
              error: (err: any) => {
                toastr.error(
                  err?.error?.message || 'OTP verification failed. Please try again.',
                  'Error',
                );
                patchState(store, {
                  isLoading: false,
                });
              },
            }),
          ),
        ),
      ),
    ),

    renewAccessToken: rxMethod<void>(
      pipe(
        exhaustMap(() =>
          authService.refreshToken().pipe(
            tapResponse({
              next: (res: { data: { accessToken: string }; message: string }) => {
                patchState(store, {
                  isLoading: false,
                  accessToken: res.data.accessToken,
                });
                store.setStorage();
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

  withHooks({
    onInit(store) {
      store.loadStorage();
    }
  })
);
