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

  ngOnInit() {
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
  }
}