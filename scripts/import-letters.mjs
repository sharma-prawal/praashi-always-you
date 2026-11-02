import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

// Local, lossless conversion only. The supplied manifest and PNG files are never written.
const source = JSON.parse(await readFile('letters-manifest.json', 'utf8'));
const greetings = {
  '2021-03-07': 'Dearest Nikku😇,',
  '2021-04-05': 'To meri Nikku❤️,',
  '2021-05-20': 'To my love Nikku❤️,',
  '2021-06-19': 'To my love Nikku❤️,',
  '2021-07-15': 'To my love Nikku❤️,',
  '2021-08-28': 'To my love Nikku❤️,',
  '2021-09-17': 'To my love Nikku❤️,',
  '2021-10-15': 'To my love Nikku❤️,',
  '2021-11-30': 'To my love Nikku❤️,',
  '2021-12-22': 'To my love Nikku❤️,',
};
await mkdir('public/letters/2021', { recursive: true });
await mkdir('public/letters/2021/originals', { recursive: true });
const letters = [];
for (const letter of [...source.letters].sort((a, b) => a.date.localeCompare(b.date))) {
  if (!/^letters\/2021\/2021-\d{2}-\d{2}\.png$/.test(letter.image) || letter.isFullLetter !== false) throw new Error('Invalid letter source');
  const input = await readFile(letter.image);
  const metadata = await sharp(input).metadata();
  const image = letter.image.replace(/\.png$/, '.webp');
  await sharp(input).webp({ lossless: true, effort: 6 }).toFile(`public/${image}`);
  const originalImage = `letters/2021/originals/${letter.date}.png`;
  await copyFile(letter.image, `public/${originalImage}`);
  // Display-only window: keep the source pixels intact and omit embedded phone chrome.
  const top = 520;
  const { data: pixels, info } = await sharp(input).toColourspace('srgb').removeAlpha().raw().toBuffer({ resolveWithObject: true });
  // End in a real inter-line gap above the floating Notes toolbar, never through a glyph.
  // 7 March's sign-off sits just above the toolbar, so its window keeps that last line.
  let bottom = 2300, blank = 0;
  for (let y = 2299; y >= 2100 && letter.date !== '2021-03-07'; y--) {
    let ink = false;
    for (let x = 60; x < 1110 && !ink; x++) {
      const offset = (y * info.width + x) * info.channels;
      ink = pixels[offset] > 40 || pixels[offset + 1] > 40 || pixels[offset + 2] > 40;
    }
    blank = ink ? 0 : blank + 1;
    if (blank >= 12) { bottom = y + 6; break; }
  }
  letters.push({
    date: letter.date, image, width: metadata.width, height: metadata.height,
    originalImage, readingWindow: { left: 60, top, width: 1050, height: bottom - top },
    sourceSha256: createHash('sha256').update(input).digest('hex'),
    greeting: greetings[letter.date] || null,
    // Verified against the visible screenshot: the supplied July excerpt omitted this comma.
    excerpt: letter.date === '2021-07-15' ? 'I love loving you, and nothing can change that.' : letter.selectedExcerpt,
    isFullLetter: false,
  });
}
await writeFile('src/data/letters.json', JSON.stringify(letters, null, 2) + '\n');
console.log(`Imported ${letters.length} letter fragments as lossless WebP. Original PNGs unchanged.`);
