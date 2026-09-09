import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
  private cuadrantesService = inject(CuadrantesService);
  quadrants = signal<QuadrantDetail[]>([]);
  loading = signal(true);
  error = signal(false);

  ngOnInit() {
    this.cuadrantesService.getAllQuadrants().subscribe({
      next: list => {
        this.quadrants.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  impactSummary = computed<ImpactCategory[]>(() => {
    const list = this.quadrants();
    if (!list.length) return [];
    const avg = Math.round(list.reduce((acc, q) => acc + q.progressPercentage, 0) / list.length);
    const inversion = list.reduce((acc, q) => acc + (q.montoTotal ?? 0), 0);
    const parroquias = new Set(list.map(q => q.territory).filter(Boolean)).size;
    return [
      {
        title: 'Obras Registradas',
        percentage: `${list.length}`,
        changeSubtext: 'en el catálogo municipal',
        icon: 'inventory_2'
      },
      {
        title: 'Avance Promedio',
        percentage: `${avg}%`,
        changeSubtext: 'cumplimiento físico general',
        icon: 'trending_up'
      },
      {
        title: 'Inversión Total',
        percentage: formatMoney(inversion),
        changeSubtext: 'USD en obras municipales',
        icon: 'payments'
      },
      {
        title: 'Parroquias Cubiertas',
        percentage: `${parroquias}`,
        changeSubtext: 'unidades territoriales con obras',
        icon: 'map'
      }
    ];
  });

  sectorImpacts = computed<SectorImpact[]>(() => {
    const groups = new Map<string, QuadrantDetail[]>();
    this.quadrants().forEach(q => {
      const key = q.territory || 'Distrito Metropolitano';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(q);
    });

    return Array.from(groups.entries()).map(([sector, obras]) => {
      const avg = Math.round(obras.reduce((acc, q) => acc + q.progressPercentage, 0) / obras.length);
      const top = obras.reduce((a, b) => (b.progressPercentage > a.progressPercentage ? b : a));
      return {
        sector: `Parroquia ${sector}`,
        improvementPercentage: avg,
        mainWork: top.fullDescription.length > 60 ? top.fullDescription.slice(0, 60) + '…' : top.fullDescription,
        statusText: avg >= 70 ? 'Impacto Alto' : (avg >= 40 ? 'Impacto Medio' : 'Impacto Bajo')
      };
    });
  });
}