import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vista4',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vista4.html',
  styleUrl: './vista4.css'
})
export class Vista4Component {
  values = [
    { title: 'Transparencia Total', desc: 'Acceso abierto y en tiempo real a los indicadores de gestión del Distrito Metropolitano de Quito.', icon: 'visibility' },
    { title: 'Innovación Ciudadana', desc: 'Integración tecnológica para monitorear proyectos urbanos y de movilidad con agilidad.', icon: 'lightbulb' },
    { title: 'Compromiso Social', desc: 'Prioridad en la seguridad, hábitat, salud y bienestar de cada familia quiteña.', icon: 'favorite' },
    { title: 'Eficiencia Fiscal', desc: 'Rendición transparente de cada dólar invertido en obras comunitarias y presupuestos participativos.', icon: 'account_balance' }
  ];
}
