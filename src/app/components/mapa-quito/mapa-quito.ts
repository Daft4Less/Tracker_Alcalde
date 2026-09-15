import { Component, OnInit, AfterViewInit, Input, ElementRef, ViewChild, OnDestroy, OnChanges, SimpleChanges, HostListener } from '@angular/core';
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
export class MapaQuitoComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  private _quadrants: QuadrantDetail[] = [];
  @Input() set quadrants(value: QuadrantDetail[]) {
    this._quadrants = value || [];
  }
  get quadrants(): QuadrantDetail[] {
    return this._quadrants;
  }
  @Input() singleQuadrant?: QuadrantDetail;
  @Input() mapHeight: string = '450px';
  @Input() collapsibleOnMobile: boolean = true;
  @Input() defaultMobileVisible: boolean = false;

  showMapOnMobile: boolean = false;

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  private map: any;
  private markerLayer: any;

  constructor(private router: Router) {}

  ngOnInit() {
    this.showMapOnMobile = this.defaultMobileVisible;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.map && (changes['quadrants'] || changes['singleQuadrant'])) {
      console.log('[MapaQuitoComponent] Entradas detectadas por ngOnChanges. Re-renderizando marcadores.');
      if (this.singleQuadrant) {
        this.renderSingle();
      } else {
        this.renderMarkers();
      }
    }
  }

  private escapeHtml(value?: string): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private buildPhotoGalleryHtml(quadrant: QuadrantDetail): string {
    const photoUrl = quadrant.imagen;
    if (!photoUrl) {
      return `<div style="margin-top:6px; font-size:0.72rem; color:#9ca3af; font-style:italic;">Sin registro fotográfico</div>`;
    }
    return `<img src="${this.escapeHtml(photoUrl)}" alt="Registro fotográfico de la obra" style="width:100%; height:120px; object-fit:cover; border-radius:6px; display:block; margin-top:8px;"/>`;
  }

  private calculateCoordinatesCenter(item?: QuadrantDetail): [number, number] {
    if (item && item.lat !== undefined && item.lng !== undefined) {
      return [item.lat, item.lng];
    }
    return [-0.1807, -78.4678];
  }

  private createMapPinIcon(statusColor: string, isSingleView: boolean = false): any {
    let colorHex = '#C8102E';
    if (statusColor === 'emerald' || statusColor === 'cumplidas') colorHex = '#22c55e';
    if (statusColor === 'cyan' || statusColor === 'en-proceso') colorHex = '#0ea5e9';
    if (statusColor === 'amber' || statusColor === 'detenidas') colorHex = '#f59e0b';
    if (statusColor === 'rose' || statusColor === 'sin-comenzar') colorHex = '#f43f5e';
    if (statusColor === 'purple') colorHex = '#a855f7';

    const boxShadow = isSingleView
      ? `0 2px 8px rgba(200, 16, 46, 0.4), 0 0 10px ${colorHex}`
      : '0 2px 8px rgba(0,0,0,0.3)';

    return L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="
        background-color: ${colorHex};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid #FFFFFF;
        box-shadow: ${boxShadow};
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  }

  ngAfterViewInit() {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    if (!isMobile || !this.collapsibleOnMobile || this.showMapOnMobile) {
      this.initMap();
    }
  }

  toggleMobileMap() {
    this.showMapOnMobile = !this.showMapOnMobile;
    if (this.showMapOnMobile) {
      setTimeout(() => {
        if (!this.map) {
          this.initMap();
        } else {
          this.map.invalidateSize();
          if (this.singleQuadrant) {
            this.renderSingle();
          } else {
            this.renderMarkers();
          }
        }
      }, 150);
    }
  }

  @HostListener('window:resize')
  onResize() {
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 640;
    if (isDesktop && !this.map) {
      this.initMap();
    } else if (this.map) {
      this.map.invalidateSize();
    }
  }

  ngOnDestroy() {
    if (this.map) {
      console.log('[MapaQuitoComponent] Destruyendo instancia de mapa Leaflet.');
      this.map.remove();
    }
  }

  private initMap() {
    if (typeof L === 'undefined') {
      console.warn('[MapaQuitoComponent] Leaflet (L) no se ha cargado en el contexto global.');
      return;
    }

    const container = this.mapContainer.nativeElement;

    // Default center: Sangolquí, Valle de los Chillos [-0.3340, -78.4510]
    let centerLat = -0.3340;
    let centerLng = -78.4510;
    let zoomLevel = 12;

    if (this.singleQuadrant) {
      const coords = this.calculateCoordinatesCenter(this.singleQuadrant);
      centerLat = coords[0];
      centerLng = coords[1];
      zoomLevel = 14;
    }

    console.log(`[MapaQuitoComponent] Inicializando mapa en lat: ${centerLat}, lng: ${centerLng}, zoom: ${zoomLevel}`);

    this.map = L.map(container, {
      center: [centerLat, centerLng],
      zoom: zoomLevel,
      zoomControl: true,
      scrollWheelZoom: false
    });

    this.markerLayer = L.layerGroup().addTo(this.map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);

    if (this.singleQuadrant) {
      this.renderSingle();
      return;
    }

    this.renderMarkers();
  }

  private renderSingle() {
    if (!this.map || !this.markerLayer) return;
    const quadrant = this.singleQuadrant;
    if (!quadrant) return;

    console.log('[MapaQuitoComponent] Renderizando vista de obra individual:', quadrant.title);
    this.markerLayer.clearLayers();

    const coords = this.calculateCoordinatesCenter(quadrant);
    const marker = L.marker(coords, {
      icon: this.createMapPinIcon(quadrant.statusColor, true)
    }).addTo(this.markerLayer);

    marker.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px; max-width: 240px;">
        <strong style="color: #000; font-size: 0.95rem;">${this.escapeHtml(quadrant.title)}</strong><br/>
        <span style="color: #4b5563; font-size: 0.8rem;">Quito, Ecuador - ${this.escapeHtml(quadrant.locationZone)}</span><br/>
        ${this.buildPhotoGalleryHtml(quadrant)}
      </div>
    `).openPopup();

    this.map.setView(coords, Math.max(14, this.map.getZoom()));
  }

  private renderMarkers() {
    if (!this.map || !this.markerLayer) return;

    this.markerLayer.clearLayers();
    console.log(`[MapaQuitoComponent] Renderizando ${this._quadrants.length} marcadores de cuadrantes en el mapa.`);

    const bounds: [number, number][] = [];
    this._quadrants.forEach(quadrant => {
      if (quadrant.lat === undefined || quadrant.lng === undefined) return;
      bounds.push([quadrant.lat, quadrant.lng]);
      const coords: [number, number] = [quadrant.lat, quadrant.lng];
      const marker = L.marker(coords, {
        icon: this.createMapPinIcon(quadrant.statusColor, false)
      }).addTo(this.markerLayer);

      const popupContent = document.createElement('div');
      popupContent.style.fontFamily = 'sans-serif';
      popupContent.style.padding = '4px';
      popupContent.style.maxWidth = '240px';
      popupContent.innerHTML = `
        <strong style="color: #090d16; font-size: 0.95rem; display: block; margin-bottom: 2px;">${this.escapeHtml(quadrant.title)}</strong>
        <span style="color: #4b5563; font-size: 0.8rem; display: block; margin-bottom: 6px;">Quito - ${this.escapeHtml(quadrant.locationZone)}</span>
        ${this.buildPhotoGalleryHtml(quadrant)}
        <br/>
        <button id="btn-map-go-${quadrant.id}" style="
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

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-map-go-${quadrant.id}`);
        if (btn) {
          btn.onclick = () => {
            console.log(`[MapaQuitoComponent] Navegando a detalle de obra ID ${quadrant.id}`);
            this.router.navigate(['/cuadrante', quadrant.id]);
          };
        }
      });
    });

    if (bounds.length) {
      let minTotalDist = Infinity;
      let centralPoint: [number, number] = bounds[0];

      bounds.forEach(([lat1, lng1]) => {
        let sumDist = 0;
        bounds.forEach(([lat2, lng2]) => {
          const dLat = lat1 - lat2;
          const dLng = lng1 - lng2;
          sumDist += Math.sqrt(dLat * dLat + dLng * dLng);
        });
        if (sumDist < minTotalDist) {
          minTotalDist = sumDist;
          centralPoint = [lat1, lng1];
        }
      });

      const latLngBounds = L.latLngBounds(bounds);
      this.map.fitBounds(latLngBounds, { padding: [40, 40], maxZoom: 14 });
      this.map.panTo(centralPoint);
    }
  }
}
