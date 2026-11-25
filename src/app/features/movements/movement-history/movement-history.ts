import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Page, SortDir } from '../../products/products/product.models';
import { MovementFilters, MovementSortField, Movimiento, ProblemDetail, TipoMovimiento } from '../movement.models';
import { MovementService } from '../movement.service';

@Component({
  selector: 'app-movement-history',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './movement-history.html',
  styleUrl: './movement-history.css',
})
export class MovementHistory implements OnInit {
  readonly productoId = input.required<number>();

  private fb = inject(FormBuilder);
  private service = inject(MovementService);

  protected readonly pageSize = 10;

  protected form = this.fb.nonNullable.group({ tipo: '', desde: '', hasta: '' });

  // Filtros ya aplicados: lo que está a medio escribir no cuenta hasta pulsar "Filtrar"
  private applied = this.form.getRawValue();
  private pageIndex = 0;
  private request?: Subscription;

  protected data = signal<Page<Movimiento> | null>(null);
  protected loading = signal(false);
  protected error = signal<string | null>(null);
  protected sort = signal<MovementSortField>('fecha');
  protected dir = signal<SortDir>('desc'); // más recientes primero, como el backend

  ngOnInit(): void {
    this.load();
  }

  /** El componente padre lo llama tras registrar un movimiento. */
  reload(): void {
    this.pageIndex = 0;
    this.load();
  }

  protected search(): void {
    const { desde, hasta } = this.form.getRawValue();
    if (desde && hasta && desde > hasta) {
      this.error.set('La fecha inicial no puede ser posterior a la final.');
      return;
    }
    this.applied = this.form.getRawValue();
    this.pageIndex = 0;
    this.load();
  }

  protected clear(): void {
    this.form.reset();
    this.sort.set('fecha');
    this.dir.set('desc');
    this.search();
  }

  protected toggleSort(field: MovementSortField): void {
    if (this.sort() === field) {
      this.dir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sort.set(field);
      this.dir.set(field === 'fecha' ? 'desc' : 'asc');
    }
    this.pageIndex = 0;
    this.load();
  }

  protected goTo(page: number): void {
    this.pageIndex = page;
    this.load();
  }

  protected sortIndicator(field: MovementSortField): string {
    if (this.sort() !== field) return '';
    return this.dir() === 'asc' ? ' ▲' : ' ▼';
  }

  protected ariaSort(field: MovementSortField): 'ascending' | 'descending' | 'none' {
    if (this.sort() !== field) return 'none';
    return this.dir() === 'asc' ? 'ascending' : 'descending';
  }

  /** Efecto real sobre el stock: la SALIDA viaja en positivo pero resta. */
  protected delta(m: Movimiento): number {
    return m.tipo === 'SALIDA' ? -Math.abs(m.cantidad) : m.cantidad;
  }

  private load(): void {
    const v = this.applied;
    const filters: MovementFilters = {
      tipo: v.tipo ? (v.tipo as TipoMovimiento) : undefined,
      desde: v.desde || undefined,
      hasta: v.hasta || undefined,
      sort: this.sort(),
      dir: this.dir(),
      page: this.pageIndex,
      size: this.pageSize,
    };

    this.request?.unsubscribe(); // descarta una petición anterior que siga en curso
    this.loading.set(true);
    this.error.set(null);

    this.request = this.service.list(this.productoId(), filters).subscribe({
      next: (page) => {
        this.data.set(page);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 401) return; // lo maneja el interceptor
        const problem: ProblemDetail | null =
          err.error && typeof err.error === 'object' ? err.error : null;
        this.error.set(
          err.status === 400
            ? (problem?.detail ?? 'Los filtros indicados no son válidos.')
            : 'No se pudo cargar el historial.',
        );
      },
    });
  }
}