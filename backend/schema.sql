-- =============================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS POSTGRESQL - ALCALDE TRACKER QUITO
-- Basado en el Plan de Gobierno (PDF 1) e Informes de Presupuestos (PDF 2)
-- =============================================================

-- 1. Tipo ENUM para estado de obras
DO $$ BEGIN
    CREATE TYPE estado_obra AS ENUM ('cumplida', 'en_proceso', 'detenida', 'sin_comenzar', 'incumplida');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Tabla de Ejes de Gobierno
CREATE TABLE IF NOT EXISTS eje_gobierno (
    id_eje SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50) DEFAULT 'dashboard',
    color_hex VARCHAR(7) DEFAULT '#006c49'
);

-- 3. Tabla de Programas
CREATE TABLE IF NOT EXISTS programa (
    id_programa SERIAL PRIMARY KEY,
    id_eje INTEGER NOT NULL REFERENCES eje_gobierno(id_eje) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    codigo_programa VARCHAR(50)
);

-- 4. Tabla de Parroquias del DMQ
CREATE TABLE IF NOT EXISTS parroquia (
    id_parroquia SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE,
    tipo VARCHAR(50) CHECK (tipo IN ('urbana', 'rural')),
    zona_administrativa VARCHAR(100)
);

-- 5. Tabla Principal de Obras y Compromisos
CREATE TABLE IF NOT EXISTS obra (
    id_obra SERIAL PRIMARY KEY,
    id_programa INTEGER NOT NULL REFERENCES programa(id_programa) ON DELETE CASCADE,
    id_parroquia INTEGER NOT NULL REFERENCES parroquia(id_parroquia) ON DELETE RESTRICT,
    barrio_sector VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    monto_inversion NUMERIC(12, 2) NULL,           -- NULL para obras en fase de propuesta
    estado estado_obra DEFAULT 'sin_comenzar',
    porcentaje_avance INT CHECK (porcentaje_avance BETWEEN 0 AND 100) DEFAULT 0,
    latitud NUMERIC(10, 8) NULL,                    -- Georreferenciación Leaflet
    longitud NUMERIC(11, 8) NULL,                   -- Georreferenciación Leaflet
    entidad_ejecutora VARCHAR(150),                 -- Ej: EPMMOP, EPMAPS
    url_imagen_antes TEXT,                          -- Opción A: Base64 Data URI o URL (Foto Antes)
    url_imagen_despues TEXT,                        -- Opción A: Base64 Data URI o URL (Foto Después / Actual)
    codigo_contrato VARCHAR(100),
    beneficiarios_directos INTEGER,
    fecha_inicio DATE,
    fecha_fin_estimada DATE,
    anio_ejecucion INTEGER
);

-- 6. Tabla de Evidencias y Galerías
CREATE TABLE IF NOT EXISTS evidencia_obra (
    id_evidencia SERIAL PRIMARY KEY,
    id_obra INTEGER NOT NULL REFERENCES obra(id_obra) ON DELETE CASCADE,
    url_imagen TEXT NOT NULL,
    tipo_evidencia VARCHAR(50) CHECK (tipo_evidencia IN ('antes', 'durante', 'despues', 'documento')),
    descripcion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabla de Criterios de Priorización
CREATE TABLE IF NOT EXISTS criterio_priorizacion (
    id_criterio SERIAL PRIMARY KEY,
    id_obra INTEGER NOT NULL REFERENCES obra(id_obra) ON DELETE CASCADE,
    tipo_criterio VARCHAR(100) NOT NULL,
    puntaje INTEGER CHECK (puntaje BETWEEN 1 AND 5),
    detalles TEXT
);

-- 8. Tabla de Eventos de Rendición de Cuentas (Vista 3)
CREATE TABLE IF NOT EXISTS evento_rendicion (
    id_evento SERIAL PRIMARY KEY,
    id_obra INTEGER REFERENCES obra(id_obra) ON DELETE SET NULL,
    titulo VARCHAR(255) NOT NULL,
    fecha_evento TIMESTAMP NOT NULL,
    lugar VARCHAR(255) NOT NULL,
    tipo_evento VARCHAR(100),
    descripcion TEXT
);

-- 9. Tabla de Administradores (Autenticación JWT del Panel Admin)
CREATE TABLE IF NOT EXISTS admin (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,                    -- Hash bcrypt
    nombre_completo VARCHAR(255),
    rol VARCHAR(50) DEFAULT 'admin',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
