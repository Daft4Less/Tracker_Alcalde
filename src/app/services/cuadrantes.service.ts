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

function obraToQuadrant(obra: Obra): QuadrantDetail {
  const estado = normalizeEstado(obra.estado);
  const category = EJE_CATEGORY[obra.id_eje ?? 0] || 'seguridad';
  const avance = obra.porcentaje_avance ?? (estado === 'cumplidas' ? 100 : 0);
  const inversion = obra.monto_inversion ?? null;
  const ejecutora = obra.entidad_ejecutora || 'Municipio de Quito';

  return {
    id: obra.id_obra ?? 0,
    title: `Compromiso ${obra.id_obra}: ${obra.barrio_sector || 'Obra Municipal'}`,
    category,
    promiseStatus: estado,
    statusLabel: estadoLabel(estado),
    value: estado === 'cumplidas' ? '100% Logrado' : `${avance}% Avance`,
    subtext: `${obra.parroquia_nombre || 'Distrito Metropolitano'} · ${ejecutora}`,
    icon: EJE_ICON[category] || 'construction',
    statusColor: estadoColor(estado),
    statusHex: STATUS_HEX[estadoColor(estado)],
    badgeText: estadoLabel(estado),
    progressPercentage: estado === 'cumplidas' ? 100 : avance,
    fullDescription: obra.descripcion || 'Obra registrada en el catálogo municipal.',
    responsibleTeam: ejecutora,
    lastUpdated: obra.anio_ejecucion ? `Año ${obra.anio_ejecucion}` : 'Reciente',
    priority: inversion !== null && inversion >= 1000000 ? 'Alta' : (inversion !== null && inversion >= 300000 ? 'Media' : 'Normal'),
    locationZone: obra.barrio_sector || 'Quito, Ecuador',
    metrics: [
      { label: 'Inversión Total', val: formatMoney(inversion) },
      { label: 'Beneficiarios Directos', val: obra.beneficiarios_directos ? `${obra.beneficiarios_directos.toLocaleString('en-US')}` : '—' },
      { label: 'Código de Contrato', val: obra.codigo_contrato || '—' }
    ],
    timeline: [
      {
        time: obra.anio_ejecucion ? `${obra.anio_ejecucion}` : '2026',
        action: `${estadoLabel(estado)} · avance físico ${avance}%`,
        user: ejecutora
      }
    ],
    lat: obra.latitud,
    lng: obra.longitud,
    montoTotal: inversion,
    beneficiariosDirectos: obra.beneficiarios_directos,
    territory: obra.parroquia_nombre,
    imagen: obra.url_imagen || undefined
  };
}

/**
 * Servicio encargado de la gestión de cuadrantes y obras públicas.
 * Aplica estrategia de resiliencia: intenta consumir la API backend primero;
 * si falla o no está disponible, conmuta transparentemente al seed JSON local.
 */
@Injectable({
  providedIn: 'root'
})
export class CuadrantesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private static readonly SEED_URL = 'assets/data/obras.json';

  /**
   * Carga el seed embebido (assets/data/obras.json) con coordenadas y fotos reales.
   * Permite funcionamiento offline o en despliegues estáticos (GitHub Pages).
   */
  private seedObras(): Observable<Obra[]> {
    console.debug('[CuadrantesService] Cargando datos desde seed embebido local:', CuadrantesService.SEED_URL);
    return this.http.get<Obra[]>(CuadrantesService.SEED_URL);
  }

  /**
   * Obtiene la totalidad de obras/cuadrantes transformados al modelo de vista UI.
   */
  getAllQuadrants(): Observable<QuadrantDetail[]> {
    console.log('[CuadrantesService] Solicitando catálogo completo de cuadrantes...');
    return this.http.get<{ success: boolean; data: Obra[] }>(`${this.apiUrl}/obras`).pipe(
      map(response => {
        const obras = response.data || [];
        console.log(`[CuadrantesService] API respondió exitosamente con ${obras.length} obras.`);
        return obras.map(obraToQuadrant);
      }),
      catchError(error => {
        console.warn('[CuadrantesService] Error al contactar backend API. Usando fallback seed local.', error);
        return this.seedObras().pipe(
          map(list => {
            console.log(`[CuadrantesService] Fallback completado: ${list.length} obras procesadas desde seed.`);
            return list.map(obraToQuadrant);
          })
        );
      })
    );
  }

  /**
   * Obtiene el detalle de un cuadrante específico según su ID numérico.
   */
  getQuadrantById(id: number): Observable<QuadrantDetail | undefined> {
    console.log(`[CuadrantesService] Buscando cuadrante por ID: ${id}`);
    return this.http.get<{ success: boolean; data: Obra }>(`${this.apiUrl}/obras/${id}`).pipe(
      map(response => {
        if (response.data) {
          console.log(`[CuadrantesService] Obra ID ${id} encontrada en backend API.`);
          return obraToQuadrant(response.data);
        }
        console.warn(`[CuadrantesService] API no devolvió datos para Obra ID ${id}.`);
        return undefined;
      }),
      catchError(error => {
        console.warn(`[CuadrantesService] Falló consulta API para ID ${id}. Buscando en seed local...`, error);
        return this.seedObras().pipe(
          switchMap(list => {
            const foundObra = list.find(o => o.id_obra === id);
            if (foundObra) {
              console.log(`[CuadrantesService] Obra ID ${id} encontrada en seed local.`);
            } else {
              console.warn(`[CuadrantesService] Obra ID ${id} no existe ni en backend ni en seed local.`);
            }
            return of(foundObra ? obraToQuadrant(foundObra) : undefined);
          })
        );
      })
    );
  }

  /**
   * Retorna el recuento total de obras disponibles.
   */
  getObraCount(): Observable<number> {
    console.log('[CuadrantesService] Consultando cantidad total de obras...');
    return this.http.get<{ success: boolean; count: number }>(`${this.apiUrl}/obras`).pipe(
      map(response => response.count ?? 0),
      catchError(() => this.seedObras().pipe(
        map(list => list.length)
      ))
    );
  }
}