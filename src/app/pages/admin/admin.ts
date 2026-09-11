import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminApiService, Eje, Parroquia, Obra } from '../../services/admin-api.service';
import { AuthService } from '../../services/auth.service';

declare let L: any;

const PARROQUIA_COORDS: { [key: number]: [number, number] } = {
  1: [-0.3, -78.48],
  2: [-0.38, -78.5],
  3: [-0.37, -78.37],
  4: [-0.32, -78.42],
  5: [-0.31, -78.43],
  6: [-0.29, -78.44],
  7: [-0.180653, -78.467838],
  8: [-0.220164, -78.512327],
  9: [-0.26, -78.53]
};

const ESTADO_COLORS: { [key: string]: string } = {
  cumplida: '#006c49',
  entregada: '#006c49',
  concluida: '#006c49',
  en_proceso: '#49607c',
  detenida: '#ffb95f',
  suspendida: '#ffb95f',
  sin_comenzar: '#8b5cf6',
  pendiente: '#8b5cf6',
  incumplida: '#ba1a1a'
};

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit, OnDestroy, AfterViewInit {
  private api = inject(AdminApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  ejes = signal<Eje[]>([]);
  parroquias = signal<Parroquia[]>([]);
  allObras = signal<Obra[]>([]);
  loading = signal(true);
  saving = signal(false);
  savingMsg = '';

  searchText = signal('');
  estadoFilter = signal('');
  parroquiaFilter = signal('');

  editingId = signal<number | null>(null);
  errorMessage = signal('');
  successMessage = signal('');
  confirmDeleteText = '';

  // ---- Formulario ----
  form = {
    id_eje: 1,
    id_parroquia: 7,
    barrio_sector: '',
    descripcion: '',
    monto_inversion: null as number | null,
    estado: 'en_proceso',
    porcentaje_avance: 0,
    entidad_ejecutora: '',
    fuente_financiamiento: '',
    estado_pago: '',
    anio_ejecucion: new Date().getFullYear(),
    latitud: -0.220164,
    longitud: -78.512327,
    url_mapa: '',
    url_imagen: ''
  };

  mapsUrlInput = '';
  mapsParserMsg = '';
  addressSearch = '';
  mapPinLabel = 'Arrastra el pin o haz clic en el mapa';

  private map: any;
  private pickerMarker: any;
  imagePreviews = { imagen: '' };

  kpis = computed(() => {
    const obras = this.allObras();
    const total = obras.length;
    const pendientes = obras.filter(o => ['sin_comenzar', 'pendiente', 'detenida'].includes(o.estado || '')).length;
    const fondos = obras.reduce((acc, o) => acc + (o.monto_inversion || 0), 0);
    const evidencias = obras.filter(o => o.url_imagen).length;
    return { total, pendientes, fondos, evidencias };
  });

  filteredObras = computed(() => {
    const query = this.searchText().toLowerCase().trim();
    const estado = this.estadoFilter();
    const parroquia = this.parroquiaFilter();
    return this.allObras().filter(o => {
      if (estado && o.estado !== estado) return false;
      if (parroquia && String(o.id_parroquia) !== parroquia) return false;
      if (query) {
        const haystack = [o.barrio_sector, o.descripcion, o.parroquia_nombre, o.entidad_ejecutora, String(o.id_obra)]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  });

  ngOnInit() {
    this.loadEjes();
    this.loadParroquias();
    this.loadObras();
  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    if (this.map) this.map.remove();
  }

  private loadEjes() {
    this.api.getEjes().subscribe(res => this.ejes.set(res.data));
  }

  private loadParroquias() {
    this.api.getParroquias().subscribe(res => this.parroquias.set(res.data));
  }

  loadObras() {
    this.loading.set(true);
    this.api.getObras().subscribe({
      next: res => {
        this.allObras.set(res.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('No se pudo cargar las obras desde el backend.');
      }
    });
  }

  formatMoney(val?: number | null): string {
    if (!val) return '$0';
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
    return `$${val.toLocaleString()}`;
  }

  estadoColor(estado?: string): string {
    return ESTADO_COLORS[estado || ''] || '#49607c';
  }

  estadoLabel(estado?: string): string {
    const map: { [key: string]: string } = {
      cumplida: 'Cumplida',
      entregada: 'Entregada',
      concluida: 'Concluida',
      en_proceso: 'En Proceso',
      detenida: 'Detenida',
      suspendida: 'Suspendida',
      sin_comenzar: 'Sin Comenzar',
      incumplida: 'Incumplida',
      pendiente: 'Pendiente'
    };
    return map[estado || ''] || estado || '—';
  }

  estadoPagoLabel(estadoPago?: string): string {
    const map: { [key: string]: string } = {
      enviado_pago: 'Enviado para el pago',
      devengado: 'Devengado',
      arrastre_2025: 'Arrastre a 2025'
    };
    return map[estadoPago || ''] || (estadoPago ? estadoPago : '—');
  }

  // ---------- MAPA ----------
  private initMap() {
    if (typeof L === 'undefined' || !this.mapContainer) return;
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [this.form.latitud, this.form.longitud],
      zoom: 12,
      zoomControl: true
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | Alcalde Tracker Quito',
      maxZoom: 19
    }).addTo(this.map);

    this.pickerMarker = L.marker([this.form.latitud, this.form.longitud], {
      draggable: true,
      title: 'Arrastra el pin para fijar la ubicación de la obra'
    }).addTo(this.map);
    this.pickerMarker.bindTooltip('Pin de ubicación de la obra', { direction: 'top' });
    this.pickerMarker.on('dragend', (e: any) => this.setLocation(e.target.getLatLng().lat, e.target.getLatLng().lng));
    this.map.on('click', (e: any) => this.setLocation(e.latlng.lat, e.latlng.lng));

    // Asegurar render correcto tras carga
    setTimeout(() => this.map?.invalidateSize(), 150);
  }

  setLocation(lat: number, lng: number, label?: string) {
    this.form.latitud = Number(lat.toFixed(6));
    this.form.longitud = Number(lng.toFixed(6));
    this.pickerMarker?.setLatLng([lat, lng]);
    this.mapPinLabel = label || `Lat ${this.form.latitud}, Lng ${this.form.longitud}`;
  }

  onParroquiaChange(event: Event) {
    const id = Number((event.target as HTMLSelectElement).value);
    const coords = PARROQUIA_COORDS[id];
    if (coords && this.map) {
      this.map.flyTo(coords, 13);
      const nombre = this.parroquias().find(p => p.id_parroquia === id)?.nombre || '';
      this.setLocation(coords[0], coords[1], nombre ? `Sector ${nombre}` : undefined);
    }
  }

  searchAddress() {
    const query = this.addressSearch.trim();
    if (!query) return;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${query}, Quito, Ecuador`)}`)
      .then(r => r.json())
      .then((results: any[]) => {
        if (results && results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lng = parseFloat(results[0].lon);
          this.map?.flyTo([lat, lng], 14);
          this.setLocation(lat, lng, results[0].display_name.split(',')[0]);
        } else {
          this.errorMessage.set('No se encontraron coordenadas para esa dirección.');
        }
      })
      .catch(() => this.errorMessage.set('Error en la búsqueda de dirección.'));
  }

  parseMapsUrl() {
    const url = this.mapsUrlInput.trim();
    if (!url) return;
    this.mapsParserMsg = 'Analizando enlace de Google Maps...';
    this.api.parseMapsUrl(url).subscribe({
      next: res => {
        if (res.success && res.lat && res.lng) {
          this.map?.flyTo([res.lat, res.lng], 15);
          this.setLocation(res.lat, res.lng);
          this.mapsParserMsg = `Coordenadas extraídas: Lat ${res.lat}, Lng ${res.lng}`;
        } else {
          this.mapsParserMsg = res.message || 'No se pudieron extraer coordenadas.';
        }
      },
      error: () => {
        this.mapsParserMsg = 'El enlace no pudo ser procesado.';
      }
    });
  }

  // ---------- EVIDENCIAS ----------
  onFileSelected(event: Event, field: 'imagen') {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('Selecciona un archivo de imagen válido.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64 = e.target.result;
      this.form.url_imagen = base64;
      this.imagePreviews.imagen = base64;
    };
    reader.readAsDataURL(file);
  }

  removeImage(field: 'imagen') {
    this.form.url_imagen = '';
    this.imagePreviews.imagen = '';
  }

  // ---------- CRUD ----------
  resetForm() {
    this.form = {
      id_eje: this.ejes()[0]?.id_eje || 1,
      id_parroquia: 7,
      barrio_sector: '',
      descripcion: '',
      monto_inversion: null,
      estado: 'en_proceso',
      porcentaje_avance: 0,
      entidad_ejecutora: '',
      fuente_financiamiento: '',
      estado_pago: '',
      anio_ejecucion: new Date().getFullYear(),
      latitud: -0.220164,
      longitud: -78.512327,
      url_mapa: '',
      url_imagen: ''
    };
    this.imagePreviews = { imagen: '' };
    this.confirmDeleteText = '';
    this.editingId.set(null);
    this.errorMessage.set('');
  }

  startEdit(obra: Obra) {
    this.editingId.set(obra.id_obra || null);
    this.form = {
      id_eje: obra.id_eje || 1,
      id_parroquia: obra.id_parroquia || 7,
      barrio_sector: obra.barrio_sector || '',
      descripcion: obra.descripcion || '',
      monto_inversion: obra.monto_inversion ?? null,
      estado: obra.estado || 'en_proceso',
      porcentaje_avance: obra.porcentaje_avance || 0,
      entidad_ejecutora: obra.entidad_ejecutora || '',
      fuente_financiamiento: obra.fuente_financiamiento || '',
      estado_pago: obra.estado_pago || '',
      anio_ejecucion: obra.anio_ejecucion || new Date().getFullYear(),
      latitud: obra.latitud ?? -0.220164,
      longitud: obra.longitud ?? -78.512327,
      url_mapa: obra.url_mapa || '',
      url_imagen: obra.url_imagen || ''
    };
    this.imagePreviews = { imagen: obra.url_imagen || '' };
    this.setLocation(this.form.latitud, this.form.longitud);
    if (this.map) this.map.flyTo([this.form.latitud, this.form.longitud], 13);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSubmit() {
    if (!this.form.barrio_sector.trim() || !this.form.descripcion.trim()) {
      this.errorMessage.set('Los campos Barrio/Sector y Descripción son obligatorios.');
      return;
    }
    void this.persist(this.form, this.editingId());
  }

  private persist(obra: Obra, editingId: number | null) {
    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    const request = editingId
      ? this.api.updateObra(editingId, obra)
      : this.api.createObra(obra);
    request.subscribe({
      next: res => {
        this.saving.set(false);
        this.successMessage.set(res.message || 'Obra guardada exitosamente.');
        const prevEdit = this.editingId();
        this.resetForm();
        this.loadObras();
        setTimeout(() => this.successMessage.set(''), 3500);
        if (prevEdit) {
          this.savingMsg = '';
        }
      },
      error: err => {
        this.saving.set(false);
        this.errorMessage.set(err.error?.message || 'Error al guardar la obra en el backend.');
      }
    });
  }

  deleteCurrentObra() {
    const id = this.editingId();
    if (!id) return;
    if (this.confirmDeleteText.trim().toUpperCase() !== 'ELIMINAR') {
      this.errorMessage.set('Para eliminar escribe exactamente la palabra "ELIMINAR".');
      return;
    }
    if (!confirm('¿Eliminar permanentemente esta obra de la base de datos?')) return;
    this.api.deleteObra(id).subscribe({
      next: () => {
        this.successMessage.set('Obra eliminada exitosamente.');
        this.resetForm();
        this.loadObras();
        setTimeout(() => this.successMessage.set(''), 3500);
      },
      error: err => {
        this.errorMessage.set(err.error?.message || 'Error al eliminar la obra.');
      }
    });
  }

  logout() {
    this.auth.logout();
  }

  exportCSV() {
    const rows = this.filteredObras();
    const header = ['ID', 'Barrio/Sector', 'Parroquia', 'Descripcion', 'Estado', 'Eje', 'Avance %', 'Pago', 'Fuente', 'Inversion USD', 'Lat', 'Lng', 'URL Maps', 'Ejecutora'];
    const escape = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const lines = rows.map(o => [
      o.id_obra, o.barrio_sector, o.parroquia_nombre, o.descripcion, o.estado,
      o.eje_nombre, o.porcentaje_avance, o.estado_pago, o.fuente_financiamiento,
      o.monto_inversion, o.latitud, o.longitud, o.url_mapa, o.entidad_ejecutora
    ].map(escape).join(','));
    const csv = [header.map(escape).join(','), ...lines].join('\r\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `obras-alcalde-tracker-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}