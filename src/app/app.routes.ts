import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/auth/auth.guards';
import { Admin } from './features/admin/admin/admin';
import { Login } from './features/auth/login/login';
import { Forbidden } from './features/errors/forbidden/forbidden';
import { ProductMovements } from './features/movements/product-movements/product-movements';
import { ProductList } from './features/products/product-list/product-list';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'productos', component: ProductList, canActivate: [authGuard] },
  { path: 'productos/:id/movimientos', component: ProductMovements, canActivate: [authGuard] },
  { path: 'admin', component: Admin, canActivate: [roleGuard('ADMIN')] },
  { path: 'forbidden', component: Forbidden },
  { path: '', pathMatch: 'full', redirectTo: 'productos' },
  { path: '**', redirectTo: 'productos' },
];