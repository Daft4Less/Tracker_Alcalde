import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TeamMember {
  name: string;
  role: string;
  photoIcon: string;
  bio: string;
}

@Component({
  selector: 'app-vista4',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vista4.html',
  styleUrl: './vista4.css'
})
export class Vista4Component {
  values = [
    { title: 'Transparencia Total', desc: 'Acceso abierto y en tiempo real a los indicadores de gestión municipal.', icon: 'visibility' },
    { title: 'Innovación Ciudadana', desc: 'Integración tecnológica para resolver problemas urbanos con agilidad.', icon: 'lightbulb' },
    { title: 'Compromiso Social', desc: 'Prioridad máxima a la seguridad, salud y bienestar de cada familia.', icon: 'favorite' },
    { title: 'Eficiencia Fiscal', desc: 'Rendición transparente de cada peso invertido en obras comunitarias.', icon: 'balance' }
  ];

  team: TeamMember[] = [
    {
      name: 'Lic. Roberto Alarcón',
      role: 'Alcalde Municipal',
      photoIcon: 'person_filled',
      bio: 'Liderando la transformación digital y el desarrollo sostenible de la ciudad.'
    },
    {
      name: 'Dra. María Elena Torres',
      role: 'Secretaria de Innovación & Datos',
      photoIcon: 'person_apron',
      bio: 'Coordinando las plataformas de gobierno abierto y el sistema AlcaldeTracker.'
    },
    {
      name: 'Ing. Carlos Mendoza',
      role: 'Director de Infraestructura',
      photoIcon: 'engineering',
      bio: 'Supervisando los 24 frentes de obra pública y modernización vial.'
    }
  ];
}
