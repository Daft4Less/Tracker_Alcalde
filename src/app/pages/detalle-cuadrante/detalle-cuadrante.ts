import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CuadrantesService, QuadrantDetail } from '../../services/cuadrantes.service';
import { MapaQuitoComponent } from '../../components/mapa-quito/mapa-quito';

@Component({
  selector: 'app-detalle-cuadrante',
  standalone: true,
  imports: [CommonModule, RouterLink, MapaQuitoComponent],
  templateUrl: './detalle-cuadrante.html',
  styleUrl: './detalle-cuadrante.css'
})
export class DetalleCuadranteComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cuadrantesService = inject(CuadrantesService);

  quadrant = signal<QuadrantDetail | undefined>(undefined);
  currentId = signal<number>(1);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      const id = idParam ? parseInt(idParam, 10) : 1;
      this.currentId.set(id);
      const data = this.cuadrantesService.getQuadrantById(id);
      this.quadrant.set(data);
    });
  }

  navigateToQuadrant(id: number) {
    if (id >= 1 && id <= 9) {
      this.router.navigate(['/cuadrante', id]);
    }
  }
}
