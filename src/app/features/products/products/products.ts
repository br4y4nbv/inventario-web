import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/auth/auth';

@Component({
  selector: 'app-products',
  imports: [RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {
  protected readonly auth = inject(Auth);
  private router = inject(Router);

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}