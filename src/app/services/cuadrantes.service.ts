import { Injectable } from '@angular/core';

export interface QuadrantActivity {
  time: string;
  action: string;
  user: string;
}

export type PromiseStatus = 'cumplidas' | 'en-proceso' | 'detenidas' | 'sin-comenzar' | 'incumplidas';

export interface QuadrantDetail {
  id: number;
  title: string;
  category: string;
  promiseStatus: PromiseStatus;
  statusLabel: string;
  value: string;
  subtext: string;
  icon: string;
  statusColor: 'emerald' | 'indigo' | 'cyan' | 'purple' | 'amber' | 'rose';
  badgeText: string;
  progressPercentage: number;
  fullDescription: string;
  responsibleTeam: string;
  lastUpdated: string;
  priority: 'Alta' | 'Media' | 'Crítica' | 'Normal';
  locationZone: string;
  metrics: { label: string; val: string }[];
  timeline: QuadrantActivity[];
}

@Injectable({
  providedIn: 'root'
})
export class CuadrantesService {
  private quadrantsData: QuadrantDetail[] = [
    {
      id: 1,
      title: 'Promesa 01: Paso a Desnivel Av. Central',
      category: 'infraestructura',
      promiseStatus: 'en-proceso',
      statusLabel: 'En Proceso',
      value: '78% Avance',
      subtext: 'Fase de colocación de trabes',
      icon: 'construction',
      statusColor: 'indigo',
      badgeText: 'En Proceso',
      progressPercentage: 78,
      fullDescription: 'Promesa de modernización vial para desahogar el tráfico del centro histórico mediante un paso a desnivel de 4 carriles.',
      responsibleTeam: 'Dirección de Obras Públicas',
      lastUpdated: 'Hace 10 min',
      priority: 'Alta',
      locationZone: 'Av. Central y Calle 8',
      metrics: [
        { label: 'Inversión Total', val: '$3.5M USD' },
        { label: 'Beneficiarios Directos', val: '45,000 hab' }
      ],
      timeline: [
        { time: '10:00 AM', action: 'Colocación de la 12ª columna estructural', user: 'Ing. Carlos Mendoza' }
      ]
    },
    {
      id: 2,
      title: 'Promesa 02: Digitalización 100% Trámites',
      category: 'innovacion',
      promiseStatus: 'cumplidas',
      statusLabel: 'Cumplida',
      value: '100% Logrado',
      subtext: 'Plataforma digital en línea activa',
      icon: 'task_alt',
      statusColor: 'emerald',
      badgeText: 'Cumplida',
      progressPercentage: 100,
      fullDescription: 'Promesa cumplida de ventanilla digital para la realización del 100% de los trámites municipales sin filas.',
      responsibleTeam: 'Secretaría de Innovación',
      lastUpdated: 'Hace 1 hora',
      priority: 'Normal',
      locationZone: 'Portal Web y App Móvil',
      metrics: [
        { label: 'Trámites Digitalizados', val: '42 de 42' },
        { label: 'Ahorro de Tiempo', val: '85%' }
      ],
      timeline: [
        { time: 'Ayer', action: 'Lanzamiento del módulo de pago de predial digital', user: 'Dra. María Elena Torres' }
      ]
    },
    {
      id: 3,
      title: 'Promesa 03: Red de Alumbrado Público LED',
      category: 'infraestructura',
      promiseStatus: 'cumplidas',
      statusLabel: 'Cumplida',
      value: '12,000 Lámparas',
      subtext: 'Cobertura completa en 32 colonias',
      icon: 'lightbulb',
      statusColor: 'emerald',
      badgeText: 'Cumplida',
      progressPercentage: 100,
      fullDescription: 'Sustitución total de luminarias antiguas por tecnología LED ahorradora de energía y con sensor inteligente.',
      responsibleTeam: 'Alumbrado Público',
      lastUpdated: 'Hace 2 horas',
      priority: 'Normal',
      locationZone: 'Toda la Ciudad',
      metrics: [
        { label: 'Ahorro Energético', val: '40% mensual' },
        { label: 'Colonias Iluminadas', val: '100%' }
      ],
      timeline: [
        { time: '09:00 AM', action: 'Auditoría de luminarias completada con éxito', user: 'Insp. Héctor Vela' }
      ]
    },
    {
      id: 4,
      title: 'Promesa 04: Ampliación de Ciclovías Urbanas',
      category: 'movilidad',
      promiseStatus: 'detenidas',
      statusLabel: 'Detenida',
      value: '12 km de 30 km',
      subtext: 'En espera de estudio hidráulico',
      icon: 'directions_bike',
      statusColor: 'amber',
      badgeText: 'Detenida',
      progressPercentage: 40,
      fullDescription: 'Promesa de construcción de 30 km de ciclovías segregadas. Proyecto pausado temporalmente por readecuación de colectores fluviales.',
      responsibleTeam: 'Movilidad Sustentable',
      lastUpdated: 'Hace 3 días',
      priority: 'Media',
      locationZone: 'Corredor Sur',
      metrics: [
        { label: 'Kilómetros Construidos', val: '12 km' },
        { label: 'Estudio Pendiente', val: 'Colector Pluvial' }
      ],
      timeline: [
        { time: '2 Sep', action: 'Notificación de pausa preventiva enviada a contratista', user: 'Lic. Fernando Reyes' }
      ]
    },
    {
      id: 5,
      title: 'Promesa 05: Programa Becas Escolares',
      category: 'social',
      promiseStatus: 'cumplidas',
      statusLabel: 'Cumplida',
      value: '5,000 Becados',
      subtext: 'Apoyo económico entregado',
      icon: 'school',
      statusColor: 'emerald',
      badgeText: 'Cumplida',
      progressPercentage: 100,
      fullDescription: 'Entrega de becas de excelencia y apoyo económico a estudiantes de primaria, secundaria y preparatoria.',
      responsibleTeam: 'Desarrollo Social',
      lastUpdated: 'Hace 1 día',
      priority: 'Normal',
      locationZone: 'Escuelas Públicas Municipales',
      metrics: [
        { label: 'Presupuesto Otorgado', val: '$1.2M USD' },
        { label: 'Estudiantes Beneficiados', val: '5,000' }
      ],
      timeline: [
        { time: 'Ayer', action: 'Entrega simbólica en Auditorio Municipal', user: 'Lic. Roberto Alarcón' }
      ]
    },
    {
      id: 6,
      title: 'Promesa 06: Nuevo Hospital Municipal Sur',
      category: 'salud',
      promiseStatus: 'sin-comenzar',
      statusLabel: 'Sin Comenzar',
      value: 'Fase Proyecto',
      subtext: 'Programado para Q1 2027',
      icon: 'local_hospital',
      statusColor: 'purple',
      badgeText: 'Sin Comenzar',
      progressPercentage: 5,
      fullDescription: 'Construcción de un centro médico municipal con 60 camas y atención médica gratuita de primer nivel.',
      responsibleTeam: 'Salud Municipal',
      lastUpdated: 'Hace 1 semana',
      priority: 'Alta',
      locationZone: 'Distrito Sur',
      metrics: [
        { label: 'Terreno Adquirido', val: 'Sí' },
        { label: 'Licitación Obras', val: 'Pendiente' }
      ],
      timeline: [
        { time: '28 Ago', action: 'Aprobación de la donación del predio por el Cabildo', user: 'Secretaría General' }
      ]
    },
    {
      id: 7,
      title: 'Promesa 07: Parque Ecológico y Pulmón Verde',
      category: 'ecologia',
      promiseStatus: 'en-proceso',
      statusLabel: 'En Proceso',
      value: '62% Avance',
      subtext: 'Plantación de 2,000 árboles',
      icon: 'park',
      statusColor: 'indigo',
      badgeText: 'En Proceso',
      progressPercentage: 62,
      fullDescription: 'Creación de un espacio verde de 15 hectáreas con senderos, áreas infantiles y sistema de riego con agua tratada.',
      responsibleTeam: 'Ecología y Parques',
      lastUpdated: 'Hace 4 horas',
      priority: 'Media',
      locationZone: 'Zona Oriente',
      metrics: [
        { label: 'Árboles Plantados', val: '1,240' },
        { label: 'Área Total', val: '15 Hectáreas' }
      ],
      timeline: [
        { time: '08:30 AM', action: 'Instalación de la primera isla de juegos infantiles', user: 'Cuadrilla Parques' }
      ]
    },
    {
      id: 8,
      title: 'Promesa 08: Saneamiento del Río Central',
      category: 'ecologia',
      promiseStatus: 'incumplidas',
      statusLabel: 'Incumplida',
      value: 'Cancelado',
      subtext: 'Rescisión por falta de permisos fed.',
      icon: 'water_damage',
      statusColor: 'rose',
      badgeText: 'Incumplida',
      progressPercentage: 0,
      fullDescription: 'Promesa de saneamiento integral del cauce del río. Proyecto cancelado debido a la no aprobación del permiso ambiental de la autoridad federal.',
      responsibleTeam: 'Medio Ambiente',
      lastUpdated: 'Hace 5 días',
      priority: 'Crítica',
      locationZone: 'Cuenca Río Central',
      metrics: [
        { label: 'Motivo', val: 'Rechazo Permiso Fed.' },
        { label: 'Estatus', val: 'Cancelado Definitivo' }
      ],
      timeline: [
        { time: '30 Ago', action: 'Notificación oficial de rechazo de la Conagua', user: 'Jurídico Municipal' }
      ]
    },
    {
      id: 9,
      title: 'Promesa 09: Cámaras C4 con IA en Transporte',
      category: 'seguridad',
      promiseStatus: 'en-proceso',
      statusLabel: 'En Proceso',
      value: '85% Cobertura',
      subtext: '340 de 400 camiones equipados',
      icon: 'videocam',
      statusColor: 'indigo',
      badgeText: 'En Proceso',
      progressPercentage: 85,
      fullDescription: 'Instalación de cámaras de videovigilancia y botón de pánico en camiones de transporte público conectados al C4.',
      responsibleTeam: 'Seguridad Ciudadana',
      lastUpdated: 'Hace 1 hora',
      priority: 'Alta',
      locationZone: 'Rutas de Transporte Público',
      metrics: [
        { label: 'Cámaras Instaladas', val: '1,020' },
        { label: 'Buses Equipados', val: '340 / 400' }
      ],
      timeline: [
        { time: '10:15 AM', action: 'Prueba de enlace de video en vivo de Ruta 15 OK', user: 'Sistemas C4' }
      ]
    }
  ];

  getAllQuadrants(): QuadrantDetail[] {
    return this.quadrantsData;
  }

  getQuadrantById(id: number): QuadrantDetail | undefined {
    return this.quadrantsData.find(q => q.id === id);
  }
}
