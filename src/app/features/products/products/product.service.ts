import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Page, ProductFilters, Producto } from './product.models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  list(f: ProductFilters): Observable<Page<Producto>> {
    let params = new HttpParams()
      .set('activo', f.activo)
      .set('page', f.page)
      .set('size', f.size);

    if (f.q) params = params.set('q', f.q);
    if (f.stockBajo !== undefined) params = params.set('stockBajo', f.stockBajo);
    if (f.precioMin !== undefined) params = params.set('precioMin', f.precioMin);
    if (f.precioMax !== undefined) params = params.set('precioMax', f.precioMax);
    if (f.sort) params = params.set('sort', f.sort).set('dir', f.dir);

    return this.http.get<Page<Producto>>('/api/productos', { params });
  }
}