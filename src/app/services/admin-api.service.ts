import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Obra {
  id_obra?: number;
  id_programa?: number;
  id_eje?: number;
  eje_nombre?: string;
  id_parroquia?: number;
  parroquia_nombre?: string;
  barrio_sector: string;
  descripcion: string;
  monto_inversion?: number | null;
  estado?: string;
  porcentaje_avance?: number;
  latitud?: number;
  longitud?: number;
  entidad_ejecutora?: string;
  url_imagen_antes?: string;
  url_imagen_despues?: string;
  codigo_contrato?: string;
  beneficiarios_directos?: number;
  anio_ejecucion?: number;
}

export interface Eje {
  id_eje: number;
  nombre: string;
  descripcion?: string;
  icono?: string;
  color_hex?: string;
}

export interface Parroquia {
  id_parroquia: number;
  nombre: string;
  tipo?: string;
  zona_administrativa?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = environment.apiUrl;

  private headers(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getEjes(): Observable<{ success: boolean; data: Eje[] }> {
    return this.http.get<{ success: boolean; data: Eje[] }>(`${this.apiUrl}/ejes`);
  }

  getParroquias(): Observable<{ success: boolean; data: Parroquia[] }> {
    return this.http.get<{ success: boolean; data: Parroquia[] }>(`${this.apiUrl}/parroquias`);
  }

  getObras(filters: { estado?: string; id_parroquia?: string } = {}): Observable<{ success: boolean; count: number; data: Obra[] }> {
    let params = new HttpParams();
    if (filters.estado) params = params.set('estado', filters.estado);
    if (filters.id_parroquia) params = params.set('id_parroquia', filters.id_parroquia);
    return this.http.get<{ success: boolean; count: number; data: Obra[] }>(`${this.apiUrl}/obras`, { params });
  }

  getObraById(id: number): Observable<{ success: boolean; data: Obra }> {
    return this.http.get<{ success: boolean; data: Obra }>(`${this.apiUrl}/obras/${id}`);
  }

  createObra(obra: Obra): Observable<{ success: boolean; data: Obra; message?: string }> {
    return this.http.post<{ success: boolean; data: Obra; message?: string }>(`${this.apiUrl}/obras`, obra, { headers: this.headers() });
  }

  updateObra(id: number, obra: Obra): Observable<{ success: boolean; data: Obra; message?: string }> {
    return this.http.put<{ success: boolean; data: Obra; message?: string }>(`${this.apiUrl}/obras/${id}`, obra, { headers: this.headers() });
  }

  deleteObra(id: number): Observable<{ success: boolean; message?: string }> {
    return this.http.delete<{ success: boolean; message?: string }>(`${this.apiUrl}/obras/${id}`, { headers: this.headers() });
  }

  parseMapsUrl(mapsUrl: string): Observable<{ success: boolean; lat?: number; lng?: number; message?: string }> {
    return this.http.post<{ success: boolean; lat?: number; lng?: number; message?: string }>(
      `${this.apiUrl}/parse-maps-url`,
      { mapsUrl },
      { headers: this.headers() }
    );
  }
}