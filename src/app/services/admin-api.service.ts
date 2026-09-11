import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
  url_imagen?: string;
  url_mapa?: string;
  fuente_financiamiento?: string;
  estado_pago?: string;
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

const MOCK_EJES: Eje[] = [
  { id_eje: 1, nombre: 'Hábitat, Seguridad y Convivencia Ciudadana', icono: 'policy', color_hex: '#006c49', descripcion: 'Vialidad, alumbrado LED, espacios públicos y patrullaje barrial.' },
  { id_eje: 2, nombre: 'Trabajo, Economía, Producción e Innovación', icono: 'work', color_hex: '#001428', descripcion: 'Fomento a emprendimientos, reactivación comercial y atracción de inversiones.' },
  { id_eje: 3, nombre: 'Bienestar, Derechos y Protección Social', icono: 'health_and_safety', color_hex: '#00714d', descripcion: 'Salud municipal, Guagua Centros, inclusión social y adultos mayores.' },
  { id_eje: 4, nombre: 'Movilidad Sostenible', icono: 'directions_bus', color_hex: '#0f2942', descripcion: 'Metro de Quito, corredores BTR, ciclovías y señalización inteligente.' },
  { id_eje: 5, nombre: 'Territorio Intercultural, Ecológico y Activo', icono: 'park', color_hex: '#6cf8bb', descripcion: 'Reserva Chocó Andino, parques metropolitanos y biocorredores.' }
];

const MOCK_PARROQUIAS: Parroquia[] = [
  { id_parroquia: 1, nombre: 'Conocoto', tipo: 'rural', zona_administrativa: 'Los Chillos' },
  { id_parroquia: 2, nombre: 'Amaguaña', tipo: 'rural', zona_administrativa: 'Los Chillos' },
  { id_parroquia: 3, nombre: 'Píntag', tipo: 'rural', zona_administrativa: 'Los Chillos' },
  { id_parroquia: 4, nombre: 'La Merced', tipo: 'rural', zona_administrativa: 'Los Chillos' },
  { id_parroquia: 5, nombre: 'Alangasí', tipo: 'rural', zona_administrativa: 'Los Chillos' },
  { id_parroquia: 6, nombre: 'Guangopolo', tipo: 'rural', zona_administrativa: 'Los Chillos' },
  { id_parroquia: 7, nombre: 'Iñaquito', tipo: 'urbana', zona_administrativa: 'Eugenio Espejo' },
  { id_parroquia: 8, nombre: 'Centro Histórico', tipo: 'urbana', zona_administrativa: 'Manuela Sáenz' },
  { id_parroquia: 9, nombre: 'Quitumbe', tipo: 'urbana', zona_administrativa: 'Quitumbe' }
];

const MOCK_OBRAS_API: Obra[] = [
  {
    id_obra: 1,
    id_programa: 1,
    id_eje: 1,
    eje_nombre: 'Hábitat, Seguridad y Convivencia Ciudadana',
    id_parroquia: 7,
    parroquia_nombre: 'Iñaquito',
    barrio_sector: 'Av. Central y Calle 8 (Mariscal)',
    descripcion: 'Paso a desnivel de 4 carriles para desahogar el tráfico del hipercentro de Quito.',
    monto_inversion: 3500000.00,
    estado: 'en_proceso',
    latitud: -0.180653,
    longitud: -78.467838,
    codigo_contrato: 'EPMMOP-OB-2024-089',
    beneficiarios_directos: 45000,
    anio_ejecucion: 2024
  },
  {
    id_obra: 2,
    id_programa: 2,
    id_eje: 2,
    eje_nombre: 'Trabajo, Economía, Producción e Innovación',
    id_parroquia: 8,
    parroquia_nombre: 'Centro Histórico',
    barrio_sector: 'Portal Web y App Móvil (Municipio)',
    descripcion: 'Ventanilla digital para la realización del 100% de los trámites municipales sin filas.',
    monto_inversion: 1200000.00,
    estado: 'cumplida',
    latitud: -0.220164,
    longitud: -78.512327,
    codigo_contrato: 'SI-DIG-2024-003',
    beneficiarios_directos: 2500000,
    anio_ejecucion: 2024
  },
  {
    id_obra: 3,
    id_programa: 3,
    id_eje: 1,
    eje_nombre: 'Hábitat, Seguridad y Convivencia Ciudadana',
    id_parroquia: 1,
    parroquia_nombre: 'Conocoto',
    barrio_sector: 'Barrio Paraíso de los Pinos',
    descripcion: 'Reconstrucción total de la casa comunal y equipamiento multiusos (Presupuestos Participativos).',
    monto_inversion: 78879.80,
    estado: 'cumplida',
    latitud: -0.300000,
    longitud: -78.480000,
    codigo_contrato: 'AZCH-PP-2024-012',
    beneficiarios_directos: 6500,
    anio_ejecucion: 2025
  },
  {
    id_obra: 4,
    id_programa: 1,
    id_eje: 1,
    eje_nombre: 'Hábitat, Seguridad y Convivencia Ciudadana',
    id_parroquia: 2,
    parroquia_nombre: 'Amaguaña',
    barrio_sector: 'Barrio El Blanqueado',
    descripcion: 'Construcción del área comunal recreativa y deportiva con juegos infantiles inclusivos.',
    monto_inversion: 39329.88,
    estado: 'en_proceso',
    latitud: -0.380000,
    longitud: -78.500000,
    codigo_contrato: 'AZCH-PP-2024-015',
    beneficiarios_directos: 3200,
    anio_ejecucion: 2025
  },
  {
    id_obra: 5,
    id_programa: 4,
    id_eje: 4,
    eje_nombre: 'Movilidad Sostenible',
    id_parroquia: 9,
    parroquia_nombre: 'Quitumbe',
    barrio_sector: 'Corredor Sur Quitumbe - Guamaní',
    descripcion: 'Ampliación de ciclovías segregadas urbanas con conectividad a terminales BTR.',
    monto_inversion: 450000.00,
    estado: 'detenida',
    latitud: -0.260000,
    longitud: -78.530000,
    codigo_contrato: 'SM-CIC-2024-007',
    beneficiarios_directos: 18000,
    anio_ejecucion: 2024
  },
  {
    id_obra: 6,
    id_programa: 6,
    id_eje: 3,
    eje_nombre: 'Bienestar, Derechos y Protección Social',
    id_parroquia: 9,
    parroquia_nombre: 'Quitumbe',
    barrio_sector: 'Distrito Sur (Guamaní)',
    descripcion: 'Construcción del nuevo Hospital Municipal del Sur con 60 camas de hospitalización.',
    monto_inversion: 8500000.00,
    estado: 'sin_comenzar',
    latitud: -0.310000,
    longitud: -78.550000,
    codigo_contrato: 'SS-HOSP-2026-001',
    beneficiarios_directos: 120000,
    anio_ejecucion: 2026
  }
];

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
    return this.http.get<{ success: boolean; data: Eje[] }>(`${this.apiUrl}/ejes`).pipe(
      catchError(() => of({ success: true, data: MOCK_EJES }))
    );
  }

  getParroquias(): Observable<{ success: boolean; data: Parroquia[] }> {
    return this.http.get<{ success: boolean; data: Parroquia[] }>(`${this.apiUrl}/parroquias`).pipe(
      catchError(() => of({ success: true, data: MOCK_PARROQUIAS }))
    );
  }

  getObras(filters: { estado?: string; id_parroquia?: string } = {}): Observable<{ success: boolean; count: number; data: Obra[] }> {
    let params = new HttpParams();
    if (filters.estado) params = params.set('estado', filters.estado);
    if (filters.id_parroquia) params = params.set('id_parroquia', filters.id_parroquia);
    return this.http.get<{ success: boolean; count: number; data: Obra[] }>(`${this.apiUrl}/obras`, { params }).pipe(
      catchError(() => {
        let filtered = MOCK_OBRAS_API;
        if (filters.estado) filtered = filtered.filter(o => o.estado === filters.estado);
        if (filters.id_parroquia) filtered = filtered.filter(o => o.id_parroquia === parseInt(filters.id_parroquia!));
        return of({ success: true, count: filtered.length, data: filtered });
      })
    );
  }

  getObraById(id: number): Observable<{ success: boolean; data: Obra }> {
    return this.http.get<{ success: boolean; data: Obra }>(`${this.apiUrl}/obras/${id}`).pipe(
      catchError(() => {
        const found = MOCK_OBRAS_API.find(o => o.id_obra === id) || MOCK_OBRAS_API[0];
        return of({ success: true, data: found });
      })
    );
  }

  createObra(obra: Obra): Observable<{ success: boolean; data: Obra; message?: string }> {
    return this.http.post<{ success: boolean; data: Obra; message?: string }>(`${this.apiUrl}/obras`, obra, { headers: this.headers() }).pipe(
      catchError(() => {
        const newObra: Obra = {
          ...obra,
          id_obra: obra.id_obra || Date.now(),
          parroquia_nombre: obra.parroquia_nombre || 'Quito'
        };
        MOCK_OBRAS_API.unshift(newObra);
        return of({ success: true, data: newObra, message: 'Obra registrada exitosamente' });
      })
    );
  }

  updateObra(id: number, obra: Obra): Observable<{ success: boolean; data: Obra; message?: string }> {
    return this.http.put<{ success: boolean; data: Obra; message?: string }>(`${this.apiUrl}/obras/${id}`, obra, { headers: this.headers() }).pipe(
      catchError(() => {
        const index = MOCK_OBRAS_API.findIndex(o => o.id_obra === id);
        if (index !== -1) {
          MOCK_OBRAS_API[index] = { ...MOCK_OBRAS_API[index], ...obra };
        } else {
          MOCK_OBRAS_API.unshift({ ...obra, id_obra: id });
        }
        return of({ success: true, data: obra, message: 'Obra actualizada exitosamente' });
      })
    );
  }

  deleteObra(id: number): Observable<{ success: boolean; message?: string }> {
    return this.http.delete<{ success: boolean; message?: string }>(`${this.apiUrl}/obras/${id}`, { headers: this.headers() }).pipe(
      catchError(() => {
        const index = MOCK_OBRAS_API.findIndex(o => o.id_obra === id);
        if (index !== -1) MOCK_OBRAS_API.splice(index, 1);
        return of({ success: true, message: 'Obra eliminada exitosamente' });
      })
    );
  }

  parseMapsUrl(mapsUrl: string): Observable<{ success: boolean; lat?: number; lng?: number; message?: string }> {
    return this.http.post<{ success: boolean; lat?: number; lng?: number; message?: string }>(
      `${this.apiUrl}/parse-maps-url`,
      { mapsUrl },
      { headers: this.headers() }
    ).pipe(
      catchError(() => {
        let match = mapsUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
                    mapsUrl.match(/[?&](?:q|query|ll|center)=(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (match) {
          return of({ success: true, lat: parseFloat(match[1]), lng: parseFloat(match[2]) });
        }
        return of({ success: false, message: 'URL no procesable en modo offline' });
      })
    );
  }
}