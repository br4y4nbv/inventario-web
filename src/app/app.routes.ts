import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/auth/auth.guards';
import { Admin } from './features/admin/admin/admin';
import { Login } from './features/auth/login/login';
import { Forbidden } from './features/errors/forbidden/forbidden';
import { Products } from './features/products/products/products';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'productos', component: Products, canActivate: [authGuard] },
  { path: 'admin', component: Admin, canActivate: [roleGuard('ADMIN')] },
  { path: 'forbidden', component: Forbidden },
  { path: '', pathMatch: 'full', redirectTo: 'productos' },
  { path: '**', redirectTo: 'productos' },
];