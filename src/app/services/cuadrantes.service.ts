import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
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

@Injectable({
  providedIn: 'root'
})
export class CuadrantesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private static SEED_URL = 'assets/data/obras.json';

  /**
   * Carga el seed embebido (assets/data/obras.json) que incluye las
   * coordenadas y fotos reales. Permite ver el mapa y el catálogo completo
   * sin backend (GitHub Pages / un amigo sin API local).
   */
  private seedObras(): Observable<Obra[]> {
    return this.http.get<Obra[]>(CuadrantesService.SEED_URL);
  }

  getAllQuadrants(): Observable<QuadrantDetail[]> {
    return this.http.get<{ success: boolean; data: Obra[] }>(`${this.apiUrl}/obras`).pipe(
      map(res => (res.data || []).map(obraToQuadrant)),
      catchError(() => this.seedObras().pipe(
        map(list => list.map(obraToQuadrant))
      ))
    );
  }

  getQuadrantById(id: number): Observable<QuadrantDetail | undefined> {
    return this.http.get<{ success: boolean; data: Obra }>(`${this.apiUrl}/obras/${id}`).pipe(
      map(res => res.data ? obraToQuadrant(res.data) : undefined),
      catchError(() => this.seedObras().pipe(
        switchMap(list => {
          const found = list.find(o => o.id_obra === id);
          return of(found ? obraToQuadrant(found) : undefined);
        })
      ))
    );
  }

  getObraCount(): Observable<number> {
    return this.http.get<{ success: boolean; count: number }>(`${this.apiUrl}/obras`).pipe(
      map(res => res.count ?? 0),
      catchError(() => this.seedObras().pipe(
        map(list => list.length)
      ))
    );
  }
}