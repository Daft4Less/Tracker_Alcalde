-- =============================================================
-- ESQUEMA COMPLETO Y DEFINITIVO - ALCALDE TRACKER QUITO (PostgreSQL)
-- =============================================================

-- 1. TIPO ENUMERADO: Estados posibles de la obra
DO $$ BEGIN
    CREATE TYPE estado_obra AS ENUM (
        'cumplida', 
        'en_proceso', 
        'detenida', 
        'sin_comenzar', 
        'incumplida',
        'entregada',
        'concluida',
        'suspendida'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. TABLA: Ejes Estratégicos de Gobierno
CREATE TABLE IF NOT EXISTS eje_gobierno (
    id_eje SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(50) DEFAULT 'construction',
    color_hex VARCHAR(7) DEFAULT '#C8102E'
);

-- 3. TABLA: Parroquias del Distrito Metropolitano de Quito
CREATE TABLE IF NOT EXISTS parroquia (
    id_parroquia SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE,
    tipo VARCHAR(50) CHECK (tipo IN ('urbana', 'rural')),
    zona_administrativa VARCHAR(100) NOT NULL
);

-- 4. TABLA PRINCIPAL: Obras y Compromisos Municipales
CREATE TABLE IF NOT EXISTS obra (
    id_obra SERIAL PRIMARY KEY,
    
    -- Clasificación Estratégica y Territorial
    id_eje INTEGER REFERENCES eje_gobierno(id_eje) ON DELETE SET NULL,
    id_parroquia INTEGER NOT NULL REFERENCES parroquia(id_parroquia) ON DELETE RESTRICT,
    barrio_sector VARCHAR(255) NOT NULL,
    tipo_obra VARCHAR(150) NOT NULL DEFAULT 'Vialidad y Movilidad',  -- Ej: Asfaltado, Alumbrado, Parques, Agua Potable
    
    -- Detalles Descriptivos y Estado Físico
    descripcion TEXT NOT NULL,
    estado estado_obra DEFAULT 'sin_comenzar',
    porcentaje_avance INT CHECK (porcentaje_avance BETWEEN 0 AND 100) DEFAULT 0,
    
    -- Ubicación y Georreferenciación GPS (Leaflet Maps)
    latitud NUMERIC(10, 8) NULL,
    longitud NUMERIC(11, 8) NULL,
    url_mapa TEXT,
    
    -- Gestión Institucional y Transparencia Financiera
    entidad_ejecutora VARCHAR(150) NOT NULL DEFAULT 'EPMMOP',       -- Ej: EPMMOP, EPMAPS, Municipio de Quito
    monto_inversion NUMERIC(14, 2) NULL,                            -- Presupuesto ejecutado/asignado en USD
    beneficiarios_directos INTEGER DEFAULT 0,
    codigo_contrato VARCHAR(100),
    fuente_financiamiento VARCHAR(100) DEFAULT 'Presupuesto Participativo',
    estado_pago VARCHAR(50) DEFAULT 'devengado',                   -- enviado_pago | devengado | arrastre_2025
    
    -- Evidencias Multimedia y Documentos de Respaldo (PDF)
    url_imagen TEXT,                                                -- Fotografía principal de la obra (Base64 o URL)
    url_documento_respaldo TEXT,                                    -- Enlace al PDF del contrato o acta de entrega
    
    -- Fechas y Auditoría de Tiempos
    anio_ejecucion INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    fecha_inicio DATE,
    fecha_fin_estimada DATE,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLA: Galería de Evidencias Fotográficas Múltiples
CREATE TABLE IF NOT EXISTS evidencia_obra (
    id_evidencia SERIAL PRIMARY KEY,
    id_obra INTEGER NOT NULL REFERENCES obra(id_obra) ON DELETE CASCADE,
    url_imagen TEXT NOT NULL,
    tipo_evidencia VARCHAR(50) CHECK (tipo_evidencia IN ('antes', 'durante', 'despues', 'documento')),
    descripcion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA: Usuarios Administradores (Seguridad JWT)
CREATE TABLE IF NOT EXISTS admin (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,                                    -- Contraseña encriptada en bcrypt
    nombre_completo VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'admin',                                -- admin | auditor | editor
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLA: Log de Auditoría y Trazabilidad de Cambios
CREATE TABLE IF NOT EXISTS auditoria_log (
    id_log SERIAL PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL,
    accion VARCHAR(50) NOT NULL,                                    -- CREAR | ACTUALIZAR | ELIMINAR | LOGIN
    tabla_afectada VARCHAR(50) NOT NULL,
    id_registro_afectado INTEGER,
    detalles JSONB,                                                 -- Copia de los datos antes/después del cambio
    ip_origen VARCHAR(45),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- SEED DE DATOS INICIALES (Ejes y Parroquias Principales)
-- =============================================================

INSERT INTO eje_gobierno (id_eje, nombre, descripcion, icono, color_hex) VALUES
    (1, 'Hábitat, Seguridad y Convivencia Ciudadana', 'Vialidad, alumbrado LED, espacios públicos y patrullaje barrial.', 'policy', '#006c49'),
    (2, 'Trabajo, Economía, Producción e Innovación', 'Fomento a emprendimientos, reactivación comercial y atracción de inversiones.', 'work', '#001428'),
    (3, 'Bienestar, Derechos y Protección Social', 'Salud municipal, Guagua Centros, inclusión social y adultos mayores.', 'health_and_safety', '#00714d'),
    (4, 'Movilidad Sostenible', 'Metro de Quito, corredores BTR, ciclovías y señalización inteligente.', 'directions_bus', '#0f2942'),
    (5, 'Territorio Intercultural, Ecológico y Activo', 'Reserva Chocó Andino, parques metropolitanos y biocorredores.', 'park', '#6cf8bb')
ON CONFLICT DO NOTHING;

INSERT INTO parroquia (id_parroquia, nombre, tipo, zona_administrativa) VALUES
    (1, 'Conocoto', 'rural', 'Los Chillos'),
    (2, 'Amaguaña', 'rural', 'Los Chillos'),
    (3, 'Píntag', 'rural', 'Los Chillos'),
    (4, 'La Merced', 'rural', 'Los Chillos'),
    (5, 'Alangasí', 'rural', 'Los Chillos'),
    (6, 'Guangopolo', 'rural', 'Los Chillos'),
    (7, 'Iñaquito', 'urbana', 'Eugenio Espejo'),
    (8, 'Centro Histórico', 'urbana', 'Manuela Sáenz'),
    (9, 'Quitumbe', 'urbana', 'Quitumbe')
ON CONFLICT DO NOTHING;
