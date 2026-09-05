import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './vista2.html',
  styleUrl: './vista2.css'
})
export class Vista2Component {
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
    { sector: 'Corredor Poniente (Movilidad Sustentable)', improvementPercentage: 68, mainWork: 'Red de Ciclovías & Transito Calmado', statusText: 'Impacto Moderado' }
  ]);

  workTypeBars = [
    { label: 'Pavimentación y Baches', percentage: 88 },
    { label: 'Alumbrado LED', percentage: 95 },
    { label: 'Agua y Drenaje', percentage: 78 },
    { label: 'Seguridad C4', percentage: 91 },
    { label: 'Parques y Jardines', percentage: 82 }
  ];
}
