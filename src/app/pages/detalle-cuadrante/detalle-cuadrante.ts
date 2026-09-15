import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  private cuadrantesService = inject(CuadrantesService);

  quadrants = signal<QuadrantDetail[]>([]);
  quadrant = signal<QuadrantDetail | undefined>(undefined);
  loading = signal(true);
  error = signal(false);

  currentIndex = computed(() => {
    const item = this.quadrant();
    const list = this.quadrants();
    if (!item || !list.length) return -1;
    return list.findIndex(q => q.id === item.id);
  });

  hasPrev = computed(() => this.currentIndex() > 0);
  hasNext = computed(() => this.currentIndex() >= 0 && this.currentIndex() < this.quadrants().length - 1);

  ngOnInit() {
    console.log('[DetalleCuadranteComponent] Inicializando componente de detalle de obra...');
    this.cuadrantesService.getAllQuadrants().subscribe({
      next: list => {
        this.quadrants.set(list);
        this.route.paramMap.subscribe(params => {
          const idParam = params.get('id');
          const requestedId = idParam ? parseInt(idParam, 10) : this.quadrants()[0]?.id;
          console.log(`[DetalleCuadranteComponent] Parámetro de ruta recibido. ID de obra solicitado: ${requestedId}`);
          this.loadByIndex(this.quadrants().findIndex(quadrant => quadrant.id === requestedId));
        });
        this.loading.set(false);
      },
      error: err => {
        console.error('[DetalleCuadranteComponent] Error al cargar la lista de obras:', err);
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  private loadByIndex(index: number) {
    const list = this.quadrants();
    if (index >= 0 && index < list.length) {
      const selectedQuadrant = list[index];
      this.quadrant.set(selectedQuadrant);
      console.log(`[DetalleCuadranteComponent] Cargando obra índice ${index}: ${selectedQuadrant.title}`);
    } else if (!this.quadrant()) {
      console.warn(`[DetalleCuadranteComponent] Índice ${index} fuera de rango. No se encontró la obra.`);
      this.quadrant.set(undefined);
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }

  navigatePrev() {
    const currentIndex = this.currentIndex();
    if (currentIndex > 0) {
      console.log('[DetalleCuadranteComponent] Navegando a obra anterior...');
      this.loadByIndex(currentIndex - 1);
    }
  }

  navigateNext() {
    const currentIndex = this.currentIndex();
    if (currentIndex >= 0 && currentIndex < this.quadrants().length - 1) {
      console.log('[DetalleCuadranteComponent] Navegando a siguiente obra...');
      this.loadByIndex(currentIndex + 1);
    }
  }
}