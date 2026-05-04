import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { GlobalAppState } from '../shared/types/global.interface';
import { computed, inject } from '@angular/core';
import { AppService } from '../shared/services/app.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';

const initialAppState: GlobalAppState = {
  isLoading: false,
  error: null,
  appData: null,
  isAuthenticated: false,
};

export const appStore = signalStore(
  { providedIn: 'root' },
  withState(initialAppState),
  withComputed(() => ({})),
  withMethods((store, appService = inject(AppService)) => ({
    loadUserData: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((userId) =>
          appService.getUserData(userId).pipe(
            tapResponse({
              next: (user) =>
                patchState(store, { appData: { userDetails: user }, isLoading: false }),
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
