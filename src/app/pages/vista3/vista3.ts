import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SentidoRecorrido = 'sur-norte' | 'norte-sur';

export interface StationMovementLog {
  id: string;
  time: string;
  stationName: string;
  sentido: string;
  unboarded: number; // 7 a 10 pasajeros
  boarded: number;   // 12 pasajeros
  netChange: number; // +2 a +5 (media +3.5)
  activePassengersAfter: number;
}

export interface MetroStation {
  id: number;
  name: string;
  zone: string;
  isTerminal?: boolean;
}

export interface StationWithIndex extends MetroStation {
  stepIndex: number;
  stepNumber: number;
}

@Component({
  selector: 'app-vista3',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vista3.html',
  styleUrl: './vista3.css'
})
export class Vista3Component implements OnInit, OnDestroy {
  // Official 15 Stations of Metro de Quito in geographical order (South to North)
  readonly stations: MetroStation[] = [
    { id: 1, name: 'Quitumbe', zone: 'Sur', isTerminal: true },
    { id: 2, name: 'Morán Valverde', zone: 'Sur' },
    { id: 3, name: 'Solanda', zone: 'Sur' },
    { id: 4, name: 'Cardenal de la Torre', zone: 'Sur' },
    { id: 5, name: 'El Recreo', zone: 'Sur' },
    { id: 6, name: 'La Magdalena', zone: 'Centro-Sur' },
    { id: 7, name: 'San Francisco', zone: 'Centro Histórico' },
    { id: 8, name: 'Alameda', zone: 'Centro' },
    { id: 9, name: 'Ejido', zone: 'Centro' },
    { id: 10, name: 'Universidad Central', zone: 'Centro-Norte' },
    { id: 11, name: 'Pradera', zone: 'Norte' },
    { id: 12, name: 'La Carolina', zone: 'Norte' },
    { id: 13, name: 'Iñaquito', zone: 'Norte' },
    { id: 14, name: 'Jipijapa', zone: 'Norte' },
    { id: 15, name: 'El Labrador', zone: 'Norte', isTerminal: true }
  ];

  // Active Direction Signal: 'sur-norte' (Quitumbe -> Labrador) or 'norte-sur' (Labrador -> Quitumbe)
  sentidoActual = signal<SentidoRecorrido>('sur-norte');

  // Active Route Stations (Reactive according to selected direction)
  activeRouteStations = computed<StationWithIndex[]>(() => {
    const isSurNorte = this.sentidoActual() === 'sur-norte';
    const list = isSurNorte ? this.stations : [...this.stations].reverse();
    return list.map((st, idx) => ({
      ...st,
      stepIndex: idx,
      stepNumber: idx + 1
    }));
  });

  // S-Curve Rows for Clear Visualization (Row 1: 0..4 L->R, Row 2: 9..5 R->L, Row 3: 10..14 L->R)
  row1Stations = computed<StationWithIndex[]>(() => {
    const route = this.activeRouteStations();
    return [0, 1, 2, 3, 4].map(idx => route[idx]);
  });

  row2Stations = computed<StationWithIndex[]>(() => {
    const route = this.activeRouteStations();
    return [9, 8, 7, 6, 5].map(idx => route[idx]);
  });

  row3Stations = computed<StationWithIndex[]>(() => {
    const route = this.activeRouteStations();
    return [10, 11, 12, 13, 14].map(idx => route[idx]);
  });

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

  ngOnDestroy() {
    this.stopTimer();
  }

  setSentido(sentido: SentidoRecorrido) {
    if (this.sentidoActual() === sentido) return;
    this.sentidoActual.set(sentido);
    this.currentStationIndex.set(0);

    const startStation = this.activeRouteStations()[0];
    const sentidoLabel = sentido === 'sur-norte' ? 'Sur → Norte' : 'Norte → Sur';

    const newLog: StationMovementLog = {
      id: `sentido-change-${Date.now()}`,
      time: this.getFormattedTime(),
      stationName: startStation.name,
      sentido: sentidoLabel,
      unboarded: 0,
      boarded: 15,
      netChange: 15,
      activePassengersAfter: this.activePassengers()
    };

    this.lastMovement.set(newLog);
    this.logs.update(currentLogs => [newLog, ...currentLogs.slice(0, 14)]);
    this.startTimer();
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
    const route = this.activeRouteStations();
    const nextIdx = (this.currentStationIndex() + 1) % route.length;
    this.currentStationIndex.set(nextIdx);

    const station = route[nextIdx];

    const unboarded = Math.floor(Math.random() * 4) + 7; // 7 to 10
    const boarded = 12;                                  // 12
    const netChange = boarded - unboarded;               // +2 to +5

    const updatedActive = Math.max(100, this.activePassengers() + netChange);

    this.activePassengers.set(updatedActive);
    this.totalDailyPassengers.update(v => v + boarded);
    this.co2SavedTons.update(v => Number((v + 0.015).toFixed(2)));

    const newLog: StationMovementLog = {
      id: `log-${Date.now()}`,
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

  get currentStation(): StationWithIndex {
    const route = this.activeRouteStations();
    return route[this.currentStationIndex()] || route[0];
  }

  private initInitialLogs() {
    const initialLogs: StationMovementLog[] = [];
    let tempPassengers = 1400;
    const now = new Date();
    const route = this.activeRouteStations();

    for (let i = 0; i < 5; i++) {
      const station = route[i % route.length];
      const unboarded = Math.floor(Math.random() * 4) + 7;
      const boarded = 12;
      const netChange = boarded - unboarded;
      tempPassengers += netChange;

      const logTime = new Date(now.getTime() - (5 - i) * 15000);
      initialLogs.unshift({
        id: `log-${Date.now()}-${i}`,
        time: logTime.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        stationName: station.name,
        sentido: this.sentidoActual() === 'sur-norte' ? 'Sur → Norte' : 'Norte → Sur',
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
