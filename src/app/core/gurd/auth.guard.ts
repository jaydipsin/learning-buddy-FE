import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { authStore } from "../../features/auth/store/auth.store";

export const authGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
) => {
    const store = inject(authStore);
    const router = inject(Router);

    if (store.accessToken()) {
        return true;
    }
    return router.parseUrl('/auth');
}

export const restrictLoginGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
) => {
    const store = inject(authStore);
    const router = inject(Router);

    if (store.accessToken()) {
        const role = store.userData()?.role?.toLowerCase() || 'student';
        return router.parseUrl(`/${role}/dashboard`);
    }
    return true;
}