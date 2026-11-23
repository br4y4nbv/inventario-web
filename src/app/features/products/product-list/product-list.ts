import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Auth } from '../../../core/auth/auth';
import { ProductService } from '../products/product.service';
import { Page, ProductFilters, Producto, SortDir, SortField } from '../products/product.models';

@Component({
  selector: 'app-product-list',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ProductService);
  private router = inject(Router);
  protected readonly auth = inject(Auth);

  protected readonly pageSize = 20;

  protected form = this.fb.nonNullable.group({
    q: '',
    activo: 'true',
    stockBajo: '',
    precioMin: this.fb.control<number | null>(null),
    precioMax: this.fb.control<number | null>(null),
  });

  // Filtros ya aplicados: lo que se escribe en el formulario no cuenta hasta pulsar "Buscar"
  private applied = this.form.getRawValue();
  private pageIndex = 0;
  private request?: Subscription;

  protected data = signal<Page<Producto> | null>(null);
  protected loading = signal(false);
  protected error = signal<string | null>(null);
  protected sort = signal<SortField | null>(null);
  protected dir = signal<SortDir>('asc');

  ngOnInit(): void {
    this.load();
  }

  protected search(): void {
    this.applied = this.form.getRawValue();
    this.pageIndex = 0;
    this.load();
  }

  protected clear(): void {
    this.form.reset();
    this.sort.set(null);
    this.dir.set('asc');
    this.search();
  }

  protected toggleSort(field: SortField): void {
    if (this.sort() === field) {
      this.dir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sort.set(field);
      this.dir.set('asc');
    }
    this.pageIndex = 0;
    this.load();
  }

  protected goTo(page: number): void {
    this.pageIndex = page;
    this.load();
  }

  protected sortIndicator(field: SortField): string {
    if (this.sort() !== field) return '';
    return this.dir() === 'asc' ? ' ▲' : ' ▼';
  }

  protected ariaSort(field: SortField): 'ascending' | 'descending' | 'none' {
    if (this.sort() !== field) return 'none';
    return this.dir() === 'asc' ? 'ascending' : 'descending';
  }

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  private load(): void {
    const v = this.applied;
    const filters: ProductFilters = {
      q: v.q.trim() || undefined,
      activo: v.activo === 'true',
      stockBajo: v.stockBajo === '' ? undefined : v.stockBajo === 'true',
      precioMin: v.precioMin ?? undefined,
      precioMax: v.precioMax ?? undefined,
      sort: this.sort() ?? undefined,
      dir: this.dir(),
      page: this.pageIndex,
      size: this.pageSize,
    };

    this.request?.unsubscribe(); // si hay una petición anterior en curso, se descarta
    this.loading.set(true);
    this.error.set(null);

    this.request = this.service.list(filters).subscribe({
      next: (page) => {
        this.data.set(page);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        // El 401 ya lo maneja el interceptor (cierra sesión y va al login)
        if (err.status !== 401) {
          this.error.set('No se pudieron cargar los productos.');
        }
      },
    });
  }
}