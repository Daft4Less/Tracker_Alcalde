import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Obra } from './admin-api.service';

export interface QuadrantActivity {
  time: string;
  action: string;
  user: string;
}

export type PromiseStatus = 'cumplidas' | 'en-proceso' | 'detenidas' | 'sin-comenzar' | 'incumplidas';

export interface QuadrantDetail {
  id: number;
  title: string;
  category: string;
  promiseStatus: PromiseStatus;
  statusLabel: string;
  value: string;
  subtext: string;
  icon: string;
  statusColor: 'emerald' | 'indigo' | 'cyan' | 'purple' | 'amber' | 'rose';
  statusHex: string;
  badgeText: string;
  progressPercentage: number;
  fullDescription: string;
  responsibleTeam: string;
  lastUpdated: string;
  priority: 'Alta' | 'Media' | 'Crítica' | 'Normal';
  locationZone: string;
  metrics: { label: string; val: string }[];
  timeline: QuadrantActivity[];
  lat?: number;
  lng?: number;
  montoTotal?: number | null;
  beneficiariosDirectos?: number;
  territory?: string;
  imagen?: string;
}

const EJE_CATEGORY: Record<number, string> = {
  1: 'seguridad',
  2: 'economia',
  3: 'social',
  4: 'movilidad',
  5: 'ecologia'
};

const EJE_ICON: Record<string, string> = {
  seguridad: 'videocam',
  economia: 'work',
  social: 'health_and_safety',
  movilidad: 'directions_bus',
  ecologia: 'park'
};

export function formatMoney(val?: number | null): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return '$' + val.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function normalizeEstado(estado?: string): PromiseStatus {
  switch ((estado || '').toLowerCase()) {
    case 'cumplida':
    case 'entregada':
    case 'concluida':
      return 'cumplidas';
    case 'en_proceso':
      return 'en-proceso';
    case 'detenida':
    case 'suspendida':
      return 'detenidas';
    case 'sin_comenzar':
    case 'pendiente':
      return 'sin-comenzar';
    default:
      return 'incumplidas';
  }
}

function estadoLabel(estado: PromiseStatus): string {
  switch (estado) {
    case 'cumplidas': return 'Cumplida';
    case 'en-proceso': return 'En Proceso';
    case 'detenidas': return 'Detenida';
    case 'sin-comenzar': return 'Sin Comenzar';
    default: return 'Incumplida';
  }
}

const STATUS_HEX: Record<QuadrantDetail['statusColor'], string> = {
  emerald: '#10b981',
  indigo: '#4f46e5',
  cyan: '#06b6d4',
  amber: '#f59e0b',
  purple: '#8b5cf6',
  rose: '#e11d48'
};

function estadoColor(estado: PromiseStatus): QuadrantDetail['statusColor'] {
  switch (estado) {
    case 'cumplidas': return 'emerald';
    case 'en-proceso': return 'indigo';
    case 'detenidas': return 'amber';
    case 'sin-comenzar': return 'purple';
    default: return 'rose';
  }
}

function obraToQuadrant(o: Obra): QuadrantDetail {
  const estado = normalizeEstado(o.estado);
  const category = EJE_CATEGORY[o.id_eje ?? 0] || 'seguridad';
  const avance = o.porcentaje_avance ?? (estado === 'cumplidas' ? 100 : 0);
  const inversion = o.monto_inversion ?? null;
  const ejecutora = o.entidad_ejecutora || 'Municipio de Quito';

  return {
    id: o.id_obra ?? 0,
    title: `Compromiso ${o.id_obra}: ${o.barrio_sector || 'Obra Municipal'}`,
    category,
    promiseStatus: estado,
    statusLabel: estadoLabel(estado),
    value: estado === 'cumplidas' ? '100% Logrado' : `${avance}% Avance`,
    subtext: `${o.parroquia_nombre || 'Distrito Metropolitano'} · ${ejecutora}`,
    icon: EJE_ICON[category] || 'construction',
    statusColor: estadoColor(estado),
    statusHex: STATUS_HEX[estadoColor(estado)],
    badgeText: estadoLabel(estado),
    progressPercentage: estado === 'cumplidas' ? 100 : avance,
    fullDescription: o.descripcion || 'Obra registrada en el catálogo municipal.',
    responsibleTeam: ejecutora,
    lastUpdated: o.anio_ejecucion ? `Año ${o.anio_ejecucion}` : 'Reciente',
    priority: inversion !== null && inversion >= 1000000 ? 'Alta' : (inversion !== null && inversion >= 300000 ? 'Media' : 'Normal'),
    locationZone: o.barrio_sector || 'Quito, Ecuador',
    metrics: [
      { label: 'Inversión Total', val: formatMoney(inversion) },
      { label: 'Beneficiarios Directos', val: o.beneficiarios_directos ? `${o.beneficiarios_directos.toLocaleString('en-US')}` : '—' },
      { label: 'Código de Contrato', val: o.codigo_contrato || '—' }
    ],
    timeline: [
      {
        time: o.anio_ejecucion ? `${o.anio_ejecucion}` : '2026',
        action: `${estadoLabel(estado)} · avance físico ${avance}%`,
        user: ejecutora
      }
    ],
    lat: o.latitud,
    lng: o.longitud,
    montoTotal: inversion,
    beneficiariosDirectos: o.beneficiarios_directos,
    territory: o.parroquia_nombre,
    imagen: o.url_imagen || undefined
  };
}

const MOCK_OBRAS: Obra[] = [
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

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CuadrantesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAllQuadrants(): Observable<QuadrantDetail[]> {
    return this.http.get<{ success: boolean; data: Obra[] }>(`${this.apiUrl}/obras`).pipe(
      map(res => (res.data || []).map(obraToQuadrant)),
      catchError(() => of(MOCK_OBRAS.map(obraToQuadrant)))
    );
  }

  getQuadrantById(id: number): Observable<QuadrantDetail | undefined> {
    return this.http.get<{ success: boolean; data: Obra }>(`${this.apiUrl}/obras/${id}`).pipe(
      map(res => res.data ? obraToQuadrant(res.data) : undefined),
      catchError(() => {
        const found = MOCK_OBRAS.find(o => o.id_obra === id);
        return of(found ? obraToQuadrant(found) : undefined);
      })
    );
  }

  getObraCount(): Observable<number> {
    return this.http.get<{ success: boolean; count: number }>(`${this.apiUrl}/obras`).pipe(
      map(res => res.count ?? 0),
      catchError(() => of(MOCK_OBRAS.length))
    );
  }
}