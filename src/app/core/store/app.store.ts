import { patchState, signalStore, withComputed, withMethods, withState, withHooks } from '@ngrx/signals';
import { GlobalAppState } from '../../shared/models/global.interface';
import { computed, inject, effect } from '@angular/core';
import { AppService } from '../services/app.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { withDevtools } from './devtools';
import { authStore } from '../../features/auth/store/auth.store';
import { IUserProfile } from '../../shared/models/global.interface';

const initialAppState: GlobalAppState = {
  isLoading: false,
  error: null,
  appData: null,
};

export const appStore = signalStore(
  { providedIn: 'root' },
  withDevtools('appStore'),
  withState(initialAppState),
  withComputed((store, auth = inject(authStore)) => ({
    isAuthenticated: computed(() => !!auth.accessToken()),
  })),
  withMethods((store, appService = inject(AppService)) => ({
    loadUserData: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          appService.getUserData().pipe(
            tapResponse({
              next: (user) =>
                patchState(store, {
                  appData: user as unknown as { userDetails: IUserProfile },
                  isLoading: false,
                }),
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
  withHooks({
    onInit(store) {
      effect(() => {
        if (store.isAuthenticated()) {
          store.loadUserData();
        }
      });
    },
  })
);
