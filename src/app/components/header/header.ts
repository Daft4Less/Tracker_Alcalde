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
  isMobileMenuOpen = false;

  navLinks = [
    { path: '/promesas', label: 'Inicio & Rendición', icon: 'grid_view' },
    { path: '/vista2', label: 'Mapa de Impacto', icon: 'analytics' },
    { path: '/agenda', label: 'Agenda Cívica', icon: 'calendar_month' },
    { path: '/nosotros', label: 'Sobre Nosotros', icon: 'groups' }
  ];

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
