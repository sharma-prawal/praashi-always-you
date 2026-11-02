import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

// Upload only the verified static build, never original photographs or source QA files.
for (const file of ['index.html', 'sw.js', 'manifest.webmanifest']) await readFile(`dist/${file}`);
await rm('.vercel/output', { recursive: true, force: true });
await mkdir('.vercel/output', { recursive: true });
await cp('dist', '.vercel/output/static', { recursive: true });
await writeFile('.vercel/output/config.json', JSON.stringify({
  version: 3,
  routes: [
    { src: '/(.*)', headers: { 'X-Robots-Tag': 'noindex, nofollow' }, continue: true },
    { src: '/sw\\.js', headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }, continue: true },
    { handle: 'filesystem' },
  ],
}, null, 2) + '\n');
console.log('Vercel prebuilt static output prepared from dist/.');
