import { Component, AfterViewInit, Input, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuadrantDetail } from '../../services/cuadrantes.service';

declare let L: any;

@Component({
  selector: 'app-mapa-quito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mapa-quito.html',
  styleUrl: './mapa-quito.css'
})
export class MapaQuitoComponent implements AfterViewInit, OnDestroy {
  @Input() quadrants: QuadrantDetail[] = [];
  @Input() singleQuadrant?: QuadrantDetail;
  @Input() mapHeight: string = '450px';

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  private map: any;

  constructor(private router: Router) {}

  // Coordinates mapping for Quito, Ecuador locations
  private quitoCoordinates: { [key: number]: [number, number] } = {
    1: [-0.1750, -78.4800], // Av. Amazonas / Norte
    2: [-0.2200, -78.5120], // Centro Histórico (Palacio Municipal)
    3: [-0.1400, -78.4750], // Cotocollao / Norte
    4: [-0.2000, -78.4900], // La Mariscal / Av. Orellana
    5: [-0.2500, -78.5200], // Villaflora / Sur
    6: [-0.3000, -78.5500], // Quitumbe / Sur
    7: [-0.1700, -78.4600], // Parque Metropolitano Guanguiltagua
    8: [-0.2300, -78.5150], // Río Machángara / Centro Sur
    9: [-0.1600, -78.4850]  // Carcelén / Norte
  };

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap() {
    if (typeof L === 'undefined') {
      console.warn('Leaflet (L) no se ha cargado aún.');
      return;
    }

    const container = this.mapContainer.nativeElement;
    
    // Default center: Quito, Ecuador [-0.1807, -78.4678]
    let centerLat = -0.1807;
    let centerLng = -78.4678;
    let zoomLevel = 12;

    if (this.singleQuadrant && this.quitoCoordinates[this.singleQuadrant.id]) {
      const coords = this.quitoCoordinates[this.singleQuadrant.id];
      centerLat = coords[0];
      centerLng = coords[1];
      zoomLevel = 14;
    }

    this.map = L.map(container, {
      center: [centerLat, centerLng],
      zoom: zoomLevel,
      zoomControl: true
    });

    // Standard OpenStreetMap tiles (100% libre, sin requerir API Key ni marcas de agua)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Custom Icon Generator for Leaflet Markers
    const createCustomIcon = (statusColor: string) => {
      let colorHex = '#6366f1';
      if (statusColor === 'emerald') colorHex = '#10b981';
      if (statusColor === 'cyan') colorHex = '#06b6d4';
      if (statusColor === 'amber') colorHex = '#f59e0b';
      if (statusColor === 'rose') colorHex = '#f43f5e';
      if (statusColor === 'purple') colorHex = '#8b5cf6';

      return L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="
          background-color: ${colorHex};
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 3px solid #090d16;
          box-shadow: 0 0 12px ${colorHex};
        "></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });
    };

    // If single quadrant view
    if (this.singleQuadrant) {
      const coords = this.quitoCoordinates[this.singleQuadrant.id] || [-0.1807, -78.4678];
      const marker = L.marker(coords, {
        icon: createCustomIcon(this.singleQuadrant.statusColor)
      }).addTo(this.map);

      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="color: #000; font-size: 0.95rem;">${this.singleQuadrant.title}</strong><br/>
          <span style="color: #4b5563; font-size: 0.8rem;">Quito, Ecuador - ${this.singleQuadrant.locationZone}</span><br/>
          <div style="margin-top: 6px; font-weight: bold; color: #059669;">${this.singleQuadrant.value}</div>
        </div>
      `).openPopup();
    } else {
      // Add all 9 Quito quadrant markers
      this.quadrants.forEach(q => {
        const coords = this.quitoCoordinates[q.id];
        if (coords) {
          const marker = L.marker(coords, {
            icon: createCustomIcon(q.statusColor)
          }).addTo(this.map);

          const popupContent = document.createElement('div');
          popupContent.style.fontFamily = 'sans-serif';
          popupContent.style.padding = '4px';
          popupContent.innerHTML = `
            <strong style="color: #090d16; font-size: 0.95rem; display: block; margin-bottom: 2px;">${q.title}</strong>
            <span style="color: #4b5563; font-size: 0.8rem; display: block; margin-bottom: 6px;">Quito - ${q.locationZone}</span>
            <span style="display: inline-block; background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 99px; font-size: 0.75rem; font-weight: bold;">
              ${q.badgeText} (${q.progressPercentage}%)
            </span>
            <br/>
            <button id="btn-map-go-${q.id}" style="
              margin-top: 8px;
              background: #6366f1;
              color: #ffffff;
              border: none;
              padding: 4px 10px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 0.78rem;
              font-weight: 600;
              width: 100%;
            ">Ver detalles de la obra</button>
          `;

          marker.bindPopup(popupContent);

          // Add listener to navigate to quadrant details on button click
          marker.on('popupopen', () => {
            const btn = document.getElementById(`btn-map-go-${q.id}`);
            if (btn) {
              btn.onclick = () => {
                this.router.navigate(['/cuadrante', q.id]);
              };
            }
          });
        }
      });
    }
  }
}
