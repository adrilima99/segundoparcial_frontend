import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data['expectedRoles'] as string[]; // Acepta un array de roles
  const currentRole = authService.getRole();

  // Verifica si el usuario está autenticado y su rol está dentro de los roles permitidos
  if (authService.isAuthenticated() && currentRole && expectedRoles.includes(currentRole)) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
