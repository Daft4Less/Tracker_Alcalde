#!/usr/bin/env node
// -*- coding: utf-8 -*-
/*
 * Resuelve coordenadas (lat/lng) de cada obra a partir de su url_mapa
 * de Google Maps. Reanudable: omite obras que ya tienen coordenadas.
 *
 * Uso: node backend/scripts/resolve_coords.js
 *   - Lee  backend/seed/obras_matriz.json
 *   - Llena latitud/longitud para obras con url_mapa y sin coordenadas
 *   - Reescribe backend/seed/obras_matriz.json y backend/seed/insert_obras.pg.sql
 *     de forma incremental (guarda tras cada obra resuelta).
 */
const fs = require('fs');
const path = require('path');

const SEED_DIR = path.join(__dirname, '..', 'seed');
const JSON_PATH = path.join(SEED_DIR, 'obras_matriz.json');
const SQL_PATH = path.join(SEED_DIR, 'insert_obras.pg.sql');

const RE_DIRECT = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
const RE_QUERY = /[?&](?:q|query|ll|center)=(-?\d+\.\d+),(-?\d+\.\d+)/;
const RE_3D4D = /!3d(-?\d+\.\d+).*?!4d(-?\d+\.\d+)/;
const RE_SEARCH = /maps\/search\/(-?\d+\.\d+)\s*,\s*\+?\s*(-?\d+\.\d+)/;

function extractCoords(url) {
  const m = String(url).match(RE_DIRECT) ||
            String(url).match(RE_SEARCH) ||
            String(url).match(RE_QUERY) ||
            String(url).match(RE_3D4D);
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  return null;
}

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function resolveUrl(mapsUrl) {
  // Intento 1: coords directas en el propio link (goo.gl/maps/XXXX suele venir así)
  const direct = extractCoords(mapsUrl);
  if (direct) return { ...direct, source: 'url' };
  // Intento 2: resolver el redirect HTTP
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(mapsUrl, { redirect: 'follow' });
      const coords = extractCoords(res.url);
      if (coords) return { ...coords, source: 'redirect' };
    } catch {}
    if (attempt < 3) await sleep(1200 * attempt);
  }
  return null;
}

function writeSql(obras) {
  const esc = s => String(s ?? '').replace(/'/g, "''");
  const lines = [];
  lines.push('-- INSERTs generados desde la matriz (RV 2026) por scripts/extract_matriz.py + resolve_coords.js');
  lines.push('-- Las parroquias deben existir (ids 1-6 = Conocoto, Amaguaña, Píntag, La Merced, Alangasí, Guangopolo).');
  lines.push('');
  for (const o of obras) {
    const lat = o.latitud != null ? o.latitud : 'NULL';
    const lng = o.longitud != null ? o.longitud : 'NULL';
    const ff = o.fuente_financiamiento ? `'${esc(o.fuente_financiamiento)}'` : 'NULL';
    const pg = o.estado_pago ? `'${esc(o.estado_pago)}'` : 'NULL';
    const url = o.url_mapa ? `'${esc(o.url_mapa)}'` : 'NULL';
    const img = o.url_imagen ? `'${esc(o.url_imagen)}'` : 'NULL';
    const monto = o.monto_inversion ?? 'NULL';
    const anio = o.anio_ejecucion ?? 'NULL';
    lines.push(
      `INSERT INTO obra (id_parroquia, barrio_sector, descripcion, monto_inversion, estado, anio_ejecucion, fuente_financiamiento, estado_pago, url_mapa, url_imagen, latitud, longitud, codigo_contrato) VALUES ` +
      `(${o.id_parroquia}, '${esc(o.barrio_sector)}', '${esc(o.descripcion)}', ${monto}, '${esc(o.estado)}', ${anio}, ${ff}, ${pg}, ${url}, ${img}, ${lat}, ${lng}, '${esc(o.codigo_contrato)}');`
    );
  }
  fs.writeFileSync(SQL_PATH, lines.join('\n'), 'utf-8');
}

async function main() {
  const obras = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
  let pendientes = obras.filter(o => o.url_mapa && (!o.latitud || !o.longitud));
  console.log(`Obras: ${obras.length} | con url_mapa sin coordenadas: ${pendientes.length}`);

  let ok = 0;
  let fail = 0;

  for (let i = 0; i < pendientes.length; i++) {
    const o = pendientes[i];
    const res = await resolveUrl(o.url_mapa);
    if (res) {
      o.latitud = parseFloat(res.lat.toFixed(6));
      o.longitud = parseFloat(res.lng.toFixed(6));
      ok++;
      console.log(`✔ obra ${o.id_obra}: ${o.latitud.toFixed(6)}, ${o.longitud.toFixed(6)} (${res.source})`);
    } else {
      fail++;
      console.log(`✖ obra ${o.id_obra}: NO se pudieron extraer coords de ${o.url_mapa}`);
    }
    fs.writeFileSync(JSON_PATH, JSON.stringify(obras, null, 1), 'utf-8');
    writeSql(obras);
    if (i < pendientes.length - 1) await sleep(250);
  }

  console.log(`\nCoordenadas resueltas: ${ok} | fallidas: ${fail}`);
  const conCoords = obras.filter(o => !o.url_mapa || (o.latitud && o.longitud)).length;
  const sinCoords = obras.filter(o => o.url_mapa && (!o.latitud || !o.longitud)).length;
  console.log(`Con coordenadas: ${obras.length - sinCoords - (obras.filter(o=>!o.url_mapa)).length} | con link pendientes: ${sinCoords} | sin link: ${obras.filter(o=>!o.url_mapa).length}`);
  console.log(`JSON -> ${JSON_PATH}`);
  console.log(`SQL  -> ${SQL_PATH}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});