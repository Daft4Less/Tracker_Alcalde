#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extrae la matriz de obras del Gabinete Territorial Los Chillos (xlsx) y la
normaliza a un seed JSON + script SQL listo para PostgreSQL.

Fuente: "Matriz_obras_ejecutadas y planificadas Valle de los Chillos ...RV 2026.xlsx"
Genera:
  - ../seed/obras_matriz.json      (carga para el fallback in-memory de db.js)
  - ../seed/insert_obras.pg.sql    (INSERTs para PostgreSQL)
  - src/assets/fotos/obra_N.ext    (foto única de cada obra extraída del xlsx)
"""
import json
import os
import re
import sys
import unicodedata

import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEED_DIR = os.path.join(ROOT, "seed")
FOTOS_DIR = os.path.join(os.path.dirname(ROOT), "src", "assets", "fotos")
SCRIPT = os.path.join(ROOT, "scripts", "extract_matriz.py")
MATRIZ = os.path.join(
    os.path.dirname(os.path.dirname(ROOT)),
    "Matriz_obras_ejecutadas y planificadas Valle de los Chillos fin(4)rv2ffff3RV 2026.xlsx",
)

COL_N = 0
COL_PARROQUIA = 2
COL_NOMBRE = 3
COL_ANIO = 5
COL_MONTO = 6
COL_IC = 7
COL_PP = 8
COL_OTRO = 9
COL_ESTADO = 10
COL_PAGADO_2026 = 12
COL_UBICACION = 13
COL_LINK = 14

PARROQUIA_IDS = {
    "CONOCOTO": 1,
    "AMAGUANA": 2,
    "PINTAG": 3,
    "LA MERCED": 4,
    "ALANGASI": 5,
    "GUANGOPOLO": 6,
}
PARROQUIA_NOMBRES = {
    1: "Conocoto",
    2: "Amaguaña",
    3: "Píntag",
    4: "La Merced",
    5: "Alangasí",
    6: "Guangopolo",
}
ESTADO_MAP = {
    "ENTREGADA": "entregada",
    "CONCLUIDA": "concluida",
    "SUSPENDIDA": "suspendida",
    "EN PROCESO": "en_proceso",
    "EN PROGRESO": "en_proceso",
}

ESTADO_PAGO_MAP = {
    "ENVIADO PARA EL PAGO": "enviado_pago",
    "DEVENGADO": "devengado",
    "ARRASTRE A 2025": "arrastre_2025",
}

WARNINGS = []


def clean(value):
    if value is None:
        return ""
    return " ".join(str(value).replace("\r\n", " ").replace("\n", " ").split())


def norm_key(value):
    s = clean(value).upper()
    return "".join(
        c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn"
    )


def to_num(value):
    if value is None or value == "":
        return None
    if isinstance(value, (int, float)):
        return value
    try:
        return float(str(value).replace(",", ".").replace("$", "").strip())
    except ValueError:
        return None


def pick_source(row):
    """Determina la fuente de financiamiento a partir de IC/PP/OTRO."""
    ic = to_num(row[COL_IC])
    pp = to_num(row[COL_PP])
    otro = to_num(row[COL_OTRO])
    if ic and not pp and not otro:
        return "IC"
    if pp and not ic and not otro:
        return "PP"
    if otro and not ic and not pp:
        return "OTROS"
    if ic and pp:
        return "IC/PP"
    if ic and otro:
        return "IC/OTROS"
    if pp and otro:
        return "PP/OTROS"
    if ic and pp and otro:
        return "IC/PP/OTROS"
    return None


def pick_estado_pago(row):
    value = clean(row[COL_PAGADO_2026])
    if not value:
        return None
    estado = ESTADO_PAGO_MAP.get(value.upper())
    if estado:
        return estado
    WARNINGS.append(f"Fila {row[COL_N]}: 'PAGADO EN 2026' con estado no mapeado '{value}' -> null.")
    return None


def extract_fotos(ws):
    """Mapea filas (0-based) -> imagen PNG/JPEG convirtiendo los WMF a JPEG.

    Las imágenes de la columna 12 (COL, 0-based=11) son las fotos de cada
    obra. Cada foto está anclada en la misma fila física de su obra.
    """
    fotos = {}
    for img in ws._images:
        if img.anchor._from.col != 11:
            continue
        row = img.anchor._from.row
        if row < 8:
            continue
        data = img.ref.getvalue()
        fmt = (img.format or "").lower()
        if fmt in ("jpeg", "jpg"):
            ext = "jpg"
        elif fmt == "png":
            ext = "png"
        elif fmt == "wmf":
            WARNINGS.append(f"Fila {row}: foto WMF sin convertir (no soportada) -> sin foto.")
            continue
        else:
            ext = "jpg"
        fotos[row] = (data, ext)
    return fotos


def main():
    if not os.path.exists(MATRIZ):
        print(f"NO ENCONTRADO: {MATRIZ}")
        print("Copia el xlsx de la matriz RV 2026 a la carpeta JOSE o edita SCRIPT/MATRIZ.")
        sys.exit(1)

    wb = openpyxl.load_workbook(MATRIZ, data_only=True)
    ws = wb["OBRAS REALIZADAS"]
    rows = list(ws.iter_rows(values_only=True))
    fotos = extract_fotos(ws)
    wb.close()

    os.makedirs(SEED_DIR, exist_ok=True)

    obras = []
    for i, row in enumerate(rows[8:]):
        if not any(x is not None for x in row[1:8]):
            continue
        n = len(obras) + 1
        parr_key = norm_key(row[COL_PARROQUIA])
        id_parroquia = PARROQUIA_IDS.get(parr_key)
        if not id_parroquia:
            WARNINGS.append(f"Fila {row[COL_N]}: parroquia desconocida '{row[COL_PARROQUIA]}'.")
            continue
        descripcion = clean(row[COL_NOMBRE]) or "Obra sin descripción"
        monto = to_num(row[COL_MONTO])
        anio = clean(row[COL_ANIO])
        try:
            anio = int(float(anio)) if anio else None
        except ValueError:
            anio = None
        estado = ESTADO_MAP.get(clean(row[COL_ESTADO]).upper())
        if not estado:
            WARNINGS.append(f"Fila {row[COL_N]}: estado '{row[COL_ESTADO]}' sin mapeo -> en_proceso.")
            estado = "en_proceso"

        url_imagen = None
        foto = fotos.get(i + 8)
        if foto:
            data, ext = foto
            fname = f"obra_{n}.{ext}"
            os.makedirs(FOTOS_DIR, exist_ok=True)
            with open(os.path.join(FOTOS_DIR, fname), "wb") as fh:
                fh.write(data)
            url_imagen = f"assets/fotos/{fname}"

        obras.append(
            {
                "id_obra": n,
                "id_parroquia": id_parroquia,
                "parroquia_nombre": PARROQUIA_NOMBRES[id_parroquia],
                "barrio_sector": clean(row[COL_UBICACION]) or "Barrio por definir",
                "descripcion": descripcion,
                "monto_inversion": monto,
                "estado": estado,
                "anio_ejecucion": anio,
                "fuente_financiamiento": pick_source(row),
                "estado_pago": pick_estado_pago(row),
                "url_mapa": clean(row[COL_LINK]) or None,
                "url_imagen": url_imagen,
                "latitud": None,
                "longitud": None,
                "codigo_contrato": f"MAT-{row[COL_N] or n}",
            }
        )

    json_path = os.path.join(SEED_DIR, "obras_matriz.json")

    # Preservar coordenadas ya resueltas (por scripts/resolve_coords.js) en una
    # re-ejecución, para no perder la georreferenciación manual del seed.
    coords_prev = {}
    try:
        with open(json_path, "r", encoding="utf-8") as fh:
            for prev in json.load(fh):
                if prev.get("latitud") is not None and prev.get("longitud") is not None:
                    coords_prev[prev["id_obra"]] = (prev["latitud"], prev["longitud"])
    except (OSError, ValueError):
        pass
    for o in obras:
        if o["id_obra"] in coords_prev:
            o["latitud"], o["longitud"] = coords_prev[o["id_obra"]]

    with open(json_path, "w", encoding="utf-8") as fh:
        json.dump(obras, fh, ensure_ascii=False, indent=1)

    restore_nota = ""
    if coords_prev:
        restore_nota = " (+resolve_coords.js)"

    sql_path = os.path.join(SEED_DIR, "insert_obras.pg.sql")
    with open(sql_path, "w", encoding="utf-8") as fh:
        fh.write(f"-- INSERTs generados desde la matriz (RV 2026) por scripts/extract_matriz.py{restore_nota}\n")
        fh.write("-- Las parroquias deben existir (ids 1-6 = Conocoto, Amaguaña, Píntag, La Merced, Alangasí, Guangopolo).\n\n")
        for o in obras:
            esc = lambda s: s.replace("'", "''")
            barrio = esc(o["barrio_sector"])
            desc = esc(o["descripcion"] or "Obra sin descripción")
            ff = o["fuente_financiamiento"] and f"'{o['fuente_financiamiento']}'" or "NULL"
            pg = o["estado_pago"] and f"'{o['estado_pago']}'" or "NULL"
            url = o["url_mapa"] and f"'{esc(o['url_mapa'])}'" or "NULL"
            monto = o["monto_inversion"] if o["monto_inversion"] is not None else "NULL"
            anio = o["anio_ejecucion"] if o["anio_ejecucion"] is not None else "NULL"
            img = o["url_imagen"] and f"'{o['url_imagen']}'" or "NULL"
            cc = esc(o["codigo_contrato"])
            lat = o["latitud"] if o["latitud"] is not None else "NULL"
            lng = o["longitud"] if o["longitud"] is not None else "NULL"
            fh.write(
                f"INSERT INTO obra (id_parroquia, barrio_sector, descripcion, monto_inversion, estado, anio_ejecucion, fuente_financiamiento, estado_pago, url_mapa, url_imagen, latitud, longitud, codigo_contrato) VALUES "
                f"({o['id_parroquia']}, '{barrio}', '{desc}', {monto}, '{o['estado']}', {anio}, {ff}, {pg}, {url}, {img}, {lat}, {lng}, '{cc}');\n"
            )

    print(f"Fotos extraídas: {len([o for o in obras if o['url_imagen']])} de {len(obras)} obras")
    print(f"Coordenadas preservadas: {len(coords_prev)}")
    print(f"JSON  -> {json_path}")
    print(f"SQL   -> {sql_path}")
    print(f"FOTOS -> {FOTOS_DIR}")
    if WARNINGS:
        print("\nAnomalías detectadas durante la extracción:")
        for w in WARNINGS:
            print(" -", w)
    else:
        print("Sin anomalías.")


if __name__ == "__main__":
    main()
