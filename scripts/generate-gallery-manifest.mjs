// Generate a manifest from the installation photos actually present in /images.
// Runs on Cloudflare during npm run build, so deleted photos never appear in the gallery.
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const imagesRoot = path.join(root, 'images');
const allowed = new Set(['.webp', '.avif', '.png', '.jpg', '.jpeg']);
const paths = [];

async function visit(folder, relative = '') {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name.toLowerCase() === 'clients') continue;
      await visit(path.join(folder, entry.name), path.posix.join(relative, entry.name));
      continue;
    }
    if (!entry.isFile() || !allowed.has(path.extname(entry.name).toLowerCase())) continue;
    if (/logo|favicon|icon|placeholder/i.test(entry.name)) continue;
    paths.push(path.posix.join('images', relative, entry.name));
  }
}

await visit(imagesRoot);
paths.sort();
const target = path.join(root, 'js', 'gallery-manifest.js');
await mkdir(path.dirname(target), { recursive: true });
await writeFile(target,
  '// Generated during the Cloudflare build; do not edit.\\n'.replace('\\n','\n') +
  'window.AIR_HVAC_GALLERY_IMAGES = ' + JSON.stringify(paths, null, 2) + ';\n'
);
console.log('Gallery manifest generated with ' + paths.length + ' available photos.');
