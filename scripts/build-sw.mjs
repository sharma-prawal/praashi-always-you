import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
async function walk(dir) {
  const items = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(items.map(e => e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`]))).flat();
}
const files = (await walk('dist')).filter(f => !f.endsWith('/sw.js'));
const hash = createHash('sha256');
for (const f of files) hash.update(await readFile(f));
const version = hash.digest('hex').slice(0, 12);
// Cache the shell and one modest image initially; other photos cache as viewed.
const precache = files.filter(f => (!f.includes('/photos/') && !f.includes('/letters/')) || f.endsWith('photo-01-480.webp')).map(f => './' + f.slice(5));
await writeFile('dist/sw.js', `
const CACHE='praashi-${version}';
const SHELL=${JSON.stringify(precache)};
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('praashi-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
 event.respondWith(caches.open(CACHE).then(async cache=>{
  const hit=await cache.match(request);
  if(hit)return hit;
  try{const response=await fetch(request);if(response.ok)event.waitUntil(cache.put(request,response.clone()));return response;}
  catch{if(request.mode==='navigate')return (await cache.match('./index.html'))||Response.error();return Response.error();}
 }));
});
`);
console.log(`Offline shell generated: ${version}, ${precache.length} assets. Photos and letter screenshots cache on view.`);
