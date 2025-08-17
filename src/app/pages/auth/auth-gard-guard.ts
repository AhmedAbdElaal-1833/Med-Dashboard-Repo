import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGardGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
  const token = localStorage.getItem('token');
  
  if (token) {
    return true; // Allow access to protected route
  } else {
    router.navigate(['/auth/login']); // Redirect to login
    return false;
  }
};
