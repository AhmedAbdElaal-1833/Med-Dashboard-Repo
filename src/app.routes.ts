// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AppLayout } from '@/layout/component/app.layout';
import { Dashboard } from '@/pages/dashboard/dashboard';
import { Documentation } from '@/pages/documentation/documentation';
import { Landing } from '@/pages/landing/landing';
import { Notfound } from '@/pages/notfound/notfound';
import { DepartmentsManagment } from '@/components/departments-managment/departments-managment';
import { UserComponent } from '@/components/User-Management/user-management';
import { Login } from '@/pages/auth/login';
import { authGardGuard } from '@/pages/auth/auth-gard-guard';
import { Appointment } from '@/components/appointment/appointment';
import { Dashboard2 } from '@/pages/dashboard/components/dashboard2/dashboard2';

export const appRoutes: Routes = [ 
 // Default route
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  
  // Protected routes - require token
  {
    path: '',
    component: AppLayout,
    canActivate: [authGardGuard], // Protect with auth guard
    children: [
      { path: 'dashboard', component: Dashboard2 },
      { path: 'departments', component: DepartmentsManagment },
      { path: 'users', component: UserComponent },
      { path: 'appointment', component: Appointment },
    ]
  },
  
  // Auth routes - redirect if already logged in
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },

  
  // Public routes
  { path: 'landing', component: Landing },
  { path: 'notfound', component: Notfound },
  { path: '**', redirectTo: '/notfound' }

];