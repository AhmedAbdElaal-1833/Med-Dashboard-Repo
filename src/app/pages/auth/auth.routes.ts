import { Routes } from '@angular/router';
import { Access } from './access';
import { Login } from './login';
import { Error } from './error';
import { Register } from './register/register';
import { authGardGuard } from './auth-gard-guard';

export default [

      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: Login ,
},
    
  
] as Routes;

