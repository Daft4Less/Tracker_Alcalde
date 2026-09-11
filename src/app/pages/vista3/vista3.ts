import { Component, OnInit, AfterViewInit, OnDestroy, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

declare let L: any;

export type SentidoRecorrido = 'sur-norte' | 'norte-sur';

export interface StationMovementLog {
  id: string;
  time: string;
  stationName: string;
  sentido: string;
  unboarded: number;
  boarded: number;
  netChange: number;
  activePassengersAfter: number;
}

export interface MetroStation {
  id: number;
  name: string;
  zone: string;
  lat: number;
  lng: number;
  distFromPrevKm: number;
  isTerminal?: boolean;
}

export interface StationWithIndex extends MetroStation {
  index: number;
}

@Component({
  selector: 'app-vista3',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vista3.html',
  styleUrl: './vista3.css'
})
export class Vista3Component implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('metroMapContainer', { static: false }) metroMapContainer!: ElementRef;
  @ViewChild('sCurveTrackDesktop', { static: false }) sCurveTrackDesktop!: ElementRef<HTMLDivElement>;
  @ViewChild('sCurveTrackMobile', { static: false }) sCurveTrackMobile!: ElementRef<HTMLDivElement>;
  private map: any = null;
  private trainMarker: any = null;
  private polyline: any = null;
  private resizeListener: (() => void) | null = null;

  // Official 15 Stations of Metro de Quito in geographical order (South to North) with exact GPS coordinates
  readonly stations: MetroStation[] = [
    { id: 1, name: 'Quitumbe', zone: 'Sur', lat: -0.298285, lng: -78.552467, distFromPrevKm: 0.0, isTerminal: true },
    { id: 2, name: 'Morán Valverde', zone: 'Sur', lat: -0.286121, lng: -78.544711, distFromPrevKm: 1.6 },
    { id: 3, name: 'Solanda', zone: 'Sur', lat: -0.269150, lng: -78.537542, distFromPrevKm: 2.1 },
    { id: 4, name: 'Cardenal de la Torre', zone: 'Sur', lat: -0.257002, lng: -78.532320, distFromPrevKm: 1.5 },
    { id: 5, name: 'El Recreo', zone: 'Sur', lat: -0.245842, lng: -78.522851, distFromPrevKm: 1.7 },
    { id: 6, name: 'La Magdalena', zone: 'Centro-Sur', lat: -0.233481, lng: -78.520475, distFromPrevKm: 1.4 },
    { id: 7, name: 'San Francisco', zone: 'Centro Histórico', lat: -0.220164, lng: -78.514327, distFromPrevKm: 1.6 },
    { id: 8, name: 'Alameda', zone: 'Centro', lat: -0.210452, lng: -78.503418, distFromPrevKm: 1.5 },
    { id: 9, name: 'Ejido', zone: 'Centro', lat: -0.203671, lng: -78.497521, distFromPrevKm: 1.1 },
    { id: 10, name: 'Universidad Central', zone: 'Centro-Norte', lat: -0.198254, lng: -78.502841, distFromPrevKm: 1.2 },
    { id: 11, name: 'Pradera', zone: 'Norte', lat: -0.188412, lng: -78.486251, distFromPrevKm: 2.1 },
    { id: 12, name: 'La Carolina', zone: 'Norte', lat: -0.181242, lng: -78.482862, distFromPrevKm: 0.9 },
    { id: 13, name: 'Iñaquito', zone: 'Norte', lat: -0.174150, lng: -78.482120, distFromPrevKm: 0.8 },
    { id: 14, name: 'Jipijapa', zone: 'Norte', lat: -0.161120, lng: -78.476850, distFromPrevKm: 1.6 },
    { id: 15, name: 'El Labrador', zone: 'Norte', lat: -0.150420, lng: -78.481230, distFromPrevKm: 1.4, isTerminal: true }
  ];

  // DESKTOP: 3 rows of 5 (original S-curve layout)
  readonly desktopRow1: StationWithIndex[] = [0, 1, 2, 3, 4].map(idx => ({ index: idx, ...this.stations[idx] }));
  readonly desktopRow2: StationWithIndex[] = [9, 8, 7, 6, 5].map(idx => ({ index: idx, ...this.stations[idx] }));
  readonly desktopRow3: StationWithIndex[] = [10, 11, 12, 13, 14].map(idx => ({ index: idx, ...this.stations[idx] }));

  // MOBILE: 5 rows of 3 (compact S-curve layout)
  readonly mobileRow1: StationWithIndex[] = [0, 1, 2].map(idx => ({ index: idx, ...this.stations[idx] }));
  readonly mobileRow2: StationWithIndex[] = [5, 4, 3].map(idx => ({ index: idx, ...this.stations[idx] }));
  readonly mobileRow3: StationWithIndex[] = [6, 7, 8].map(idx => ({ index: idx, ...this.stations[idx] }));
  readonly mobileRow4: StationWithIndex[] = [11, 10, 9].map(idx => ({ index: idx, ...this.stations[idx] }));
  readonly mobileRow5: StationWithIndex[] = [12, 13, 14].map(idx => ({ index: idx, ...this.stations[idx] }));

  // Active Direction Signal: 'sur-norte' (avanzando al Norte) or 'norte-sur' (regresando al Sur)
  sentidoActual = signal<SentidoRecorrido>('sur-norte');

  // Simulator Signals
  activePassengers = signal<number>(1420);
  totalDailyPassengers = signal<number>(148930);
  co2SavedTons = signal<number>(42.85);
  currentStationIndex = signal<number>(0);

  lastMovement = signal<StationMovementLog>({
    id: 'init-1',
    time: this.getFormattedTime(),
    stationName: 'Quitumbe',
    sentido: 'Sur → Norte',
    unboarded: 8,
    boarded: 12,
    netChange: 4,
    activePassengersAfter: 1420
  });

  logs = signal<StationMovementLog[]>([]);
  private timerRef: any = null;

  ngOnInit() {
    this.initInitialLogs();
    this.startTimer();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initLeafletMap();
    }, 200);

    setTimeout(() => {
      if (this.activeView() === 'scurve') {
        this.drawSCurveConnectors();
      }
    }, 250);
  }

  ngOnDestroy() {
    this.stopTimer();
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
      this.resizeListener = null;
    }
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private drawSCurveConnectors() {
    // Desktop: 2 seams (3 rows of 5)
    this.drawConnectorsOnTrack(this.sCurveTrackDesktop?.nativeElement, [
      { fromIdx: 4,  toIdx: 5,  side: 'right', id: 'rc1' },
      { fromIdx: 9,  toIdx: 10, side: 'left',  id: 'lc1' },
    ]);
    // Mobile: 4 seams (5 rows of 3)
    this.drawConnectorsOnTrack(this.sCurveTrackMobile?.nativeElement, [
      { fromIdx: 2,  toIdx: 3,  side: 'right', id: 'rc1' },
      { fromIdx: 5,  toIdx: 6,  side: 'left',  id: 'lc1' },
      { fromIdx: 8,  toIdx: 9,  side: 'right', id: 'rc2' },
      { fromIdx: 11, toIdx: 12, side: 'left',  id: 'lc2' },
    ]);
  }

  private drawConnectorsOnTrack(
    trackEl: HTMLElement | undefined,
    seams: { fromIdx: number; toIdx: number; side: 'right' | 'left'; id: string }[]
  ) {
    if (!trackEl) return;
    const svgEl = trackEl.querySelector<SVGSVGElement>('.s-curve-connectors');
    if (!svgEl) return;

    const trackRect = trackEl.getBoundingClientRect();
    const width = trackRect.width;
    const height = trackRect.height;
    if (width === 0 || height === 0) return;
    svgEl.setAttribute('viewBox', `0 0 ${width} ${height}`);

    const stationCenter = (idx: number): { x: number; y: number } | null => {
      const el = trackEl.querySelector<HTMLElement>(`[data-station-idx="${idx}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left - trackRect.left + r.width / 2, y: r.top - trackRect.top + r.height / 2 };
    };

    for (const seam of seams) {
      const from = stationCenter(seam.fromIdx);
      const to = stationCenter(seam.toIdx);
      const pathEl = svgEl.querySelector<SVGPathElement>(`#${seam.id}`);
      if (!pathEl || !from || !to) continue;

      const r = Math.max(28, (to.y - from.y) / 2);
      const tail = Math.max(36, width * 0.07);

      if (seam.side === 'right') {
        const ex = Math.min(width - 6 - r, from.x + tail);
        pathEl.setAttribute('d',
          `M ${from.x} ${from.y} L ${ex} ${from.y} A ${r} ${r} 0 0 1 ${ex} ${to.y} L ${to.x} ${to.y}`
        );
      } else {
        const ex = Math.max(6 + r, from.x - tail);
        pathEl.setAttribute('d',
          `M ${from.x} ${from.y} L ${ex} ${from.y} A ${r} ${r} 0 0 0 ${ex} ${to.y} L ${to.x} ${to.y}`
        );
      }
    }
  }

  private initLeafletMap() {
    if (!this.metroMapContainer || typeof L === 'undefined') return;

    // Centrar mapa en el Distrito Metropolitano de Quito
    this.map = L.map(this.metroMapContainer.nativeElement, {
      center: [-0.220, -78.510],
      zoom: 12,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors • Metro de Quito DMQ',
      maxZoom: 19
    }).addTo(this.map);

    // Trazado real de la Línea 1
    const latLngs = this.stations.map(s => [s.lat, s.lng]);
    this.polyline = L.polyline(latLngs, {
      color: '#C8102E',
      weight: 5,
      opacity: 0.85,
      dashArray: '8, 8'
    }).addTo(this.map);

    // Renderizar estaciones reales
    this.stations.forEach((s) => {
      const stationIcon = L.divIcon({
        className: 'custom-station-pin',
        html: `<div style="
          background-color: #FFFFFF;
          border: 3px solid #C8102E;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(200,16,46,0.5);
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      L.marker([s.lat, s.lng], { icon: stationIcon })
        .addTo(this.map)
        .bindTooltip(`<b>Estación ${s.name}</b><br><span style="font-size:11px;color:#C8102E;">Zona ${s.zone}</span>`, {
          permanent: false,
          direction: 'top'
        });
    });

    // Icono animado del tren en vivo
    this.updateMapTrainPosition();
  }

  private updateMapTrainPosition() {
    if (!this.map || typeof L === 'undefined') return;

    const currentStation = this.currentStation;
    const coords: [number, number] = [currentStation.lat, currentStation.lng];

    const trainIcon = L.divIcon({
      className: 'live-train-pin',
      html: `<div style="
        background-color: #C8102E;
        color: #FFFFFF;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 10px rgba(200, 16, 46, 0.6), 0 0 14px #C8102E;
      ">
        <span class="material-symbols-outlined" style="font-size:18px;">subway</span>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    if (this.trainMarker) {
      this.trainMarker.setLatLng(coords);
      this.trainMarker.setPopupContent(`<b>Vagón Metro de Quito en Vivo</b><br>Estación ${currentStation.name}`);
    } else {
      this.trainMarker = L.marker(coords, { icon: trainIcon })
        .addTo(this.map)
        .bindPopup(`<b>Vagón Metro de Quito en Vivo</b><br>Estación ${currentStation.name}`);
    }

    this.map.panTo(coords, { animate: true, duration: 0.8 });
  }

  setStation(index: number) {
    this.currentStationIndex.set(index);
    this.updateMapTrainPosition();
    const station = this.stations[index];
    const unboarded = Math.floor(Math.random() * 4) + 7;
    const boarded = 12;
    const netChange = boarded - unboarded;
    const updatedActive = Math.max(100, this.activePassengers() + netChange);

    this.activePassengers.set(updatedActive);
    this.totalDailyPassengers.update(v => v + boarded);

    const newLog: StationMovementLog = {
      id: `manual-${Date.now()}`,
      time: this.getFormattedTime(),
      stationName: station.name,
      sentido: this.sentidoActual() === 'sur-norte' ? 'Sur → Norte' : 'Norte → Sur',
      unboarded,
      boarded,
      netChange,
      activePassengersAfter: updatedActive
    };

    this.lastMovement.set(newLog);
    this.logs.update(currentLogs => [newLog, ...currentLogs.slice(0, 14)]);
  }

  startTimer() {
    this.stopTimer();
    this.timerRef = setInterval(() => {
      this.simulateStationStop();
    }, 3500);
  }

  stopTimer() {
    if (this.timerRef) {
      clearInterval(this.timerRef);
      this.timerRef = null;
    }
  }

  simulateStationStop() {
    let sentido = this.sentidoActual();
    let currentIdx = this.currentStationIndex();

    // Reversible trajectory on the same physical line (Ida y Vuelta por el mismo camino)
    if (sentido === 'sur-norte') {
      if (currentIdx >= 14) {
        // Reached El Labrador (Terminal Norte): Turn around and start returning south!
        sentido = 'norte-sur';
        this.sentidoActual.set('norte-sur');
        currentIdx = 13; // Step back to Jipijapa
      } else {
        currentIdx = currentIdx + 1;
      }
    } else {
      // Sentido is 'norte-sur' (returning south)
      if (currentIdx <= 0) {
        // Reached Quitumbe (Terminal Sur): Turn around and start heading north!
        sentido = 'sur-norte';
        this.sentidoActual.set('sur-norte');
        currentIdx = 1; // Step forward to Morán Valverde
      } else {
        currentIdx = currentIdx - 1;
      }
    }

    this.currentStationIndex.set(currentIdx);
    this.updateMapTrainPosition();
    const station = this.stations[currentIdx];

    const isTerminal = station.isTerminal;
    const unboarded = isTerminal ? Math.floor(Math.random() * 5) + 12 : Math.floor(Math.random() * 4) + 7;
    const boarded = isTerminal ? Math.floor(Math.random() * 6) + 14 : 12;
    const netChange = boarded - unboarded;

    const updatedActive = Math.max(100, this.activePassengers() + netChange);

    this.activePassengers.set(updatedActive);
    this.totalDailyPassengers.update(v => v + boarded);
    this.co2SavedTons.update(v => Number((v + 0.015).toFixed(2)));

    const sentidoLabel = sentido === 'sur-norte' ? 'Sur → Norte' : 'Norte → Sur';

    const newLog: StationMovementLog = {
      id: `log-${Date.now()}`,
      time: this.getFormattedTime(),
      stationName: station.name,
      sentido: sentidoLabel,
      unboarded,
      boarded,
      netChange,
      activePassengersAfter: updatedActive
    };

    this.lastMovement.set(newLog);
    this.logs.update(currentLogs => [newLog, ...currentLogs.slice(0, 14)]);
  }

  activeView = signal<'map' | 'scurve'>('map');

  // Metro de Quito Official Operational Specs
  readonly totalJourneyTimeMin = 34; // 34 minutos trayecto completo Quitumbe - El Labrador
  readonly avgStationDistanceKm = 1.5; // 1.5 km distancia promedio entre estaciones
  readonly avgStationTravelMin = 2; // 2 minutos tiempo de viaje promedio entre estaciones consecutivas

  setViewMode(mode: 'map' | 'scurve') {
    this.activeView.set(mode);
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
        this.updateMapTrainPosition();
      } else {
        this.initLeafletMap();
      }
      if (mode === 'scurve') {
        this.drawSCurveConnectors();
      }
    }, 120);
  }

  get currentStation(): MetroStation {
    return this.stations[this.currentStationIndex()];
  }

  get isAtTerminal(): boolean {
    return this.currentStationIndex() === 0 || this.currentStationIndex() === 14;
  }

  get progressNumber(): number {
    return this.sentidoActual() === 'sur-norte' ? this.currentStationIndex() + 1 : 15 - this.currentStationIndex();
  }

  // Dwell Time & Travel Time Calculations based on official Metro de Quito schedule
  get dwellTimeSeconds(): number {
    return this.currentStation.isTerminal ? 60 : 35;
  }

  get nextStation(): MetroStation {
    const idx = this.currentStationIndex();
    const sentido = this.sentidoActual();
    if (sentido === 'sur-norte') {
      const nextIdx = idx >= 14 ? 13 : idx + 1;
      return this.stations[nextIdx];
    } else {
      const nextIdx = idx <= 0 ? 1 : idx - 1;
      return this.stations[nextIdx];
    }
  }

  get travelTimeToNextMin(): string {
    return `2 min (1.5 km)`;
  }

  // Automatic Peak / Off-Peak Schedule Detection
  get currentFrequencyMin(): number {
    const currentHour = new Date().getHours();
    // Hora Pico: 06:30 - 09:00 / 17:00 - 19:30 (Frecuencia 5 min)
    const isPeakHour = (currentHour >= 6 && currentHour < 9) || (currentHour >= 17 && currentHour < 20);
    return isPeakHour ? 5 : 8;
  }

  get currentScheduleType(): string {
    const currentHour = new Date().getHours();
    const isPeakHour = (currentHour >= 6 && currentHour < 9) || (currentHour >= 17 && currentHour < 20);
    return isPeakHour ? 'Hora Pico (Frecuencia 5 min)' : 'Hora Valle (Frecuencia 8 min)';
  }

  private initInitialLogs() {
    const initialLogs: StationMovementLog[] = [];
    let tempPassengers = 1400;
    const now = new Date();

    for (let i = 0; i < 5; i++) {
      const station = this.stations[i % this.stations.length];
      const unboarded = Math.floor(Math.random() * 4) + 7;
      const boarded = 12;
      const netChange = boarded - unboarded;
      tempPassengers += netChange;

      const logTime = new Date(now.getTime() - (5 - i) * 15000);
      initialLogs.unshift({
        id: `log-${Date.now()}-${i}`,
        time: logTime.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        stationName: station.name,
        sentido: 'Sur → Norte',
        unboarded,
        boarded,
        netChange,
        activePassengersAfter: tempPassengers
      });
    }

    this.logs.set(initialLogs);
  }

  private getFormattedTime(): string {
    return new Date().toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}
