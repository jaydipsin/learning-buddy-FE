import {
  HttpInterceptorFn,
  HttpRequest,
  HttpErrorResponse,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, filter, ReplaySubject, switchMap, take, throwError, Observable } from 'rxjs';
import { authStore } from '../../features/auth/store/auth.store';
import { AuthService } from '../services/auth.service';
import { LocalStorageService } from '../services/local-storage.service';
import { patchState } from '@ngrx/signals';

let isRefreshing = false;
let accessToken$ = new ReplaySubject<string | null>(1);
export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next) => {
  const localStorageService = inject(LocalStorageService);
  const authService = inject(AuthService);
  const authStoreInstance = inject(authStore);
  const authApis = ['/login', '/register'];
  const logOut = ['/logout'];
  const isRefresh = req.url.includes('/refresh');
  const isAuthApiRequest = authApis.some((api) => req.url.includes(api));
  const isLogOutRequest = logOut.some((endpoint) => req.url.includes(endpoint));

  // 1. Attach token to initial request
  let authReq = req;

  if (isAuthApiRequest || isRefresh) {
    authReq = req.clone({
      withCredentials: true,
    });
  }

  const token = authStoreInstance.accessToken();
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 2. Handle 401 Unauthorized
      if (error.status === 401 && !isAuthApiRequest && !isLogOutRequest && !isRefresh) {
        return handle401Req(req, next, authStoreInstance, authService, localStorageService);
      }

      // 4. Handle 403 or failed refresh
      if (error.status === 403 && isRefresh) {
        authStoreInstance.clearUserData();
        localStorageService.clearUserData();
      }

      return throwError(() => error);
    }),
  );
};

const handle401Req = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  store: any,
  authService: AuthService,
  localStorageService: LocalStorageService,
): Observable<HttpEvent<unknown>> => {
  if (!isRefreshing) {
    isRefreshing = true;
    accessToken$.next(null); // Reset current stream

    // Use the actual HTTP Observable from authService
    return authService.refreshToken().pipe(
      switchMap((res) => {
        isRefreshing = false;
        console.log('From interceptors res: ', res);
        const newToken = res.data.accessToken;

        if (!newToken) {
          store.clearUserData();
          localStorageService.clearUserData();
          return throwError(() => new Error('Refresh token expired'));
        }

        // Update the NgRx Signals store with the new accessToken and save to local storage
        patchState(store, { accessToken: newToken });
        store.setStorage();

        // Broadcast the new token to all queued requests waiting in the "else" block
        accessToken$.next(newToken);

        const authReq = req.clone({
          setHeaders: { Authorization: `Bearer ${newToken}` },
        });
        return next(authReq);
      }),
      catchError((refreshErr) => {
        isRefreshing = false;
        accessToken$.next(null);
        store.clearUserData();
        localStorageService.clearUserData();
        return throwError(() => refreshErr);
      }),
    );
  } else {
    // If a refresh is already in progress, wait for the ReplaySubject to get a token
    return accessToken$.pipe(
      filter((token): token is string => token !== null), // Wait until token is not null
      take(1),
      switchMap((token) => {
        const authReq = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        });
        return next(authReq);
      }),
    );
  }
};
