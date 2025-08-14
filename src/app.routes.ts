// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AppLayout } from '@/layout/component/app.layout';
import { Dashboard } from '@/pages/dashboard/dashboard';
import { Documentation } from '@/pages/documentation/documentation';
import { Landing } from '@/pages/landing/landing';
import { Notfound } from '@/pages/notfound/notfound';
import { DepartmentsManagment } from '@/components/departments-managment/departments-managment';
import { UserComponent } from '@/components/User-Management/user-management';

export const appRoutes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      { path: '', component: Dashboard },
      { path: 'departments', component: DepartmentsManagment },
      { path: 'users', component: UserComponent },
      { path: 'uikit', loadChildren: () => import('@/pages/uikit/uikit.routes').then(m => m.Routes) },
      { path: 'pages', loadChildren: () => import('@/pages/pages.routes').then(m => m.Routes) },
    ],
  },
  { path: 'landing', component: Landing },
  { path: 'notfound', component: Notfound },
  { path: 'auth', loadChildren: () => import('@/pages/auth/auth.routes').then(m => m.Routes) },
  { path: '**', redirectTo: '/notfound' },
];