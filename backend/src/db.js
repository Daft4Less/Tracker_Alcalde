let Pool = null;
try {
  Pool = require('pg').Pool;
} catch (e) {
  // pg module not installed; fallback to memory DB
}

try {
  require('dotenv').config();
} catch (e) {
  // dotenv module not installed
}

// Configuración de conexión a PostgreSQL
const isPgConfigured = Pool && (process.env.DATABASE_URL || (process.env.PGHOST && process.env.PGDATABASE));

let pool = null;
if (isPgConfigured) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT || 5432,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  } catch (e) {
    console.log('PostgreSQL connection pool setup error:', e.message);
  }
}

// Dataset en Memoria Extraído de los PDFs (Fallback In-Memory para Pruebas Inmediatas)
const seedEjes = [
  { id_eje: 1, nombre: 'Hábitat, Seguridad y Convivencia Ciudadana', icono: 'policy', color_hex: '#006c49', descripcion: 'Vialidad, alumbrado LED, espacios públicos y patrullaje barrial.' },
  { id_eje: 2, nombre: 'Trabajo, Economía, Producción e Innovación', icono: 'work', color_hex: '#001428', descripcion: 'Fomento a emprendimientos, reactivación comercial y atracción de inversiones.' },
  { id_eje: 3, nombre: 'Bienestar, Derechos y Protección Social', icono: 'health_and_safety', color_hex: '#00714d', descripcion: 'Salud municipal, Guagua Centros, inclusión social y adultos mayores.' },
  { id_eje: 4, nombre: 'Movilidad Sostenible', icono: 'directions_bus', color_hex: '#0f2942', descripcion: 'Metro de Quito, corredores BTR, ciclovías y señalización inteligente.' },
  { id_eje: 5, nombre: 'Territorio Intercultural, Ecológico y Activo', icono: 'park', color_hex: '#6cf8bb', descripcion: 'Reserva Chocó Andino, parques metropolitanos y biocorredores.' }
];

const seedParroquias = [
  { id_parroquia: 1, nombre: 'Conocoto', tipo: 'rural', zona_administrativa: 'Los Chillos' },
  { id_parroquia: 2, nombre: 'Amaguaña', tipo: 'rural', zona_administrativa: 'Los Chillos' },
  { id_parroquia: 3, nombre: 'Píntag', tipo: 'rural', zona_administrativa: 'Los Chillos' },
  { id_parroquia: 4, nombre: 'La Merced', tipo: 'rural', zona_administrativa: 'Los Chillos' },
  { id_parroquia: 5, nombre: 'Alangasí', tipo: 'rural', zona_administrativa: 'Los Chillos' },
  { id_parroquia: 6, nombre: 'Guangopolo', tipo: 'rural', zona_administrativa: 'Los Chillos' },
  { id_parroquia: 7, nombre: 'Iñaquito', tipo: 'urbana', zona_administrativa: 'Eugenio Espejo' },
  { id_parroquia: 8, nombre: 'Centro Histórico', tipo: 'urbana', zona_administrativa: 'Manuela Sáenz' },
  { id_parroquia: 9, nombre: 'Quitumbe', tipo: 'urbana', zona_administrativa: 'Quitumbe' }
];

const seedProgramas = [
  { id_programa: 1, id_eje: 1, nombre: 'Paso a Desnivel & Repavimentación LED' },
  { id_programa: 2, id_eje: 2, nombre: 'Ventanilla Única Digital de Trámites' },
  { id_programa: 3, id_eje: 1, nombre: 'Red de Alumbrado Público LED' },
  { id_programa: 4, id_eje: 4, nombre: 'Ciclovías Segregadas Urbanas' },
  { id_programa: 5, id_eje: 3, nombre: 'Casas Somos & Becas Escolares' },
  { id_programa: 6, id_eje: 3, nombre: 'Hospital Municipal del Sur' },
  { id_programa: 7, id_eje: 5, nombre: 'Senderos Ecológicos y Parques' },
  { id_programa: 8, id_eje: 5, nombre: 'Saneamiento del Río Machángara' },
  { id_programa: 9, id_eje: 1, nombre: 'Cámaras C4 e Inteligencia Artificial' }
];

let memoryObras = [
  {
    id_obra: 1,
    id_programa: 1,
    id_eje: 1,
    eje_nombre: 'Hábitat, Seguridad y Convivencia Ciudadana',
    id_parroquia: 7,
    parroquia_nombre: 'Iñaquito',
    barrio_sector: 'Av. Central y Calle 8 (Mariscal)',
    descripcion: 'Paso a desnivel de 4 carriles para desahogar el tráfico del hipercentro de Quito.',
    monto_inversion: 3500000.00,
    estado: 'en_proceso',
    porcentaje_avance: 78,
    latitud: -0.180653,
    longitud: -78.467838,
    entidad_ejecutora: 'EPMMOP',
    codigo_contrato: 'EPMMOP-OB-2024-089',
    beneficiarios_directos: 45000,
    anio_ejecucion: 2024
  },
  {
    id_obra: 2,
    id_programa: 2,
    id_eje: 2,
    eje_nombre: 'Trabajo, Economía, Producción e Innovación',
    id_parroquia: 8,
    parroquia_nombre: 'Centro Histórico',
    barrio_sector: 'Portal Web y App Móvil (Municipio)',
    descripcion: 'Ventanilla digital para la realización del 100% de los trámites municipales sin filas.',
    monto_inversion: 1200000.00,
    estado: 'cumplida',
    porcentaje_avance: 100,
    latitud: -0.220164,
    longitud: -78.512327,
    entidad_ejecutora: 'Secretaría de Innovación',
    codigo_contrato: 'SI-DIG-2024-003',
    beneficiarios_directos: 2500000,
    anio_ejecucion: 2024
  },
  {
    id_obra: 3,
    id_programa: 3,
    id_eje: 1,
    eje_nombre: 'Hábitat, Seguridad y Convivencia Ciudadana',
    id_parroquia: 1,
    parroquia_nombre: 'Conocoto',
    barrio_sector: 'Barrio Paraíso de los Pinos',
    descripcion: 'Reconstrucción total de la casa comunal y equipamiento multiusos (Presupuestos Participativos).',
    monto_inversion: 78879.80,
    estado: 'cumplida',
    porcentaje_avance: 100,
    latitud: -0.300000,
    longitud: -78.480000,
    entidad_ejecutora: 'Administración Zonal Los Chillos',
    codigo_contrato: 'AZCH-PP-2024-012',
    beneficiarios_directos: 6500,
    anio_ejecucion: 2025
  },
  {
    id_obra: 4,
    id_programa: 1,
    id_eje: 1,
    eje_nombre: 'Hábitat, Seguridad y Convivencia Ciudadana',
    id_parroquia: 2,
    parroquia_nombre: 'Amaguaña',
    barrio_sector: 'Barrio El Blanqueado',
    descripcion: 'Construcción del área comunal recreativa y deportiva con juegos infantiles inclusivos.',
    monto_inversion: 39329.88,
    estado: 'en_proceso',
    porcentaje_avance: 65,
    latitud: -0.380000,
    longitud: -78.500000,
    entidad_ejecutora: 'Administración Zonal Los Chillos',
    codigo_contrato: 'AZCH-PP-2024-015',
    beneficiarios_directos: 3200,
    anio_ejecucion: 2025
  },
  {
    id_obra: 5,
    id_programa: 4,
    id_eje: 4,
    eje_nombre: 'Movilidad Sostenible',
    id_parroquia: 9,
    parroquia_nombre: 'Quitumbe',
    barrio_sector: 'Corredor Sur Quitumbe - Guamaní',
    descripcion: 'Ampliación de ciclovías segregadas urbanas con conectividad a terminales BTR.',
    monto_inversion: 450000.00,
    estado: 'detenida',
    porcentaje_avance: 40,
    latitud: -0.260000,
    longitud: -78.530000,
    entidad_ejecutora: 'Secretaría de Movilidad',
    codigo_contrato: 'SM-CIC-2024-007',
    beneficiarios_directos: 18000,
    anio_ejecucion: 2024
  },
  {
    id_obra: 6,
    id_programa: 6,
    id_eje: 3,
    eje_nombre: 'Bienestar, Derechos y Protección Social',
    id_parroquia: 9,
    parroquia_nombre: 'Quitumbe',
    barrio_sector: 'Distrito Sur (Guamaní)',
    descripcion: 'Construcción del nuevo Hospital Municipal del Sur con 60 camas de hospitalización.',
    monto_inversion: 8500000.00,
    estado: 'sin_comenzar',
    porcentaje_avance: 5,
    latitud: -0.310000,
    longitud: -78.550000,
    entidad_ejecutora: 'Secretaría de Salud',
    codigo_contrato: 'SS-HOSP-2026-001',
    beneficiarios_directos: 120000,
    anio_ejecucion: 2026
  }
];

// Servicio Abstraído de Acceso a Datos
const dbService = {
  isPostgres: false,

  async checkHealth() {
    if (pool) {
      try {
        const res = await pool.query('SELECT NOW()');
        this.isPostgres = true;
        return { mode: 'PostgreSQL Real Database', timestamp: res.rows[0].now };
      } catch (err) {
        return { mode: 'In-Memory Fallback (PostgreSQL sin conexión act.)', error: err.message };
      }
    }
    return { mode: 'In-Memory Fallback (Plan de Gobierno & Presupuestos Participativos Quito)' };
  },

  async getEjes() {
    if (pool && this.isPostgres) {
      const res = await pool.query('SELECT * FROM eje_gobierno ORDER BY id_eje');
      return res.rows;
    }
    return seedEjes;
  },

  async getParroquias() {
    if (pool && this.isPostgres) {
      const res = await pool.query('SELECT * FROM parroquia ORDER BY nombre');
      return res.rows;
    }
    return seedParroquias;
  },

  async getObras(filters = {}) {
    if (pool && this.isPostgres) {
      let query = `
        SELECT o.*, e.nombre as eje_nombre, p.nombre as parroquia_nombre 
        FROM obra o
        JOIN programa pr ON o.id_programa = pr.id_programa
        JOIN eje_gobierno e ON pr.id_eje = e.id_eje
        JOIN parroquia p ON o.id_parroquia = p.id_parroquia
        WHERE 1=1
      `;
      const params = [];
      if (filters.estado) {
        params.push(filters.estado);
        query += ` AND o.estado = $${params.length}`;
      }
      if (filters.id_parroquia) {
        params.push(filters.id_parroquia);
        query += ` AND o.id_parroquia = $${params.length}`;
      }
      query += ` ORDER BY o.id_obra DESC`;
      const res = await pool.query(query, params);
      return res.rows;
    }

    // Filtrado en Memoria
    return memoryObras.filter(o => {
      if (filters.estado && filters.estado !== 'todas' && o.estado !== filters.estado) return false;
      if (filters.id_parroquia && parseInt(filters.id_parroquia) !== o.id_parroquia) return false;
      return true;
    });
  },

  async getObraById(id) {
    if (pool && this.isPostgres) {
      const res = await pool.query(`
        SELECT o.*, e.nombre as eje_nombre, p.nombre as parroquia_nombre 
        FROM obra o
        JOIN programa pr ON o.id_programa = pr.id_programa
        JOIN eje_gobierno e ON pr.id_eje = e.id_eje
        JOIN parroquia p ON o.id_parroquia = p.id_parroquia
        WHERE o.id_obra = $1
      `, [id]);
      return res.rows[0] || null;
    }
    return memoryObras.find(o => o.id_obra === parseInt(id)) || null;
  },

  async createObra(newObraData) {
    if (pool && this.isPostgres) {
      const { id_programa, id_parroquia, barrio_sector, descripcion, monto_inversion, estado, porcentaje_avance, latitud, longitud, entidad_ejecutora, url_imagen_antes, url_imagen_despues } = newObraData;
      const res = await pool.query(`
        INSERT INTO obra (id_programa, id_parroquia, barrio_sector, descripcion, monto_inversion, estado, porcentaje_avance, latitud, longitud, entidad_ejecutora, url_imagen_antes, url_imagen_despues, anio_ejecucion)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 2025)
        RETURNING *
      `, [id_programa || 1, id_parroquia || 1, barrio_sector, descripcion, monto_inversion || 0, estado || 'sin_comenzar', porcentaje_avance || 0, latitud || -0.22, longitud || -78.51, entidad_ejecutora || 'Municipio de Quito', url_imagen_antes || '', url_imagen_despues || '']);
      return res.rows[0];
    }

    const parroquiaObj = seedParroquias.find(p => p.id_parroquia === parseInt(newObraData.id_parroquia)) || seedParroquias[0];
    const programaObj = seedProgramas.find(pr => pr.id_programa === parseInt(newObraData.id_programa)) || seedProgramas[0];
    const ejeObj = seedEjes.find(e => e.id_eje === programaObj.id_eje);

    const createdObra = {
      id_obra: memoryObras.length + 1,
      id_programa: programaObj.id_programa,
      id_eje: ejeObj.id_eje,
      eje_nombre: ejeObj.nombre,
      id_parroquia: parroquiaObj.id_parroquia,
      parroquia_nombre: parroquiaObj.nombre,
      barrio_sector: newObraData.barrio_sector || 'Sector Quito DMQ',
      descripcion: newObraData.descripcion || 'Obra ingresada vía API',
      monto_inversion: parseFloat(newObraData.monto_inversion) || 50000.00,
      estado: newObraData.estado || 'sin_comenzar',
      porcentaje_avance: parseInt(newObraData.porcentaje_avance) || 0,
      latitud: parseFloat(newObraData.latitud) || -0.220164,
      longitud: parseFloat(newObraData.longitud) || -78.512327,
      entidad_ejecutora: newObraData.entidad_ejecutora || 'Alcaldía de Quito',
      url_imagen_antes: newObraData.url_imagen_antes || '',
      url_imagen_despues: newObraData.url_imagen_despues || '',
      codigo_contrato: `API-OB-${Date.now().toString().slice(-4)}`,
      beneficiarios_directos: 15000,
      anio_ejecucion: 2025
    };

    memoryObras.unshift(createdObra);
    return createdObra;
  },

  async updateObra(id, updateData) {
    const numericId = parseInt(id);
    if (pool && this.isPostgres) {
      const { id_programa, id_parroquia, barrio_sector, descripcion, monto_inversion, estado, porcentaje_avance, latitud, longitud, entidad_ejecutora, url_imagen_antes, url_imagen_despues } = updateData;
      const res = await pool.query(`
        UPDATE obra 
        SET id_programa = COALESCE($1, id_programa),
            id_parroquia = COALESCE($2, id_parroquia),
            barrio_sector = COALESCE($3, barrio_sector),
            descripcion = COALESCE($4, descripcion),
            monto_inversion = COALESCE($5, monto_inversion),
            estado = COALESCE($6, estado),
            porcentaje_avance = COALESCE($7, porcentaje_avance),
            latitud = COALESCE($8, latitud),
            longitud = COALESCE($9, longitud),
            entidad_ejecutora = COALESCE($10, entidad_ejecutora),
            url_imagen_antes = COALESCE($11, url_imagen_antes),
            url_imagen_despues = COALESCE($12, url_imagen_despues)
        WHERE id_obra = $13
        RETURNING *
      `, [id_programa, id_parroquia, barrio_sector, descripcion, monto_inversion, estado, porcentaje_avance, latitud, longitud, entidad_ejecutora, url_imagen_antes, url_imagen_despues, numericId]);
      return res.rows[0] || null;
    }

    const index = memoryObras.findIndex(o => o.id_obra === numericId);
    if (index === -1) return null;

    const current = memoryObras[index];
    const parroquiaObj = updateData.id_parroquia ? (seedParroquias.find(p => p.id_parroquia === parseInt(updateData.id_parroquia)) || seedParroquias[0]) : null;
    const programaObj = updateData.id_programa ? (seedProgramas.find(pr => pr.id_programa === parseInt(updateData.id_programa)) || seedProgramas[0]) : null;
    const ejeObj = programaObj ? seedEjes.find(e => e.id_eje === programaObj.id_eje) : null;

    const updatedObra = {
      ...current,
      id_programa: programaObj ? programaObj.id_programa : current.id_programa,
      id_eje: ejeObj ? ejeObj.id_eje : current.id_eje,
      eje_nombre: ejeObj ? ejeObj.nombre : current.eje_nombre,
      id_parroquia: parroquiaObj ? parroquiaObj.id_parroquia : current.id_parroquia,
      parroquia_nombre: parroquiaObj ? parroquiaObj.nombre : current.parroquia_nombre,
      barrio_sector: updateData.barrio_sector !== undefined ? updateData.barrio_sector : current.barrio_sector,
      descripcion: updateData.descripcion !== undefined ? updateData.descripcion : current.descripcion,
      monto_inversion: updateData.monto_inversion !== undefined ? parseFloat(updateData.monto_inversion) : current.monto_inversion,
      estado: updateData.estado !== undefined ? updateData.estado : current.estado,
      porcentaje_avance: updateData.porcentaje_avance !== undefined ? parseInt(updateData.porcentaje_avance) : current.porcentaje_avance,
      latitud: updateData.latitud !== undefined ? parseFloat(updateData.latitud) : current.latitud,
      longitud: updateData.longitud !== undefined ? parseFloat(updateData.longitud) : current.longitud,
      entidad_ejecutora: updateData.entidad_ejecutora !== undefined ? updateData.entidad_ejecutora : current.entidad_ejecutora,
      url_imagen_antes: updateData.url_imagen_antes !== undefined ? updateData.url_imagen_antes : current.url_imagen_antes,
      url_imagen_despues: updateData.url_imagen_despues !== undefined ? updateData.url_imagen_despues : current.url_imagen_despues
    };

    memoryObras[index] = updatedObra;
    return updatedObra;
  },

  async deleteObra(id) {
    const numericId = parseInt(id);
    if (pool && this.isPostgres) {
      const res = await pool.query('DELETE FROM obra WHERE id_obra = $1 RETURNING *', [numericId]);
      return res.rows[0] || null;
    }

    const index = memoryObras.findIndex(o => o.id_obra === numericId);
    if (index === -1) return null;

    const deletedObra = memoryObras.splice(index, 1)[0];
    return deletedObra;
  }
};

module.exports = dbService;
