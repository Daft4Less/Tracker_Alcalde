const ExcelJS = require('exceljs');
const path = require('path');

async function generateExcel() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Alcalde Tracker Quito';
  workbook.lastModifiedBy = 'Equipo de Desarrollo';
  workbook.created = new Date();

  // -------------------------------------------------------------
  // PESTAÑA 1: MATRIZ DE OBRAS (DATOS DE MUESTRA)
  // -------------------------------------------------------------
  const sheet = workbook.addWorksheet('Matriz_Obras_Quito', {
    views: [{ showGridLines: true }]
  });

  const columns = [
    { header: 'ID_Obra', key: 'id_obra', width: 12 },
    { header: 'Barrio_Sector', key: 'barrio_sector', width: 32 },
    { header: 'Parroquia', key: 'parroquia', width: 20 },
    { header: 'Tipo_Obra', key: 'tipo_obra', width: 28 },
    { header: 'Descripcion_Obra', key: 'descripcion', width: 50 },
    { header: 'Estado_Obra', key: 'estado', width: 16 },
    { header: 'Porcentaje_Avance', key: 'porcentaje_avance', width: 18 },
    { header: 'Latitud_GPS', key: 'latitud', width: 15 },
    { header: 'Longitud_GPS', key: 'longitud', width: 15 },
    { header: 'Institucion_Ejecutora', key: 'entidad', width: 24 },
    { header: 'Inversion_USD', key: 'monto', width: 18 },
    { header: 'Beneficiarios_Directos', key: 'beneficiarios', width: 22 },
    { header: 'Codigo_Contrato', key: 'codigo_contrato', width: 26 },
    { header: 'Fuente_Financiamiento', key: 'fuente', width: 28 },
    { header: 'URL_Foto_Obra', key: 'url_foto', width: 45 },
    { header: 'URL_PDF_Respaldo', key: 'url_pdf', width: 45 }
  ];

  sheet.columns = columns;

  // Estilo de encabezados (Fondo Azul Institucional #001428, texto blanco negrita)
  const headerRow = sheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF001428' }
    };
    cell.font = {
      name: 'Segoe UI',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF001428' } },
      bottom: { style: 'medium', color: { argb: 'FF001428' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
    };
  });

  const sampleData = [
    {
      id_obra: 101,
      barrio_sector: 'Av. Amazonas y Naciones Unidas',
      parroquia: 'Iñaquito',
      tipo_obra: 'Vialidad y Asfaltado',
      descripcion: 'Rehabilitación vial integral con capa de rodadura asfáltica de 3 pulgadas y señalización termoplástica.',
      estado: 'cumplida',
      porcentaje_avance: 1.0, // 100%
      latitud: -0.180653,
      longitud: -78.467838,
      entidad: 'EPMMOP',
      monto: 450000.00,
      beneficiarios: 35000,
      codigo_contrato: 'LICO-EPMMOP-2026-012',
      fuente: 'Presupuesto Participativo',
      url_foto: 'https://ejemplo.gob.ec/fotos/obra_101.jpg',
      url_pdf: 'https://ejemplo.gob.ec/docs/contrato_101.pdf'
    },
    {
      id_obra: 102,
      barrio_sector: 'Barrio Solanda Sector 3',
      parroquia: 'Solanda',
      tipo_obra: 'Parques y Espacios Verdes',
      descripcion: 'Construcción de parque recreativo con canchas sintéticas, iluminación LED y juegos infantiles inclusivos.',
      estado: 'en_proceso',
      porcentaje_avance: 0.65, // 65%
      latitud: -0.269150,
      longitud: -78.537542,
      entidad: 'Municipio de Quito',
      monto: 280000.00,
      beneficiarios: 18000,
      codigo_contrato: 'LICO-MDMQ-2026-045',
      fuente: 'Fondo de Desarrollo Comunitario',
      url_foto: 'https://ejemplo.gob.ec/fotos/obra_102.jpg',
      url_pdf: 'https://ejemplo.gob.ec/docs/contrato_102.pdf'
    },
    {
      id_obra: 103,
      barrio_sector: 'Valle de los Chillos - Conocoto Centro',
      parroquia: 'Conocoto',
      tipo_obra: 'Agua Potable y Alcantarillado',
      descripcion: 'Ampliación de red matriz de alcantarillado sanitario y cambio de tubería de distribución de agua potable.',
      estado: 'en_proceso',
      porcentaje_avance: 0.40, // 40%
      latitud: -0.300120,
      longitud: -78.480120,
      entidad: 'EPMAPS',
      monto: 890000.00,
      beneficiarios: 42000,
      codigo_contrato: 'LICO-EPMAPS-2026-089',
      fuente: 'Crédito Internacional BID',
      url_foto: 'https://ejemplo.gob.ec/fotos/obra_103.jpg',
      url_pdf: 'https://ejemplo.gob.ec/docs/contrato_103.pdf'
    },
    {
      id_obra: 104,
      barrio_sector: 'Centro Histórico - Calle García Moreno',
      parroquia: 'Centro Histórico',
      tipo_obra: 'Seguridad y Alumbrado',
      descripcion: 'Instalación de cámaras de videovigilancia de alta definición con IA y postes con iluminación ornamental LED.',
      estado: 'sin_comenzar',
      porcentaje_avance: 0.0, // 0%
      latitud: -0.220164,
      longitud: -78.512327,
      entidad: 'Municipio de Quito',
      monto: 175000.00,
      beneficiarios: 25000,
      codigo_contrato: 'LICO-MDMQ-2026-102',
      fuente: 'Tasa de Seguridad Ciudadana',
      url_foto: 'https://ejemplo.gob.ec/fotos/obra_104.jpg',
      url_pdf: 'https://ejemplo.gob.ec/docs/contrato_104.pdf'
    },
    {
      id_obra: 105,
      barrio_sector: 'Quitumbe - Terminal Terrestre Sur',
      parroquia: 'Quitumbe',
      tipo_obra: 'Infraestructura Social',
      descripcion: 'Remodelación y equipamiento del Centro de Desarrollo Infantil Guagua Centro Quitumbe.',
      estado: 'cumplida',
      porcentaje_avance: 1.0, // 100%
      latitud: -0.298285,
      longitud: -78.552467,
      entidad: 'Patronato San José',
      monto: 310000.00,
      beneficiarios: 1200,
      codigo_contrato: 'LICO-PATRONATO-2026-008',
      fuente: 'Presupuesto Participativo',
      url_foto: 'https://ejemplo.gob.ec/fotos/obra_105.jpg',
      url_pdf: 'https://ejemplo.gob.ec/docs/contrato_105.pdf'
    }
  ];

  sampleData.forEach((data, index) => {
    const row = sheet.addRow(data);
    row.height = 24;

    const bgColor = index % 2 === 0 ? 'FFFFFFFF' : 'FFF8FAFC';

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgColor }
      };
      cell.font = { name: 'Segoe UI', size: 10 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
      cell.alignment = { vertical: 'middle' };

      if (colNumber === 7) { // Porcentaje_Avance
        cell.numFmt = '0%';
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (colNumber === 11) { // Inversion_USD
        cell.numFmt = '$#,##0.00';
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
      } else if (colNumber === 12) { // Beneficiarios_Directos
        cell.numFmt = '#,##0';
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
      } else if (colNumber === 1 || colNumber === 8 || colNumber === 9) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    });
  });

  // -------------------------------------------------------------
  // PESTAÑA 2: GUÍA DE INSTRUCCIONES PARA EL CLIENTE
  // -------------------------------------------------------------
  const guideSheet = workbook.addWorksheet('Guia_Instrucciones', {
    views: [{ showGridLines: true }]
  });

  guideSheet.columns = [
    { header: 'Campo / Columna', key: 'campo', width: 26 },
    { header: 'Tipo de Dato', key: 'tipo', width: 20 },
    { header: 'Obligatorio', key: 'obligatorio', width: 14 },
    { header: 'Descripción e Instrucciones de Llenado', key: 'instrucciones', width: 65 }
  ];

  const guideHeaderRow = guideSheet.getRow(1);
  guideHeaderRow.height = 28;
  guideHeaderRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFC8102E' } // Rojo Institucional
    };
    cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const guideRows = [
    { campo: 'ID_Obra', tipo: 'Número / Código', obligatorio: 'SÍ', instrucciones: 'Código único de la obra o número correlativo (ej. 101, 102).' },
    { campo: 'Barrio_Sector', tipo: 'Texto', obligatorio: 'SÍ', instrucciones: 'Nombre del barrio, avenida o sector donde se realiza el proyecto.' },
    { campo: 'Parroquia', tipo: 'Texto (Catálogo)', obligatorio: 'SÍ', instrucciones: 'Nombre oficial de la parroquia del DMQ (ej. Iñaquito, Conocoto, Solanda).' },
    { campo: 'Tipo_Obra', tipo: 'Texto (Categoría)', obligatorio: 'SÍ', instrucciones: 'Categoría (ej. Vialidad y Asfaltado, Agua Potable, Parques, Seguridad).' },
    { campo: 'Descripcion_Obra', tipo: 'Texto Largo', obligatorio: 'SÍ', instrucciones: 'Detalle de los trabajos, alcance y características técnicas.' },
    { campo: 'Estado_Obra', tipo: 'Texto (Específico)', obligatorio: 'SÍ', instrucciones: 'Usar únicamente: cumplida, en_proceso, detenida o sin_comenzar.' },
    { campo: 'Porcentaje_Avance', tipo: 'Porcentaje / Número', obligatorio: 'SÍ', instrucciones: 'Porcentaje físico de 0% a 100% (o número decimal de 0 a 1).' },
    { campo: 'Latitud_GPS', tipo: 'Número Decimal', obligatorio: 'NO', instrucciones: 'Coordenada de latitud en grados decimales (ej. -0.180653).' },
    { campo: 'Longitud_GPS', tipo: 'Número Decimal', obligatorio: 'NO', instrucciones: 'Coordenada de longitud en grados decimales (ej. -78.467838).' },
    { campo: 'Institucion_Ejecutora', tipo: 'Texto', obligatorio: 'SÍ', instrucciones: 'Entidad responsable (ej. EPMMOP, EPMAPS, Municipio de Quito).' },
    { campo: 'Inversion_USD', tipo: 'Moneda (USD)', obligatorio: 'NO', instrucciones: 'Presupuesto total en dólares sin signo $ (ej. 450000.00).' },
    { campo: 'Beneficiarios_Directos', tipo: 'Número Entero', obligatorio: 'NO', instrucciones: 'Estimación de habitantes beneficiados (ej. 35000).' },
    { campo: 'Codigo_Contrato', tipo: 'Texto', obligatorio: 'NO', instrucciones: 'Código oficial del contrato público (ej. LICO-EPMMOP-2026-012).' },
    { campo: 'Fuente_Financiamiento', tipo: 'Texto', obligatorio: 'NO', instrucciones: 'Origen de recursos (ej. Presupuesto Participativo, Crédito BID).' },
    { campo: 'URL_Foto_Obra', tipo: 'Texto / Enlace', obligatorio: 'NO', instrucciones: 'Enlace web o nombre de archivo de la foto del avance.' },
    { campo: 'URL_PDF_Respaldo', tipo: 'Texto / Enlace', obligatorio: 'NO', instrucciones: 'Enlace web al PDF del contrato o acta de entrega.' }
  ];

  guideRows.forEach((data, index) => {
    const row = guideSheet.addRow(data);
    row.height = 22;
    const bgColor = index % 2 === 0 ? 'FFFFFFFF' : 'FFF8FAFC';
    row.eachCell((cell, colNumber) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
      cell.font = { name: 'Segoe UI', size: 10 };
      cell.alignment = { vertical: 'middle' };
      if (colNumber === 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        if (data.obligatorio === 'SÍ') {
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFC8102E' } };
        }
      }
    });
  });

  const targetPath = path.join(__dirname, '..', 'Matriz_Obras_Plantilla_Alcalde_Tracker.xlsx');
  await workbook.xlsx.writeFile(targetPath);
  console.log(`EXCEL_FILE_CREATED: ${targetPath}`);
}

generateExcel().catch(err => {
  console.error(err);
  process.exit(1);
});
