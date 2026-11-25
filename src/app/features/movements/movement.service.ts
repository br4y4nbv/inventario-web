import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Page } from '../products/products/product.models';
import { MovementFilters, Movimiento, MovimientoRequest } from './movement.models';

@Injectable({ providedIn: 'root' })
export class MovementService {
  private http = inject(HttpClient);

  register(productoId: number, body: MovimientoRequest): Observable<Movimiento> {
    return this.http.post<Movimiento>(`/api/productos/${productoId}/movimientos`, body);
  }

  list(productoId: number, f: MovementFilters): Observable<Page<Movimiento>> {
    let params = new HttpParams()
      .set('sort', f.sort)
      .set('dir', f.dir)
      .set('page', f.page)
      .set('size', f.size);

    if (f.tipo) params = params.set('tipo', f.tipo);
    if (f.desde) params = params.set('desde', f.desde);
    if (f.hasta) params = params.set('hasta', f.hasta);

    return this.http.get<Page<Movimiento>>(`/api/productos/${productoId}/movimientos`, { params });
  }
}