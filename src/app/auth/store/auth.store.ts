import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { IAuthResponse, ILoginPayload, Iregistrationpayload } from '../interface';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { ToastrService } from 'ngx-toastr';
import { IStateData } from '../../shared/types/global.interface';
import { LocalStorageService } from '../../shared/services/local-storage.service';


export interface AuthState extends IStateData {
  isLoading: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  userData: null,
  themePreference: 'light',
  isLoading: false,
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
