import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CuadrantesService, QuadrantDetail } from '../../services/cuadrantes.service';
import { MapaQuitoComponent } from '../../components/mapa-quito/mapa-quito';

export interface ImpactCategory {
  title: string;
  percentage: string;
  changeSubtext: string;
  icon: string;
  statusColor: 'emerald' | 'indigo' | 'cyan' | 'purple';
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

  ngOnInit() {
    this.quadrants.set(this.cuadrantesService.getAllQuadrants());
  }

  impactSummary = signal<ImpactCategory[]>([
    {
      title: 'Mejora en Movilidad Urbana',
      percentage: '+42%',
      changeSubtext: 'Reducción de tiempos de traslado en avenidas principales',
      icon: 'directions_car',
      statusColor: 'indigo'
    },
    {
      title: 'Prevención de Inundaciones',
      percentage: '+85%',
      changeSubtext: 'Mayor capacidad en colectores pluviales instalados',
      icon: 'water_drop',
      statusColor: 'emerald'
    },
    {
      title: 'Seguridad Nocturna',
      percentage: '+64%',
      changeSubtext: 'Percepción de seguridad por luminarias LED y C4',
      icon: 'shield',
      statusColor: 'cyan'
    },
    {
      title: 'Espacios Verdes por Hab.',
      percentage: '+38%',
      changeSubtext: 'Nuevas hectáreas de parques y áreas recreativas',
      icon: 'park',
      statusColor: 'purple'
    }
  ]);

  sectorImpacts = signal<SectorImpact[]>([
    { sector: 'Distrito Central (Vías y Pavimentación)', improvementPercentage: 88, mainWork: 'Paso a Desnivel & Repavimentación LED', statusText: 'Impacto Alto' },
    { sector: 'Zona Norte (Drenaje e Iluminación)', improvementPercentage: 74, mainWork: 'Colector Pluvial & 3,200 Luminarias', statusText: 'Impacto Alto' },
    { sector: 'Distrito Sur (Salud y Equipamiento)', improvementPercentage: 92, mainWork: 'Hospital Municipal & Módulos Médicos', statusText: 'Impacto Máximo' },
    { sector: 'Zona Oriente (Parques y Recreación)', improvementPercentage: 81, mainWork: 'Pulmón Verde & Senderos Recreativos', statusText: 'Impacto Alto' },
    { sector: 'Corredor Poniente (Movilidad Sustentable)', improvementPercentage: 68, mainWork: 'Red de Ciclovías & Tránsito Calmado', statusText: 'Impacto Moderado' }
  ]);
}
