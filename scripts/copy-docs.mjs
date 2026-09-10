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

// Copiar también a la raíz del repositorio para compatibilidad total con la opción / (root) de GitHub Pages
copyFileSync(`${dest}/index.html`, `index.html`);
copyFileSync(`${dest}/404.html`, `404.html`);
writeFileSync(`.nojekyll`, '');

console.log('Contenido de docs/browser copiado a docs/ y a la raíz (index.html, 404.html y .nojekyll) para compatibilidad total de GitHub Pages.');