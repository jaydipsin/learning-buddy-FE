import { Routes } from '@angular/router';
import { authGuard, restrictLoginGuard } from './core/gurd/auth.guard';
import { Layout } from './features/layout/layout';
      
export const routes: Routes = [
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'student/dashboard',
        pathMatch: 'full',
      },
      {
        path: 'student/dashboard',
        loadComponent: () =>
          import('./features/dashboard/component/dashboard').then((c) => c.Dashboard),
        title: 'Dashboard',
      },
      {
        path: 'admin/dashboard',
        loadComponent: () =>
          import('./features/dashboard/component/dashboard').then((c) => c.Dashboard),
        title: 'Dashboard',
      },
      {
        path: 'student/mock-test',
        loadComponent: () =>
          import('./features/generate-mocktest/generate-mocktest').then((c) => c.GenerateMockTest),
        title: 'Generate Mock Test',
      },
    ],
  },

  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(r => r.AUTH_ROUTES),
    canActivate: [restrictLoginGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/component/reset-password/reset-password').then((c) => c.ResetPassword),
    title: 'Reset Password',
  },
  {
    path: 'login',
    redirectTo: 'auth',
    pathMatch: 'full',
  },

  {
    path: '**',
    redirectTo: 'auth',
  },
];
