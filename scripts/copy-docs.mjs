import { readdirSync, cpSync, rmSync, copyFileSync, writeFileSync } from 'node:fs';

const src = 'docs/browser';
const dest = 'docs';

for (const entry of readdirSync(src)) {
  // Copiar a la carpeta docs/
  cpSync(`${src}/${entry}`, `${dest}/${entry}`, { recursive: true, force: true });
  // Copiar también a la raíz / para compatibilidad completa si GitHub Pages sirve desde / (root)
  cpSync(`${src}/${entry}`, `./${entry}`, { recursive: true, force: true });
}

try {
  rmSync(src, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
} catch (e) {
  // Ignorar o registrar error no bloqueante en Windows
  console.warn('Nota: no se pudo eliminar docs/browser inmediatamente:', e.message);
}

// Copiar index.html a 404.html para rutas Angular SPA en ambas ubicaciones
copyFileSync(`${dest}/index.html`, `${dest}/404.html`);
copyFileSync(`${dest}/index.html`, `./404.html`);

// Crear .nojekyll en ambas ubicaciones
writeFileSync(`${dest}/.nojekyll`, '');
writeFileSync(`.nojekyll`, '');

console.log('Contenido compilado desplegado en docs/ y en la raíz (JS, CSS, HTML, 404.html y .nojekyll) para despliegue perfecto en GitHub Pages.');