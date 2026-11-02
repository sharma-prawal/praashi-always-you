import sharp from 'sharp';
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
async function walk(dir) {
  const files = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(files.map(f => f.isDirectory() ? walk(path.join(dir, f.name)) : /\.(jpe?g|png|webp|avif)$/i.test(f.name) ? [path.join(dir, f.name)] : []))).flat().sort();
}
const files = await walk(process.argv[2] || 'Photos');
await mkdir('.cache', { recursive: true });
await writeFile('.cache/photo-inventory.json', JSON.stringify(files.map((source, index) => ({ index, source })), null, 2));
for (let start = 0; start < files.length; start += 40) {
  const tiles = await Promise.all(files.slice(start, start + 40).map(async (file, i) => {
    const buffer = await sharp(file).rotate().resize(230, 145, { fit: 'contain', background: '#1c1124' }).toBuffer();
    const label = Buffer.from(`<svg width="240" height="25"><text x="5" y="17" font-size="12" fill="#fff8ef">${start + i}: ${path.basename(file).replace(/[<>&]/g, '').slice(0, 26)}</text></svg>`);
    const tile = await sharp({ create: { width: 240, height: 175, channels: 3, background: '#1c1124' } }).composite([{ input: buffer, top: 0, left: 5 }, { input: label, top: 147, left: 0 }]).jpeg().toBuffer();
    return { input: tile, top: Math.floor(i / 5) * 175, left: (i % 5) * 240 };
  }));
  await sharp({ create: { width: 1200, height: 1400, channels: 3, background: '#1c1124' } }).composite(tiles).jpeg().toFile(`.cache/contact-${Math.floor(start / 40) + 1}.jpg`);
}
console.log(`${files.length} photographs; contact sheets written to .cache/`);
