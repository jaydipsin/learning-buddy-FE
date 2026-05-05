import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { ILoginPayload, Iregistrationpayload } from '../interface';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

type AuthState = {
  isLoading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  isLoading: false,
  error: null,
};

export const authStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withMethods((store, authService = inject(AuthService)) => ({
    register: rxMethod<Iregistrationpayload>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((payload) =>
          authService.register(payload).pipe(
            tapResponse({
              next: () => patchState(store, { isLoading: false }),
              error: (err) =>
                patchState(store, {
                  error: typeof err === 'string' ? err : 'Something went wrong',
                  isLoading: false,
                }),
            }),
          ),
        ),
      ),
    ),
    login: rxMethod<ILoginPayload>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((payload) =>
          authService.login(payload).pipe(
            tapResponse({
              next: () => patchState(store, { isLoading: false }),
              error: (err) =>
                patchState(store, {
                  error: typeof err === 'string' ? err : 'Something went wrong',
                  isLoading: false,
                }),
            }),
          ),
        ),
      ),
    ),
  })),
);
