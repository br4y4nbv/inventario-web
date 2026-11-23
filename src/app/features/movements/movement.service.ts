import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Movimiento, MovimientoRequest } from './movement.models';

@Injectable({ providedIn: 'root' })
export class MovementService {
  private http = inject(HttpClient);

  register(productoId: number, body: MovimientoRequest): Observable<Movimiento> {
    return this.http.post<Movimiento>(`/api/productos/${productoId}/movimientos`, body);
  }
}