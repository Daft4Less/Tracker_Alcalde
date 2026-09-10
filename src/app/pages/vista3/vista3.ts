import { Component, OnInit, OnDestroy, signal } from '@angular/core';
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
  index: number;
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

  // Fixed Geographical S-Curve Rows
  // Row 1 (Sur: Quitumbe -> El Recreo, Left to Right, Indices 0..4)
  readonly row1Stations: StationWithIndex[] = [0, 1, 2, 3, 4].map(idx => ({ index: idx, ...this.stations[idx] }));

  // Row 2 (Centro: Univ. Central <- La Magdalena, Right to Left, Indices 9..5)
  readonly row2Stations: StationWithIndex[] = [9, 8, 7, 6, 5].map(idx => ({ index: idx, ...this.stations[idx] }));

  // Row 3 (Norte: Pradera -> El Labrador, Left to Right, Indices 10..14)
  readonly row3Stations: StationWithIndex[] = [10, 11, 12, 13, 14].map(idx => ({ index: idx, ...this.stations[idx] }));

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

  ngOnDestroy() {
    this.stopTimer();
  }

  setSentido(sentido: SentidoRecorrido) {
    if (this.sentidoActual() === sentido) return;
    this.sentidoActual.set(sentido);

    const station = this.currentStation;
    const sentidoLabel = sentido === 'sur-norte' ? 'Sur → Norte (Hacia El Labrador)' : 'Norte → Sur (Hacia Quitumbe)';

    const newLog: StationMovementLog = {
      id: `sentido-change-${Date.now()}`,
      time: this.getFormattedTime(),
      stationName: station.name,
      sentido: sentido === 'sur-norte' ? 'Sur → Norte' : 'Norte → Sur',
      unboarded: 0,
      boarded: 10,
      netChange: 10,
      activePassengersAfter: this.activePassengers()
    };

    this.lastMovement.set(newLog);
    this.logs.update(currentLogs => [newLog, ...currentLogs.slice(0, 14)]);
    this.startTimer();
  }

  setStation(index: number) {
    this.currentStationIndex.set(index);
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

  get currentStation(): MetroStation {
    return this.stations[this.currentStationIndex()];
  }

  get isAtTerminal(): boolean {
    return this.currentStationIndex() === 0 || this.currentStationIndex() === 14;
  }

  get progressNumber(): number {
    return this.sentidoActual() === 'sur-norte' ? this.currentStationIndex() + 1 : 15 - this.currentStationIndex();
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
