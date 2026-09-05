import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AgendaEvent {
  id: number;
  time: string;
  date: string;
  title: string;
  location: string;
  category: 'Audiencia' | 'Inauguración' | 'Sesión Cabildo' | 'Supervisión';
  organizer: string;
  status: 'Confirmado' | 'En Curso' | 'Programado';
}

@Component({
  selector: 'app-vista3',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vista3.html',
  styleUrl: './vista3.css'
})
export class Vista3Component {
  selectedFilter = signal<string>('todos');

  events = signal<AgendaEvent[]>([
    {
      id: 1,
      time: '08:30 AM',
      date: 'Hoy, 04 Sep',
      title: 'Mesa de Trabajo sobre Seguridad y Prevención C4',
      location: 'Sala de Crisis, Palacio Municipal',
      category: 'Sesión Cabildo',
      organizer: 'Secretaría de Seguridad',
      status: 'En Curso'
    },
    {
      id: 2,
      time: '10:30 AM',
      date: 'Hoy, 04 Sep',
      title: 'Inauguración de la Nueva Biblioteca Digital Zona Norte',
      location: 'Distrito 3 - Col. Las Palmas',
      category: 'Inauguración',
      organizer: 'Dirección de Cultura y Educación',
      status: 'Confirmado'
    },
    {
      id: 3,
      time: '01:00 PM',
      date: 'Hoy, 04 Sep',
      title: 'Audiencia Pública con Comités de Vecinos',
      location: 'Auditorio Central',
      category: 'Audiencia',
      organizer: 'Atención Ciudadana',
      status: 'Programado'
    },
    {
      id: 4,
      time: '04:00 PM',
      date: 'Hoy, 04 Sep',
      title: 'Supervisión de Avance en Obra de Alcantarillado',
      location: 'Av. Las Torres km 4',
      category: 'Supervisión',
      organizer: 'Obras Públicas',
      status: 'Programado'
    },
    {
      id: 5,
      time: '09:00 AM',
      date: 'Mañana, 05 Sep',
      title: 'Sesión Ordinaria de Cabildo - Revisión de Presupuesto',
      location: 'Salón de Cabildos',
      category: 'Sesión Cabildo',
      organizer: 'Secretaría General',
      status: 'Programado'
    }
  ]);

  filterEvents(cat: string) {
    this.selectedFilter.set(cat);
  }
}
