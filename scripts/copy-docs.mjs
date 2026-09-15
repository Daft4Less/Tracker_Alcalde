import { readdirSync, cpSync, rmSync, copyFileSync, writeFileSync, unlinkSync } from 'node:fs';

const src = 'docs/browser';
const dest = 'docs';

// 1. Limpieza previa de cualquier archivo de compilación antiguo en la raíz y en docs
try {
  const rootFiles = readdirSync('./');
  for (const file of rootFiles) {
    if (
      /^chunk-.*\.js$/.test(file) ||
      /^main-.*\.js$/.test(file) ||
      /^styles-.*\.css$/.test(file) ||
      /^polyfills-.*\.js$/.test(file)
    ) {
      try { unlinkSync(`./${file}`); } catch {}
    }
  }
} catch (err) {
  console.warn('Nota en limpieza previa de raíz:', err.message);
}

// 2. Copiar archivos del nuevo build activo a docs/ y a la raíz (sintronización limpia)
for (const entry of readdirSync(src)) {
  // Copiar a docs/
  cpSync(`${src}/${entry}`, `${dest}/${entry}`, { recursive: true, force: true });
  // Copiar a la raíz ./ para compatibilidad directa con GitHub Pages si sirve desde la raíz
  cpSync(`${src}/${entry}`, `./${entry}`, { recursive: true, force: true });
}

// 3. Limpiar carpeta temporal de compilación intermediaria
try {
  rmSync(src, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
} catch (e) {
  console.warn('Nota: no se pudo eliminar docs/browser inmediatamente:', e.message);
}

// 4. Copiar index.html a 404.html para rutas Angular SPA en ambas ubicaciones
copyFileSync(`${dest}/index.html`, `${dest}/404.html`);
copyFileSync(`${dest}/index.html`, `./404.html`);

// 5. Crear .nojekyll en docs/ y en la raíz
writeFileSync(`${dest}/.nojekyll`, '');
writeFileSync(`.nojekyll`, '');

console.log('Sincronización limpia completada: Archivos activos desplegados en docs/ y en la raíz sin acumulación de chunks obsoletos.');