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
    this.cuadrantesService.getAllQuadrants().subscribe({
      next: list => {
        this.quadrants.set(list);
        this.route.paramMap.subscribe(params => {
          const idParam = params.get('id');
          const id = idParam ? parseInt(idParam, 10) : this.quadrants()[0]?.id;
          this.loadByIndex(this.quadrants().findIndex(q => q.id === id));
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  private loadByIndex(index: number) {
    const list = this.quadrants();
    if (index >= 0 && index < list.length) {
      this.quadrant.set(list[index]);
    } else if (!this.quadrant()) {
      this.quadrant.set(undefined);
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }

  navigatePrev() {
    const idx = this.currentIndex();
    if (idx > 0) this.loadByIndex(idx - 1);
  }

  navigateNext() {
    const idx = this.currentIndex();
    if (idx >= 0 && idx < this.quadrants().length - 1) this.loadByIndex(idx + 1);
  }
}