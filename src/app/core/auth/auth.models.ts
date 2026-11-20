export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number; // segundos
}

export type Role = 'USER' | 'ADMIN';

export interface JwtPayload {
  sub: string; // correo
  rol: Role;
  exp: number; // segundos desde epoch
}