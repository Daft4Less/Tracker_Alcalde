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

const fs = require('fs');
const path = require('path');

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

// --------------------------------------------------------------------
// Seed In-Memory proveniente de la MATRIZ REAL de obras del
// Gabinete Territorial Los Chillos (backend/seed/obras_matriz.json,
// generado por backend/scripts/extract_matriz.py desde el xlsx).
// --------------------------------------------------------------------

const seedObrasPath = path.join(__dirname, '..', 'seed', 'obras_matriz.json');
let seedObras = [];
try {
  seedObras = JSON.parse(fs.readFileSync(seedObrasPath, 'utf-8'));
} catch (e) {
  console.warn('No se pudo cargar seed/obras_matriz.json:', e.message);
}

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

const seedEjes = [
  { id_eje: 1, nombre: 'Hábitat, Seguridad y Convivencia Ciudadana', icono: 'policy', color_hex: '#006c49', descripcion: 'Vialidad, alumbrado LED, espacios públicos y patrullaje barrial.' },
  { id_eje: 2, nombre: 'Trabajo, Economía, Producción e Innovación', icono: 'work', color_hex: '#001428', descripcion: 'Fomento a emprendimientos, reactivación comercial y atracción de inversiones.' },
  { id_eje: 3, nombre: 'Bienestar, Derechos y Protección Social', icono: 'health_and_safety', color_hex: '#00714d', descripcion: 'Salud municipal, Guagua Centros, inclusión social y adultos mayores.' },
  { id_eje: 4, nombre: 'Movilidad Sostenible', icono: 'directions_bus', color_hex: '#0f2942', descripcion: 'Metro de Quito, corredores BTR, ciclovías y señalización inteligente.' },
  { id_eje: 5, nombre: 'Territorio Intercultural, Ecológico y Activo', icono: 'park', color_hex: '#6cf8bb', descripcion: 'Reserva Chocó Andino, parques metropolitanos y biocorredores.' }
];

let memoryObras = seedObras.map((o, i) => ({ ...o, id_obra: o.id_obra || i + 1 }));
let memoryAdmin = null;

// Admin en Memoria (Fallback cuando no hay PostgreSQL configurado)
let memoryAdmins = [];

// Servicio Abstraído de Acceso a Datos
const dbService = {
  isPostgres: false,

  async getAdminByUsername(username) {
    if (pool && this.isPostgres) {
      const res = await pool.query(
        'SELECT id, username, password_hash, nombre_completo, rol, activo FROM admin WHERE username = $1 LIMIT 1',
        [username]
      );
      return res.rows[0] || null;
    }
    return memoryAdmins.find(a => a.username === username) || null;
  },

  async createAdmin(adminData) {
    if (pool && this.isPostgres) {
      const res = await pool.query(
        `INSERT INTO admin (username, password_hash, nombre_completo, rol)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (username) DO NOTHING
         RETURNING id, username, nombre_completo, rol, activo`,
        [adminData.username, adminData.password_hash, adminData.nombre_completo || '', adminData.rol || 'admin']
      );
      return res.rows[0] || null;
    }
    const existing = memoryAdmins.find(a => a.username === adminData.username);
    if (existing) return existing;
    const created = {
      id: memoryAdmins.length + 1,
      username: adminData.username,
      password_hash: adminData.password_hash,
      nombre_completo: adminData.nombre_completo || '',
      rol: adminData.rol || 'admin',
      activo: true
    };
    memoryAdmins.push(created);
    return created;
  },

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
    return { mode: 'In-Memory Fallback (Matriz Obras Valle de los Chillos)' };
  },

  // Catálogo de ejes de gobierno (plan de trabajo municipal).
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
        SELECT o.*, p.nombre as parroquia_nombre
        FROM obra o
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
      query += ` ORDER BY o.id_obra ASC`;
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
        SELECT o.*, p.nombre as parroquia_nombre
        FROM obra o
        JOIN parroquia p ON o.id_parroquia = p.id_parroquia
        WHERE o.id_obra = $1
      `, [id]);
      return res.rows[0] || null;
    }
    return memoryObras.find(o => o.id_obra === parseInt(id)) || null;
  },

  async createObra(newObraData) {
    if (pool && this.isPostgres) {
      const res = await pool.query(`
        INSERT INTO obra (id_eje, id_parroquia, barrio_sector, descripcion, monto_inversion, estado, porcentaje_avance, anio_ejecucion, entidad_ejecutora, fuente_financiamiento, estado_pago, url_mapa, url_imagen, latitud, longitud, codigo_contrato)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *
      `, [
        newObraData.id_eje || null,
        newObraData.id_parroquia || 1,
        newObraData.barrio_sector,
        newObraData.descripcion,
        newObraData.monto_inversion ?? null,
        newObraData.estado || 'sin_comenzar',
        newObraData.porcentaje_avance ?? 0,
        newObraData.anio_ejecucion || null,
        newObraData.entidad_ejecutora || null,
        newObraData.fuente_financiamiento || null,
        newObraData.estado_pago || null,
        newObraData.url_mapa || null,
        newObraData.url_imagen || null,
        newObraData.latitud ?? null,
        newObraData.longitud ?? null,
        newObraData.codigo_contrato || `API-OB-${Date.now().toString().slice(-4)}`
      ]);
      return res.rows[0];
    }

    memoryObras = memoryObras.map((o, i) => ({ ...o, id_obra: i + 1 }));
    const parroquiaObj = seedParroquias.find(p => p.id_parroquia === parseInt(newObraData.id_parroquia)) || seedParroquias[0];
    const ejeObj = seedEjes.find(e => e.id_eje === parseInt(newObraData.id_eje)) || seedEjes[0];
    const createdObra = {
      id_obra: memoryObras.length + 1,
      id_eje: newObraData.id_eje ? ejeObj.id_eje : null,
      eje_nombre: newObraData.id_eje ? ejeObj.nombre : null,
      id_parroquia: parroquiaObj.id_parroquia,
      parroquia_nombre: parroquiaObj.nombre,
      barrio_sector: newObraData.barrio_sector || 'Sector Quito DMQ',
      descripcion: newObraData.descripcion || 'Obra ingresada vía API',
      monto_inversion: parseFloat(newObraData.monto_inversion ?? 0) || null,
      estado: newObraData.estado || 'sin_comenzar',
      porcentaje_avance: newObraData.porcentaje_avance ?? 0,
      entidad_ejecutora: newObraData.entidad_ejecutora || null,
      anio_ejecucion: newObraData.anio_ejecucion ? parseInt(newObraData.anio_ejecucion) : null,
      fuente_financiamiento: newObraData.fuente_financiamiento || null,
      estado_pago: newObraData.estado_pago || null,
      url_mapa: newObraData.url_mapa || null,
      url_imagen: newObraData.url_imagen || null,
      latitud: newObraData.latitud ? parseFloat(newObraData.latitud) : null,
      longitud: newObraData.longitud ? parseFloat(newObraData.longitud) : null,
      codigo_contrato: newObraData.codigo_contrato || `API-OB-${Date.now().toString().slice(-4)}`
    };
    memoryObras.push(createdObra);
    return createdObra;
  },

  async updateObra(id, updateData) {
    const numericId = parseInt(id);
    if (pool && this.isPostgres) {
      const res = await pool.query(`
        UPDATE obra
        SET id_eje = COALESCE($1, id_eje),
            id_parroquia = COALESCE($2, id_parroquia),
            barrio_sector = COALESCE($3, barrio_sector),
            descripcion = COALESCE($4, descripcion),
            monto_inversion = COALESCE($5, monto_inversion),
            estado = COALESCE($6, estado),
            porcentaje_avance = COALESCE($7, porcentaje_avance),
            anio_ejecucion = COALESCE($8, anio_ejecucion),
            entidad_ejecutora = COALESCE($9, entidad_ejecutora),
            fuente_financiamiento = COALESCE($10, fuente_financiamiento),
            estado_pago = COALESCE($11, estado_pago),
            url_mapa = COALESCE($12, url_mapa),
            url_imagen = COALESCE($13, url_imagen),
            latitud = COALESCE($14, latitud),
            longitud = COALESCE($15, longitud),
            codigo_contrato = COALESCE($16, codigo_contrato)
        WHERE id_obra = $17
        RETURNING *
      `, [
        updateData.id_eje ?? null,
        updateData.id_parroquia ?? null,
        updateData.barrio_sector ?? null,
        updateData.descripcion ?? null,
        updateData.monto_inversion ?? null,
        updateData.estado ?? null,
        updateData.porcentaje_avance ?? null,
        updateData.anio_ejecucion ?? null,
        updateData.entidad_ejecutora ?? null,
        updateData.fuente_financiamiento ?? null,
        updateData.estado_pago ?? null,
        updateData.url_mapa ?? null,
        updateData.url_imagen ?? null,
        updateData.latitud ?? null,
        updateData.longitud ?? null,
        updateData.codigo_contrato ?? null,
        numericId
      ]);
      return res.rows[0] || null;
    }

    const index = memoryObras.findIndex(o => o.id_obra === numericId);
    if (index === -1) return null;

    const parroquiaObj = updateData.id_parroquia
      ? (seedParroquias.find(p => p.id_parroquia === parseInt(updateData.id_parroquia)) || seedParroquias[0])
      : null;

    const updated = {
      ...memoryObras[index],
      id_eje: updateData.id_eje !== undefined ? parseInt(updateData.id_eje) || null : memoryObras[index].id_eje,
      eje_nombre: updateData.id_eje !== undefined ? (seedEjes.find(e => e.id_eje === parseInt(updateData.id_eje)) || { nombre: null }).nombre : memoryObras[index].eje_nombre,
      id_parroquia: parroquiaObj ? parroquiaObj.id_parroquia : memoryObras[index].id_parroquia,
      parroquia_nombre: parroquiaObj ? parroquiaObj.nombre : memoryObras[index].parroquia_nombre,
      barrio_sector: updateData.barrio_sector !== undefined ? updateData.barrio_sector : memoryObras[index].barrio_sector,
      descripcion: updateData.descripcion !== undefined ? updateData.descripcion : memoryObras[index].descripcion,
      monto_inversion: updateData.monto_inversion !== undefined ? parseFloat(updateData.monto_inversion) : memoryObras[index].monto_inversion,
      estado: updateData.estado !== undefined ? updateData.estado : memoryObras[index].estado,
      porcentaje_avance: updateData.porcentaje_avance !== undefined ? parseInt(updateData.porcentaje_avance) : memoryObras[index].porcentaje_avance,
      anio_ejecucion: updateData.anio_ejecucion !== undefined ? parseInt(updateData.anio_ejecucion) : memoryObras[index].anio_ejecucion,
      entidad_ejecutora: updateData.entidad_ejecutora !== undefined ? updateData.entidad_ejecutora : memoryObras[index].entidad_ejecutora,
      fuente_financiamiento: updateData.fuente_financiamiento !== undefined ? updateData.fuente_financiamiento : memoryObras[index].fuente_financiamiento,
      estado_pago: updateData.estado_pago !== undefined ? updateData.estado_pago : memoryObras[index].estado_pago,
      url_mapa: updateData.url_mapa !== undefined ? updateData.url_mapa : memoryObras[index].url_mapa,
      url_imagen: updateData.url_imagen !== undefined ? updateData.url_imagen : memoryObras[index].url_imagen,
      latitud: updateData.latitud !== undefined ? parseFloat(updateData.latitud) : memoryObras[index].latitud,
      longitud: updateData.longitud !== undefined ? parseFloat(updateData.longitud) : memoryObras[index].longitud,
      codigo_contrato: updateData.codigo_contrato !== undefined ? updateData.codigo_contrato : memoryObras[index].codigo_contrato
    };
    memoryObras[index] = updated;
    return updated;
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
    memoryObras = memoryObras.map((o, i) => ({ ...o, id_obra: i + 1 }));
    return deletedObra;
  }
};

module.exports = dbService;