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
  imagenAntes?: string;
  imagenDespues?: string;
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
    case 'cumplida': return 'cumplidas';
    case 'en_proceso': return 'en-proceso';
    case 'detenida': return 'detenidas';
    case 'sin_comenzar': return 'sin-comenzar';
    default: return 'incumplidas';
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
  const avance = o.porcentaje_avance ?? 0;
  const inversion = o.monto_inversion ?? null;

  return {
    id: o.id_obra ?? 0,
    title: `Compromiso ${o.id_obra}: ${o.barrio_sector || 'Obra Municipal'}`,
    category,
    promiseStatus: estado,
    statusLabel: estadoLabel(estado),
    value: estado === 'cumplidas' ? '100% Logrado' : `${avance}% Avance`,
    subtext: `${o.parroquia_nombre || 'Distrito Metropolitano'} · ${o.entidad_ejecutora || 'Municipio de Quito'}`,
    icon: EJE_ICON[category] || 'construction',
    statusColor: estadoColor(estado),
    badgeText: estadoLabel(estado),
    progressPercentage: estado === 'cumplidas' ? 100 : avance,
    fullDescription: o.descripcion || 'Obra registrada en el catálogo municipal.',
    responsibleTeam: o.entidad_ejecutora || 'Municipio de Quito',
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
        user: o.entidad_ejecutora || 'Municipio de Quito'
      }
    ],
    lat: o.latitud,
    lng: o.longitud,
    montoTotal: inversion,
    beneficiariosDirectos: o.beneficiarios_directos,
    territory: o.parroquia_nombre,
    imagenAntes: o.url_imagen_antes || undefined,
    imagenDespues: o.url_imagen_despues || undefined
  };
}

@Injectable({
  providedIn: 'root'
})
export class CuadrantesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAllQuadrants(): Observable<QuadrantDetail[]> {
    return this.http.get<{ success: boolean; data: Obra[] }>(`${this.apiUrl}/obras`).pipe(
      map(res => (res.data || []).map(obraToQuadrant))
    );
  }

  getQuadrantById(id: number): Observable<QuadrantDetail | undefined> {
    return this.http.get<{ success: boolean; data: Obra }>(`${this.apiUrl}/obras/${id}`).pipe(
      map(res => res.data ? obraToQuadrant(res.data) : undefined)
    );
  }

  getObraCount(): Observable<number> {
    return this.http.get<{ success: boolean; count: number }>(`${this.apiUrl}/obras`).pipe(
      map(res => res.count ?? 0)
    );
  }
}