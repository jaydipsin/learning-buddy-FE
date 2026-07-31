import { Routes } from "@angular/router";

export const AUTH_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./component/register/register').then(m => m.Register)
    },
    {
        path: 'complete-profile',
        title: 'Complete Profile',
        loadComponent: () => import('../complete-profile/complete-profile').then(m => m.CompleteProfile)
    }
]