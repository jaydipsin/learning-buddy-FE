import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { AuthService } from "../services/auth.service";
import { inject } from "@angular/core";
import { authStore } from "../../features/auth/store/auth.store";
import { catchError, of, throwError } from "rxjs";

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next) => {
    const authService = inject(AuthService);
    const authStoreInstance = inject(authStore);
    if (authStoreInstance.accessToken()) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${authStoreInstance.accessToken()}`
            }
        })
    }


    const authApis = ['/login', '/logout', '/register'];
    const isRefresh = req.url.includes('/refresh')
    const isAuthApiRequest = authApis.some(api => req.url.includes(api));


    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && !isAuthApiRequest && !isRefresh) {
                // Call refresh token API, 
                return of()
            }

            if (error.status === 403 && isRefresh) {
                authStoreInstance.clearUserData();
                return throwError(() => error);
            }
            return throwError(() => error);
        })
    )
} 