import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { LocalStorageService } from "../services/local-storage.service";

export const authGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
) => {
    const localStorageService = inject(LocalStorageService);
    const router = inject(Router);
    const userDetails = localStorageService.getUserData();

    if (userDetails && userDetails.accessToken) {
        return true;
    }
    return router.parseUrl('/auth');
}

export const restrictLoginGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
) => {
    const localStorageService = inject(LocalStorageService);
    const router = inject(Router);
    const userDetails = localStorageService.getUserData();

    if (userDetails && userDetails.accessToken) {
        return router.parseUrl('/student/dashboard');
    }
    return true;
}