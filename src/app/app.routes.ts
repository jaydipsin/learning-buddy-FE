import { Routes } from '@angular/router';
import { authGuard, restrictLoginGuard } from './core/gurd/auth.guard';
import { Layout } from './features/layout/layout';

import { inject } from '@angular/core';
import { LocalStorageService } from './core/services/local-storage.service';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: () => {
          const localStorageService = inject(LocalStorageService);
          const userDetails = localStorageService.getUserData();
          if (userDetails && userDetails.userData) {
            const role = userDetails.userData.role.toLowerCase();
            return `${role}/dashboard`;
          }
          return 'student/dashboard';
        },
        pathMatch: 'full',
      },
      {
        path: 'student/dashboard',
        loadComponent: () =>
          import('./features/dashboard/component/dashboard').then((c) => c.Dashboard),
        title: 'Dashboard',
      },
      {
        path: 'teacher/dashboard',
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
        path: 'parent/dashboard',
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
    path: 'complete-profile',
    title: 'Complete Profile',
    // canActivate: [authGuard],
    loadComponent: () => import('./features/complete-profile/complete-profile').then(m => m.CompleteProfile)
  },
  {
    path: '**',
    redirectTo: 'auth',
  },
];
