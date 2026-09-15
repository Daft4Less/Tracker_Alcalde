import { readdirSync, cpSync, rmSync, copyFileSync, writeFileSync, unlinkSync } from 'node:fs';

const src = 'docs/browser';
const dest = 'docs';

// Limpieza previa de archivos de compilación sueltos antiguos en la raíz
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

for (const entry of readdirSync(src)) {
  // Copiar a la carpeta docs/ (directorio oficial para GitHub Pages)
  cpSync(`${src}/${entry}`, `${dest}/${entry}`, { recursive: true, force: true });
}

try {
  rmSync(src, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
} catch (e) {
  console.warn('Nota: no se pudo eliminar docs/browser inmediatamente:', e.message);
}

// Copiar index.html a 404.html para rutas Angular SPA
copyFileSync(`${dest}/index.html`, `${dest}/404.html`);
copyFileSync(`${dest}/index.html`, `./404.html`);

// Crear .nojekyll en docs/ y raíz
writeFileSync(`${dest}/.nojekyll`, '');
writeFileSync(`.nojekyll`, '');

console.log('Contenido compilado desplegado limpiamente en docs/ (JS, CSS, HTML, 404.html y .nojekyll) para GitHub Pages.');