import sharp from 'sharp';
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

// Use --all ./photos for an uncurated import; otherwise honor the reviewed selection.
const allIndex = process.argv.indexOf('--all');
async function discover(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map(e => e.isDirectory() ? discover(path.join(dir, e.name)) : /\.(jpe?g|png|webp|avif)$/i.test(e.name) ? [path.join(dir, e.name)] : []));
  return nested.flat().sort();
}
const selected = allIndex >= 0
  ? (await discover(process.argv[allIndex + 1] || 'Photos')).map((source, i) => ({ id: `photo-${String(i + 1).padStart(2, '0')}`, source, caption: 'My favourite place is beside you.', alt: 'Personal photograph', position: '50% 50%', note: 'Imported automatically; review composition and crop before sharing.' }))
  : JSON.parse(await readFile('scripts/curation.json', 'utf8'));
await mkdir('public/photos', { recursive: true });
await mkdir('src/data', { recursive: true });
const manifest = [];
for (const photo of selected) {
  const image = sharp(photo.source).rotate();
  const meta = await image.metadata();
  const dimensions = meta.autoOrient || meta;
  // No cropping or retouching. Sharp strips EXIF/GPS by default.
  for (const size of [480, 960]) {
    await image.clone().resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true }).webp({ quality: 83, effort: 5 }).toFile(`public/photos/${photo.id}-${size}.webp`);
  }
  await image.clone().resize({ width: 960, height: 960, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 85, mozjpeg: true }).toFile(`public/photos/${photo.id}.jpg`);
  manifest.push({ ...photo, width: dimensions.width, height: dimensions.height, src: `photos/${photo.id}-960.webp`, small: `photos/${photo.id}-480.webp`, fallback: `photos/${photo.id}.jpg` });
}
await writeFile('src/data/photos.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Optimized ${manifest.length} photos. Originals unchanged; metadata removed from copies.`);
