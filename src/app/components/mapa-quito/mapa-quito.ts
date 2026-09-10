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

  private esc(value?: string): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private photosHtml(q: QuadrantDetail): string {
    const before = q.imagenAntes;
    const after = q.imagenDespues;
    const img = (src: string, label: string) => `
        <div style="flex:1; min-width:0;">
          <div style="font-size:0.68rem; color:#6b7280; font-weight:700; margin-bottom:2px;">${label}</div>
          <img src="${this.esc(src)}" alt="${label}" style="width:100%; height:64px; object-fit:cover; border-radius:6px; display:block;"/>
        </div>`;
    const inner = [
      before ? img(before, 'Antes') : '',
      after ? img(after, 'Después') : ''
    ].join('');
    if (!inner) return `<div style="margin-top:6px; font-size:0.72rem; color:#9ca3af; font-style:italic;">Sin registro fotográfico</div>`;
    return `<div style="display:flex; gap:6px; margin-top:8px;">${inner}</div>`;
  }

  private centerOf(item?: QuadrantDetail): [number, number] {
    if (item && item.lat !== undefined && item.lng !== undefined) {
      return [item.lat, item.lng];
    }
    return [-0.1807, -78.4678];
  }

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

    if (this.singleQuadrant) {
      const coords = this.centerOf(this.singleQuadrant);
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

    // Custom Icon Generator for Leaflet Markers (Quito Red Palette)
    const createCustomIcon = (statusColor: string) => {
      let colorHex = '#C8102E'; // Quito Red (Default Primary)
      if (statusColor === 'emerald' || statusColor === 'cumplidas') colorHex = '#C8102E';
      if (statusColor === 'cyan' || statusColor === 'en-proceso') colorHex = '#E53935';
      if (statusColor === 'amber' || statusColor === 'detenidas') colorHex = '#D32F2F';
      if (statusColor === 'rose' || statusColor === 'sin-comenzar') colorHex = '#9B0A20';
      if (statusColor === 'purple') colorHex = '#B71C1C';

      return L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="
          background-color: ${colorHex};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid #FFFFFF;
          box-shadow: 0 2px 8px rgba(200, 16, 46, 0.4), 0 0 10px ${colorHex};
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
    };

    // If single quadrant view
    if (this.singleQuadrant) {
      const coords = this.centerOf(this.singleQuadrant);
      const marker = L.marker(coords, {
        icon: createCustomIcon(this.singleQuadrant.statusColor)
      }).addTo(this.map);

      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; max-width: 240px;">
          <strong style="color: #000; font-size: 0.95rem;">${this.esc(this.singleQuadrant.title)}</strong><br/>
          <span style="color: #4b5563; font-size: 0.8rem;">Quito, Ecuador - ${this.esc(this.singleQuadrant.locationZone)}</span><br/>
          ${this.photosHtml(this.singleQuadrant)}
        </div>
      `).openPopup();
    } else {
      // Add markers for all obras with real coordinates
      this.quadrants.forEach(q => {
        if (q.lat === undefined || q.lng === undefined) return;
        const coords: [number, number] = [q.lat, q.lng];
        const marker = L.marker(coords, {
            icon: createCustomIcon(q.statusColor)
          }).addTo(this.map);

          const popupContent = document.createElement('div');
          popupContent.style.fontFamily = 'sans-serif';
          popupContent.style.padding = '4px';
          popupContent.style.maxWidth = '240px';
          popupContent.innerHTML = `
            <strong style="color: #090d16; font-size: 0.95rem; display: block; margin-bottom: 2px;">${this.esc(q.title)}</strong>
            <span style="color: #4b5563; font-size: 0.8rem; display: block; margin-bottom: 6px;">Quito - ${this.esc(q.locationZone)}</span>
            ${this.photosHtml(q)}
            <br/>
            <button id="btn-map-go-${q.id}" style="
              margin-top: 8px;
              background: #C8102E;
              color: #ffffff;
              border: none;
              padding: 6px 10px;
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
      });
    }
  }
}
