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
// Cache the shell and one modest image initially; other photos cache as viewed. Music stays network-only.
const precache = files.filter(f => (!f.includes('/photos/') && !f.includes('/letters/') && !f.includes('/audio/')) || f.endsWith('photo-01-480.webp')).map(f => './' + f.slice(5));
await writeFile('dist/sw.js', `
const CACHE='praashi-${version}';
const SHELL=${JSON.stringify(precache)};
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('praashi-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 // Media needs native range requests, and a partial response cannot be cached.
 if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.includes('/audio/')||request.headers.has('range'))return;
 event.respondWith(caches.open(CACHE).then(async cache=>{
  if(request.mode==='navigate'){
   // Always prefer the latest page; a poor signal falls back to the saved one rather than hanging.
   const saved=await cache.match('./index.html');
   const network=fetch(request).then(response=>{if(response.ok)event.waitUntil(cache.put('./index.html',response.clone()));return response;});
   if(!saved)return network;
   const slow=new Promise(resolve=>setTimeout(()=>resolve(saved),4000));
   return Promise.race([network,slow]).catch(()=>saved);
  }
  const hit=await cache.match(request);
  if(hit)return hit;
  const response=await fetch(request);
  if(response.ok)event.waitUntil(cache.put(request,response.clone()));
  return response;
 }));
});
`);
console.log(`Offline shell generated: ${version}, ${precache.length} assets. Photos and letter screenshots cache on view.`);
