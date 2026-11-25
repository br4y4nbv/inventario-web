import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { MovementHistory } from '../movement-history/movement-history';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Producto } from '../../products/products/product.models';
import { ProductService } from '../../products/products/product.service';
import { ProblemDetail, TipoMovimiento } from '../movement.models';
import { MovementService } from '../movement.service';

/** Refleja la regla del backend: ENTRADA/SALIDA > 0, AJUSTE distinto de 0. */
const cantidadValida: ValidatorFn = (group) => {
  const cantidad = group.get('cantidad')?.value as number | null;
  const tipo = group.get('tipo')?.value as TipoMovimiento;

  if (cantidad === null || cantidad === undefined) return null; // 'required' lo cubre
  if (!Number.isInteger(cantidad)) return { cantidadEntera: true };
  if (tipo === 'AJUSTE') return cantidad !== 0 ? null : { cantidadCoherente: true };
  return cantidad > 0 ? null : { cantidadCoherente: true };
};

@Component({
  selector: 'app-product-movements',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, MovementHistory],
  templateUrl: './product-movements.html',
  styleUrl: './product-movements.css',
})
export class ProductMovements implements OnInit {
  private fb = inject(FormBuilder);
  private products = inject(ProductService);
  private movements = inject(MovementService);
  private id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  protected form = this.fb.group(
    {
      tipo: this.fb.nonNullable.control<TipoMovimiento>('ENTRADA'),
      cantidad: this.fb.control<number | null>(null, Validators.required),
      motivo: this.fb.nonNullable.control(''),
    },
    { validators: cantidadValida },
  );

  protected producto = signal<Producto | null>(null);
  protected loadError = signal<string | null>(null);
  protected saving = signal(false);
  protected errors = signal<string[]>([]);
  protected success = signal<string | null>(null);
  protected history = viewChild(MovementHistory);

  ngOnInit(): void {
    if (!Number.isInteger(this.id) || this.id <= 0) {
      this.loadError.set('El producto indicado no es válido.');
      return;
    }
    this.loadProduct();
  }

  protected submit(): void {
    const p = this.producto();
    if (!p || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errors.set([]);
    this.success.set(null);

    const { tipo, cantidad, motivo } = this.form.getRawValue();

    this.movements.register(p.id, { tipo, cantidad: cantidad!, motivo: motivo.trim() }).subscribe({
      next: (mov) => {
        this.saving.set(false);
        this.success.set(`Movimiento registrado. Stock resultante: ${mov.stockResultante}.`);
        this.form.reset({ tipo, cantidad: null, motivo: '' });
        this.loadProduct(); // el backend es la fuente de verdad (stock, stock bajo)
        this.history()?.reload();
      },
      error: (err: HttpErrorResponse) => this.handleError(err),
    });
  }

  private loadProduct(): void {
    this.products.get(this.id).subscribe({
      next: (p) => this.producto.set(p),
      error: (err: HttpErrorResponse) => {
        if (err.status === 401) return; // lo maneja el interceptor
        this.loadError.set(
          err.status === 404 ? 'El producto no existe.' : 'No se pudo cargar el producto.',
        );
      },
    });
  }

  private handleError(err: HttpErrorResponse): void {
    this.saving.set(false);
    const problem: ProblemDetail | null =
      err.error && typeof err.error === 'object' ? err.error : null;

    switch (err.status) {
      case 401:
        return; // lo maneja el interceptor
      case 400:
        this.errors.set(
          problem?.errores
            ? Object.values(problem.errores)
            : [problem?.detail ?? 'Los datos enviados no son válidos.'],
        );
        return;
      case 403:
        this.errors.set(['No tienes permiso para registrar este movimiento.']);
        return;
      case 404:
        this.errors.set(['El producto ya no existe.']);
        return;
      case 409:
        // Stock insuficiente, producto inactivo o conflicto de concurrencia
        this.errors.set([problem?.detail ?? 'No se pudo registrar el movimiento. Inténtalo de nuevo.']);
        this.loadProduct(); // muestra el stock real y actualizado
        return;
      default:
        this.errors.set(['No se pudo conectar con el servidor.']);
    }
  }
}