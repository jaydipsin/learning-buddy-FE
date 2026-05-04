import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core/primitives/di';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Iregistrationpayload } from '../interface';
import { pipe, switchMap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

export const authState = signalStore(
  { providedIn: 'root' },
  withMethods((store, authService = inject(AuthService)) => ({
    register: rxMethod<Iregistrationpayload>(
      pipe(
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
  })),
);
