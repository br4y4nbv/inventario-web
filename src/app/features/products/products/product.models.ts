export interface Producto {
  id: number;
  sku: string;
  nombre: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  stockBajo: boolean;
  activo: boolean;
}

export interface PageInfo {
  size: number;
  number: number; // página actual, empieza en 0
  totalElements: number;
  totalPages: number;
}

export interface Page<T> {
  content: T[];
  page: PageInfo;
}

export type SortField = 'nombre' | 'sku' | 'precio' | 'stock' | 'creadoEn';
export type SortDir = 'asc' | 'desc';

export interface ProductFilters {
  q?: string;
  activo: boolean;
  stockBajo?: boolean;
  precioMin?: number;
  precioMax?: number;
  sort?: SortField;
  dir: SortDir;
  page: number;
  size: number;
}