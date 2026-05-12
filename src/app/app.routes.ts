import { Routes } from '@angular/router';
import { authGuard, restrictLoginGuard } from './core/gurd/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'student/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/component/register').then((c) => c.Register),
    title: 'Register',
    canActivate: [restrictLoginGuard]
  },
  {
    path: 'student/dashboard',
    loadComponent: () => import('./features/dashboard/component/dashboard').then((c) => c.Dashboard),
    title: 'Dashboard',
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'auth',
    pathMatch: 'full',
    title: '404'
  }
];
