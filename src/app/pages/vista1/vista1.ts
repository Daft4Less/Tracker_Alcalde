import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CuadrantesService, QuadrantDetail, formatMoney } from '../../services/cuadrantes.service';

@Component({
  selector: 'app-vista1',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './vista1.html',
  styleUrl: './vista1.css'
})
export class Vista1Component implements OnInit {
  private cuadrantesService = inject(CuadrantesService);

  selectedStatus = signal<string>('todas');
  quadrants = signal<QuadrantDetail[]>([]);
  loading = signal(true);
  error = signal(false);

  // Grid pagination: 6 on mobile (<768px), 15 on desktop
  private getInitialCount(): number {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 6;
    }
    return 15;
  }

  private getLoadStep(): number {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 6; // 3 rows of 2 cols on mobile = 6 works
    }
    return 9; // 3 rows of 3 cols on desktop = 9 works
  }

  visibleCount = signal<number>(15);

  total = computed(() => this.quadrants().length);
  kpiCumplidas = computed(() => this.quadrants().filter(q => q.promiseStatus === 'cumplidas').length);
  kpiEnProceso = computed(() => this.quadrants().filter(q => q.promiseStatus === 'en-proceso').length);
  kpiPlanificadas = computed(() => this.quadrants().filter(q => q.promiseStatus === 'sin-comenzar').length);
  kpiPromedioAvance = computed(() => {
    const list = this.quadrants();
    if (!list.length) return 0;
    return Math.round(list.reduce((acc, q) => acc + q.progressPercentage, 0) / list.length);
  });
  kpiInversion = computed(() => {
    const total = this.quadrants().reduce((acc, q) => acc + (q.montoTotal ?? 0), 0);
    return formatMoney(total);
  });

  // Filtered status counts
  countCumplidas = computed(() => this.quadrants().filter(q => q.promiseStatus === 'cumplidas').length);
  countEnProceso = computed(() => this.quadrants().filter(q => q.promiseStatus === 'en-proceso').length);
  countDetenidas = computed(() => this.quadrants().filter(q => q.promiseStatus === 'detenidas').length);
  countSinComenzar = computed(() => this.quadrants().filter(q => q.promiseStatus === 'sin-comenzar').length);
  countIncumplidas = computed(() => this.quadrants().filter(q => q.promiseStatus === 'incumplidas').length);

  // Filtered list based on status selector
  filteredQuadrants = computed(() => {
    const status = this.selectedStatus();
    const list = this.quadrants();
    if (status === 'todas') return list;
    return list.filter(q => q.promiseStatus === status);
  });

  // Sliced list for paginated grid display
  visibleQuadrants = computed(() => {
    return this.filteredQuadrants().slice(0, this.visibleCount());
  });

  // Check if there are more items to load
  hasMore = computed(() => {
    return this.visibleCount() < this.filteredQuadrants().length;
  });

  // Calculate remaining count for button badge
  remainingCount = computed(() => {
    const totalFiltered = this.filteredQuadrants().length;
    const currentVisible = this.visibleCount();
    return Math.max(0, totalFiltered - currentVisible);
  });

  nextBatchCount = computed(() => {
    const step = this.getLoadStep();
    const rem = this.remainingCount();
    return Math.min(step, rem);
  });

  ngOnInit() {
    this.visibleCount.set(this.getInitialCount());
    this.cuadrantesService.getAllQuadrants().subscribe({
      next: list => {
        this.quadrants.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  filterByStatus(status: string) {
    this.selectedStatus.set(status);
    this.visibleCount.set(this.getInitialCount()); // Reset visible count on filter change
  }

  loadMore() {
    this.visibleCount.update(count => count + this.getLoadStep()); // Release next batch of rows
  }
}