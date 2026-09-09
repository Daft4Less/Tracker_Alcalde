import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface AuthUser {
  id: number | string;
  username: string;
  nombre_completo?: string;
  rol?: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AuthUser;
}

const TOKEN_KEY = 'alcalde_admin_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  private _user = signal<AuthUser | null>(null);

  isAuthenticated = computed(() => this._user() !== null);

  constructor() {
    const token = this.getToken();
    if (token) {
      const payload = this.decodeToken(token);
      if (payload && payload.exp && payload.exp * 1000 > Date.now()) {
        this._user.set({
          username: payload.username || '',
          rol: payload.rol || 'admin',
          id: payload.sub ?? ''
        });
      } else {
        this.logout();
      }
    }
  }

  get user() {
    return this._user.asReadonly();
  }

  login(username: string, password: string) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { username, password });
  }

  setSession(token: string, user: AuthUser) {
    localStorage.setItem(TOKEN_KEY, token);
    this._user.set(user);
  }

  async logout() {
    localStorage.removeItem(TOKEN_KEY);
    this._user.set(null);
    await this.router.navigate(['/auth']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const payload = this.decodeToken(token);
    return !!payload && !!payload.exp && payload.exp * 1000 > Date.now();
  }

  private decodeToken(token: string): { username?: string; rol?: string; sub?: string | number; exp?: number } | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }
}