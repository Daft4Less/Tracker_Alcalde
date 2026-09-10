import { readdirSync, cpSync, rmSync, copyFileSync, writeFileSync } from 'node:fs';

const src = 'docs/browser';
const dest = 'docs';

for (const entry of readdirSync(src)) {
  cpSync(`${src}/${entry}`, `${dest}/${entry}`, { recursive: true, force: true });
}
rmSync(src, { recursive: true, force: true });

// Copiar index.html a 404.html para soporte de rutas SPA en GitHub Pages
copyFileSync(`${dest}/index.html`, `${dest}/404.html`);

// Crear .nojekyll en docs para evitar que GitHub Pages ignore carpetas
writeFileSync(`${dest}/.nojekyll`, '');

console.log('Contenido de docs/browser copiado a docs/, 404.html y .nojekyll generados para GitHub Pages.');