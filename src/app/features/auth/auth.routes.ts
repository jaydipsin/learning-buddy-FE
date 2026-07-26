import { Routes } from "@angular/router";
import { authGuard } from "../../core/gurd/auth.guard";
export const AUTH_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./component/register/register').then(m => m.Register)
    },

]