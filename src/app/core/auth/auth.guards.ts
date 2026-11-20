import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';
import { Role } from './auth.models';

/** Exige sesión iniciada. Si no hay, va al login recordando a dónde quería ir. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  return auth.isLoggedIn()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Exige uno de los roles indicados. Sin sesión va al login; sin permiso, a /forbidden. */
export const roleGuard =
  (...roles: Role[]): CanActivateFn =>
  (_route, state) => {
    const auth = inject(Auth);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }
    return auth.hasRole(...roles) ? true : router.createUrlTree(['/forbidden']);
  };

/** Para el login: si ya hay sesión, no tiene sentido mostrarlo. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  return auth.isLoggedIn() ? router.createUrlTree(['/productos']) : true;
};