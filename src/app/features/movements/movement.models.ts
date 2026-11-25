export type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'AJUSTE';

export interface MovimientoRequest {
  tipo: TipoMovimiento;
  cantidad: number;
  motivo: string;
}

export interface Movimiento {
  id: number;
  productoId: number;
  sku: string;
  tipo: TipoMovimiento;
  cantidad: number;
  stockResultante: number;
  motivo: string;
  registradoPor: string;
  fecha: string; // ISO 8601 en UTC
}

/** Formato de error de la API (RFC 9457). */
export interface ProblemDetail {
  title?: string;
  detail?: string;
  status?: number;
  errores?: Record<string, string>;
}

export type MovementSortField = 'fecha' | 'cantidad' | 'tipo';

export interface MovementFilters {
  tipo?: TipoMovimiento;
  desde?: string; // AAAA-MM-DD
  hasta?: string; // AAAA-MM-DD
  sort: MovementSortField;
  dir: 'asc' | 'desc';
  page: number;
  size: number;
}