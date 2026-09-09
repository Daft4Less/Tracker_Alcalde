export interface QuitoLocationMarker {
  id: number;
  lat: number;
  lng: number;
  title: string;
  category: string;
  zone: string;
  status: string;
  progressPercentage: number;
}

export const QUITO_MAP_LOCATIONS: QuitoLocationMarker[] = [
  { id: 1, lat: -0.180653, lng: -78.467838, title: 'Promesa 01: Paso a Desnivel Av. Central', category: 'Infraestructura', zone: 'Distrito Central (Mariscal)', status: 'En Proceso', progressPercentage: 78 },
  { id: 2, lat: -0.220164, lng: -78.512327, title: 'Promesa 02: Digitalización 100% Trámites', category: 'Innovación', zone: 'Centro Histórico (Municipio)', status: 'Cumplida', progressPercentage: 100 },
  { id: 3, lat: -0.145000, lng: -78.480000, title: 'Promesa 03: Red de Alumbrado Público LED', category: 'Infraestructura', zone: 'Zona Norte (Cotocollao - Carcelén)', status: 'Cumplida', progressPercentage: 100 },
  { id: 4, lat: -0.260000, lng: -78.530000, title: 'Promesa 04: Ampliación de Ciclovías Urbanas', category: 'Movilidad', zone: 'Corredor Sur (Quitumbe)', status: 'Detenida', progressPercentage: 40 },
  { id: 5, lat: -0.210000, lng: -78.500000, title: 'Promesa 05: Programa Becas Escolares', category: 'Social', zone: 'Escuelas Municipales DMQ', status: 'Cumplida', progressPercentage: 100 },
  { id: 6, lat: -0.300000, lng: -78.550000, title: 'Promesa 06: Nuevo Hospital Municipal Sur', category: 'Salud', zone: 'Distrito Sur (Guamaní)', status: 'Sin Comenzar', progressPercentage: 5 },
  { id: 7, lat: -0.170000, lng: -78.440000, title: 'Promesa 07: Parque Ecológico y Pulmón Verde', category: 'Ecología', zone: 'Zona Oriente (Cumbayá / Tumbaco)', status: 'En Proceso', progressPercentage: 62 },
  { id: 8, lat: -0.240000, lng: -78.520000, title: 'Promesa 08: Saneamiento del Río Machángara', category: 'Ecología', zone: 'Cuenca Río Machángara', status: 'Incumplida', progressPercentage: 0 },
  { id: 9, lat: -0.190000, lng: -78.490000, title: 'Promesa 09: Cámaras C4 con IA en Transporte', category: 'Seguridad', zone: 'Rutas Trolebús y Ecovía', status: 'En Proceso', progressPercentage: 85 }
];
