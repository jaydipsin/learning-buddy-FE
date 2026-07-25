import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { authStore } from "../../features/auth/store/auth.store";

export const authGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
) => {
    const store = inject(authStore);
    const router = inject(Router);

    if (store.accessToken() && store.userData()?.role) {
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
        const role = store.userData()?.role;
        if (role) {
            return router.parseUrl(`/${role.toLowerCase()}/dashboard`);
        }
    }
    return true;
}