import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  navLinks = [
    { path: '/promesas', label: 'Promesas', icon: 'verified' },
    { path: '/vista2', label: 'Estadísticas', icon: 'analytics' },
    { path: '/agenda', label: 'Agenda', icon: 'calendar_month' },
    { path: '/nosotros', label: 'Nosotros', icon: 'groups' }
  ];
}
