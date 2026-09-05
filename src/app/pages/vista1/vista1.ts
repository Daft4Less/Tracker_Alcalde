import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CuadrantesService, QuadrantDetail } from '../../services/cuadrantes.service';

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

  ngOnInit() {
    this.quadrants.set(this.cuadrantesService.getAllQuadrants());
  }

  filterByStatus(status: string) {
    this.selectedStatus.set(status);
  }
}
