# Tracker Alcalde Quito - Observatorio Civico de Transparencia

Plataforma web de monitoreo y auditoria ciudadana para el seguimiento en tiempo real de los compromisos municipales y obras publicas en el Distrito Metropolitano de Quito (2024-2028).

## Requisitos Previos

- Node.js version 18.x o superior
- npm version 9.x o superior
- Angular CLI version 18.x / 20.x

## Instalacion y Despliegue Local

1. Clonar el repositorio:
   git clone https://github.com/Daft4Less/Tracker_Alcalde.git

2. Acceder al directorio del proyecto:
   cd Tracker_Alcalde

3. Instalar las dependencias:
   npm install

4. Levantar el servidor de desarrollo local:
   npm start
   o bien:
   npx ng serve --port 4200

5. Abrir el navegador e ingresar a:
   http://localhost:4200/

## Compilacion para Produccion y GitHub Pages

Para generar los archivos estaticos optimizados para hosting o despliegue en GitHub Pages:

1. Ejecutar el comando de construccion:
   npx ng build --base-href ./ --output-path docs

2. Copiar los archivos resultantes al directorio raiz para GitHub Pages si aplica:
   xcopy /E /Y docs\browser\* docs\

## Descripcion de las Vistas del Proyecto

### 1. Vista 1: Promesas y Auditoria Civica (Inicio)
- Banner Hero con declaracion institucional y resumen ejecutivo de gestion.
- Bento Grid con scorecards de metricas clave (obras cumplidas, en ejecucion, planificadas e inversion ejecutada en USD).
- Catalogo dinamico de obras y compromisos con barra de filtros interactivas por estado (Todas, Cumplidas, En Proceso, Detenidas, Sin Comenzar, Incumplidas).
- Tarjetas informativas adaptables a dispositivos moviles y escritorio con indicador visual de estado y porcentaje de avance fisico.

### 2. Vista 2: Mapa General de Impacto Territorial
- Mapa interactivo completo del Distrito Metropolitano de Quito (Norte, Centro, Sur y Valles) con marcadores de geolocalizacion satelital por obra.
- Tarjetas de resumen de impacto en movilidad urbana, prevencion de inundaciones, seguridad y espacios verdes.
- Desglose sectorial del porcentaje de mejora por distrito con barras de progreso.

### 3. Vista 3: Agenda Civica y Rendicion de Cuentas
- Cronograma publico de audiencias civicas, inspecciones tecnicas de campo y publicaciones de informes de veeduria.
- Registro cronologico de eventos con fechas, ubicaciones y estado de convocatoria.

### 4. Vista 4: Sobre Nosotros
- Seccion institucional que detalla la mision, vision y principios rectoras de la auditoria cívica abierta.
- Presentacion del equipo directivo y veedores ciudadanos.

### 5. Ficha de Compromiso (Detalle por Obra)
- Vista detallada accesible desde cada tarjeta de compromiso (/cuadrante/:id).
- Informacion tecnica detallada: presupuesto asignado, contratista o entidad ejecutora, beneficiarios directos, cronograma de actividades y mapa focalizado.

## Librerias y Recursos Utilizados

### Framework y Core
- Angular 18/20: Framework principal estructurado en Componentes Standalone (Standalone Components), Signals para control de estado reactivo y HashLocationStrategy (withHashLocation) para compatibilidad con GitHub Pages.

### Mapas y Geolocalizacion
- Leaflet v1.9.4: Libreria JavaScript de codigo abierto para la renderizacion de mapas interactivos.
- OpenStreetMap: Proveedor de capas de mapas cartograficos vectoriales y satelitales del Distrito Metropolitano de Quito.

### Estilos y Diseno Adaptable
- TailwindCSS CDN: Sistema de diseño basado en utilidades configuradas con los tokens oficiales de color y espaciado de la plataforma (colores primarios navy #001428, secundarios esmeralda #006c49 y menta #6cf8bb).
- CSS3 Vanilla: Estilos globales y variables personalizadas para jerarquía tipografica y soporte de dispositivos moviles.

### Fuentes e Iconografía
- Google Fonts: Familias tipograficas Plus Jakarta Sans (utilizada para encabezados y numeros de metricas) e Inter (para cuerpo de texto y etiquetas).
- Google Material Symbols Outlined: Set de iconos vectoriales para la representacion visual de servicios y estados de obras.
