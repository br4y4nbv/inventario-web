import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { LoginRequest, LoginResponse } from './auth.models';

const TOKEN_KEY = 'inventario.token';
const EXPIRES_KEY = 'inventario.expiresAt';

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);

  private _token = signal<string | null>(this.readValidToken());
  readonly isLoggedIn = computed(() => this._token() !== null);

  get token(): string | null {
    return this._token();
  }

  login(credentials: LoginRequest) {
    return this.http
      .post<LoginResponse>('/api/auth/login', credentials)
      .pipe(tap((res) => this.saveSession(res)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_KEY);
    this._token.set(null);
  }

  private saveSession(res: LoginResponse): void {
    const expiresAt = Date.now() + res.expiresIn * 1000;
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    localStorage.setItem(EXPIRES_KEY, String(expiresAt));
    this._token.set(res.accessToken);
  }

  private readValidToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiresAt = Number(localStorage.getItem(EXPIRES_KEY));
    if (!token || !expiresAt || Date.now() >= expiresAt) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(EXPIRES_KEY);
      return null;
    }
    return token;
  }
}