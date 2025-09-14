import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { UserComponent } from '@/components/User-Management/user-management';
import { Appointment } from '@/components/appointment/appointment';
import { Dashboard2 } from './dashboard/components/dashboard2/dashboard2';

export default [
    { path: 'dashboard', component: Dashboard2 },
    { path: 'documentation', component: Documentation },
    { path: 'users', component: UserComponent },
    { path: 'appointment', component: Appointment },
    // { path: 'crud', component: Crud },
    // { path: 'empty', component: Empty },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
