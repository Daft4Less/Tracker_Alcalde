import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CuadrantesService } from '../../services/cuadrantes.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit {
  private cuadrantesService = inject(CuadrantesService);
  isMobileMenuOpen = false;
  globalProgress = signal<number | null>(null);

  navLinks = [
    { path: '/promesas', label: 'Inicio & Rendición', icon: 'grid_view' },
    { path: '/vista2', label: 'Mapa de Impacto', icon: 'analytics' },
    { path: '/agenda', label: 'El ritmo de Quito', icon: 'directions_subway' },
    { path: '/nosotros', label: 'Sobre Nosotros', icon: 'groups' }
  ];

  ngOnInit() {
    this.cuadrantesService.getAllQuadrants().subscribe({
      next: list => {
        if (list.length) {
          const avg = Math.round(list.reduce((acc, q) => acc + q.progressPercentage, 0) / list.length);
          this.globalProgress.set(avg);
        }
      }
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
