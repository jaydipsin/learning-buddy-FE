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
    },
    {
        path: 'reset-password',
        title: 'Reset Password',
        loadComponent: () => import('./component/reset-password/reset-password').then(m => m.ResetPassword)
    }
]