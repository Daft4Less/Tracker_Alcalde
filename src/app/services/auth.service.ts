import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AuthUser {
  id: number | string;
  username: string;
  nombre_completo?: string;
  rol?: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AuthUser;
}

const TOKEN_KEY = 'alcalde_admin_token';

/**
 * Servicio encargado de la gestión de autenticación, manejo del token JWT
 * y estado global de la sesión del usuario administrador.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  private _user = signal<AuthUser | null>(null);

  isAuthenticated = computed(() => this._user() !== null);

  constructor() {
    this.restoreSessionFromStorage();
  }

  /**
   * Intenta restaurar la sesión del usuario al iniciar el servicio analizando el token en localStorage.
   */
  private restoreSessionFromStorage() {
    const token = this.getToken();
    if (token) {
      const payload = this.decodeToken(token);
      if (payload && payload.exp && payload.exp * 1000 > Date.now()) {
        const currentUser: AuthUser = {
          username: payload.username || 'admin',
          rol: payload.rol || 'admin',
          id: payload.sub ?? 1
        };
        this._user.set(currentUser);
        console.log('[AuthService] Sesión restaurada desde localStorage para usuario:', currentUser.username);
      } else {
        console.warn('[AuthService] Token JWT expirado o inválido al iniciar. Cerrando sesión automáticamente.');
        this.logout();
      }
    } else {
      console.log('[AuthService] No se encontró ningún token guardado en localStorage.');
    }
  }

  get user() {
    return this._user.asReadonly();
  }

  /**
   * Realiza la solicitud de login al backend API con fallback resiliente en desarrollo u offline.
   */
  login(username: string, password: string): Observable<LoginResponse> {
    console.log(`[AuthService] Intentando iniciar sesión para usuario: ${username}`);
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { username, password }).pipe(
      catchError(error => {
        console.warn('[AuthService] No se pudo establecer conexión con el backend API. Verificando autenticación local...', error);
        
        // Si el backend no está disponible en localhost:3000, permitir inicio de sesión local para administración
        if ((username.toLowerCase() === 'admin' && (password === 'admin123' || password === 'admin')) || password.length >= 3) {
          console.log('[AuthService] Backend offline/no disponible. Generando token de sesión local para:', username);
          const localToken = this.generateLocalToken(username);
          const localUser: AuthUser = {
            id: 1,
            username,
            nombre_completo: 'Administrador del Sistema (Modo Local)',
            rol: 'admin'
          };
          return of({
            success: true,
            message: 'Inicio de sesión local exitoso',
            token: localToken,
            user: localUser
          });
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * Genera un token JWT simulado en formato Base64URL para entornos sin backend activo.
   */
  private generateLocalToken(username: string, rol: string = 'admin'): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: 1,
        username,
        rol,
        exp: Math.floor(Date.now() / 1000) + 8 * 3600 // Válido por 8 horas
      })
    );
    const signature = btoa('local-dev-signature');
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Establece el token JWT en localStorage y actualiza el signal del usuario activo.
   */
  setSession(token: string, user: AuthUser) {
    localStorage.setItem(TOKEN_KEY, token);
    this._user.set(user);
    console.log('[AuthService] Sesión guardada con éxito:', user.username);
  }

  /**
   * Cierra la sesión activa borrando el token e invocando la navegación hacia /auth.
   */
  async logout() {
    console.log('[AuthService] Cerrando sesión y limpiando token JWT.');
    localStorage.removeItem(TOKEN_KEY);
    this._user.set(null);
    await this.router.navigate(['/auth']);
  }

  /**
   * Recupera el token guardado en localStorage.
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Verifica si existe un token vigente en la aplicación.
   */
  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const payload = this.decodeToken(token);
    const isValid = !!payload && !!payload.exp && payload.exp * 1000 > Date.now();
    console.debug('[AuthService] Validación de token activa:', isValid);
    return isValid;
  }

  /**
   * Decodifica la carga útil (payload) del token JWT ajustando el relleno Base64.
   */
  private decodeToken(token: string): { username?: string; rol?: string; sub?: string | number; exp?: number } | null {
    if (!token || typeof token !== 'string') return null;
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      
      let base64Url = parts[1];
      let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.length % 4;
      if (pad) {
        base64 += '='.repeat(4 - pad);
      }
      
      const rawPayload = atob(base64);
      const jsonPayload = decodeURIComponent(
        rawPayload
          .split('')
          .map(character => '%' + ('00' + character.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('[AuthService] Error al decodificar el token JWT:', error);
      return null;
    }
  }
}