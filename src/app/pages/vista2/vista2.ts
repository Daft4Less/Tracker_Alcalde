import { Component, OnInit, computed, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CuadrantesService, QuadrantDetail, formatMoney } from '../../services/cuadrantes.service';
import { MapaQuitoComponent } from '../../components/mapa-quito/mapa-quito';

export interface ImpactCategory {
  title: string;
  percentage: string;
  changeSubtext: string;
  icon: string;
}

export interface SectorImpact {
  sector: string;
  improvementPercentage: number;
  mainWork: string;
  statusText: string;
}

@Component({
  selector: 'app-vista2',
  standalone: true,
  imports: [CommonModule, MapaQuitoComponent],
  templateUrl: './vista2.html',
  styleUrl: './vista2.css'
})
export class Vista2Component implements OnInit {
  @ViewChild('metricsSection', { static: false }) metricsSection?: ElementRef;
  private cuadrantesService = inject(CuadrantesService);
  quadrants = signal<QuadrantDetail[]>([]);
  loading = signal(true);
  error = signal(false);

  scrollToMetrics() {
    if (this.metricsSection) {
      this.metricsSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  ngOnInit() {
    console.log('[Vista2Component] Cargando obras para resumen de impacto e indicadores territoriales...');
    this.cuadrantesService.getAllQuadrants().subscribe({
      next: list => {
        console.log(`[Vista2Component] Carga exitosa: ${list.length} obras procesadas para impacto.`);
        this.quadrants.set(list);
        this.loading.set(false);
      },
      error: err => {
        console.error('[Vista2Component] Error al obtener datos para vista de impacto:', err);
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  impactSummary = computed<ImpactCategory[]>(() => {
    const list = this.quadrants();
    if (!list.length) return [];
    const avgPercentage = Math.round(list.reduce((acc, quadrant) => acc + quadrant.progressPercentage, 0) / list.length);
    const totalInversion = list.reduce((acc, quadrant) => acc + (quadrant.montoTotal ?? 0), 0);
    const totalParroquias = new Set(list.map(quadrant => quadrant.territory).filter(Boolean)).size;

    console.debug(`[Vista2Component] Métricas calculadas: Avance prom: ${avgPercentage}%, Inversión: $${totalInversion}, Parroquias: ${totalParroquias}`);

    return [
      {
        title: 'Obras Registradas',
        percentage: `${list.length}`,
        changeSubtext: 'en el catálogo municipal',
        icon: 'inventory_2'
      },
      {
        title: 'Avance Promedio',
        percentage: `${avgPercentage}%`,
        changeSubtext: 'cumplimiento físico general',
        icon: 'trending_up'
      },
      {
        title: 'Inversión Total',
        percentage: formatMoney(totalInversion),
        changeSubtext: 'USD en obras municipales',
        icon: 'payments'
      },
      {
        title: 'Parroquias Cubiertas',
        percentage: `${totalParroquias}`,
        changeSubtext: 'unidades territoriales con obras',
        icon: 'map'
      }
    ];
  });

  sectorImpacts = computed<SectorImpact[]>(() => {
    const sectorGroups = new Map<string, QuadrantDetail[]>();
    this.quadrants().forEach(quadrant => {
      const sectorKey = quadrant.territory || 'Distrito Metropolitano';
      if (!sectorGroups.has(sectorKey)) sectorGroups.set(sectorKey, []);
      sectorGroups.get(sectorKey)!.push(quadrant);
    });

    return Array.from(sectorGroups.entries()).map(([sector, obras]) => {
      const avgPercentage = Math.round(obras.reduce((acc, quadrant) => acc + quadrant.progressPercentage, 0) / obras.length);
      const topObra = obras.reduce((firstObra, secondObra) => (secondObra.progressPercentage > firstObra.progressPercentage ? secondObra : firstObra));
      return {
        sector: `Parroquia ${sector}`,
        improvementPercentage: avgPercentage,
        mainWork: topObra.fullDescription.length > 60 ? topObra.fullDescription.slice(0, 60) + '…' : topObra.fullDescription,
        statusText: avgPercentage >= 70 ? 'Impacto Alto' : (avgPercentage >= 40 ? 'Impacto Medio' : 'Impacto Bajo')
      };
    });
  });
}