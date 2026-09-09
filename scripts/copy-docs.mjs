import { readdirSync, cpSync, rmSync } from 'node:fs';

const src = 'docs/browser';
const dest = 'docs';

for (const entry of readdirSync(src)) {
  cpSync(`${src}/${entry}`, `${dest}/${entry}`, { recursive: true, force: true });
}
rmSync(src, { recursive: true, force: true });
console.log('Contenido de docs/browser copiado a docs/ para GitHub Pages.');