/* Build-generated app-shell cache. Personal data is never handled here. */
const BUILD_ID="9dd1c16d34f0659f";
const FILES=[{"url":"assets/index-BlGdktfK.css","sha256":"69217b3448ab77ba1e873b3539c4ff49be59b5738023ed32f4d8c4d7317cea33"},{"url":"assets/index-TKDtzRPv.js","sha256":"fe96179512655fb8da8cbe58e999c4456a41db0dcf99ed915a1d36467fea80ac"},{"url":"build-info.json","sha256":"91c2d9f60d5fd6867f8dc42b9848fd314dd719fbbdf09e0c21ebe10575708f96"},{"url":"icons/apple-touch-icon.png","sha256":"ac319fc65b975e0776bcc7a3d5e6137e40594d31859ee9e6dc51774b5bbd7c52"},{"url":"icons/favicon.svg","sha256":"dbabb923976fe8ab22970cad43ecbac180b279c1e99aa9972b27de84d04f4f12"},{"url":"icons/icon-192.png","sha256":"eb68f68c5ad17e42615c182af19690f52a8187d6cb6578c463fab2e8daaaff60"},{"url":"icons/icon-512.png","sha256":"e8aaa2a440b65613d2857b5e36b4724a2f6449c72b776370f8ce472c539e64d3"},{"url":"icons/maskable-512.png","sha256":"5ef882d870df7e215583ff32ada24c551aa6f9fc6583ff2ccd16f0c77f3117dc"},{"url":"index.html","sha256":"ba7df2c55c6b48b3e549fc11f41adccde7098437d7fbc992c313fb9c4394840f"},{"url":"manifest.webmanifest","sha256":"c017bfb200d1bfcb9d2f42f072fbb94c12f8fbf3f2893977dc037b773426958c"}];
const BASE=new URL('./',self.location.href);
const PREFIX='drinks-shell:'+encodeURIComponent(BASE.pathname)+':';
const CACHE=PREFIX+BUILD_ID;
const STATIC=new Map(FILES.map(file=>[new URL(file.url,BASE).href,file]));
const clientBuilds=new Map();

function inScope(url){return url.origin===BASE.origin&&url.pathname.startsWith(BASE.pathname);}
async function scopedClients(){return (await self.clients.matchAll({type:'window',includeUncontrolled:true})).filter(client=>inScope(new URL(client.url)));}
async function reportAndPrune(){
  const clients=await scopedClients();
  for(const client of clients)if(!clientBuilds.has(client.id))client.postMessage({type:'DRINKS_REPORT_BUILD'});
  // Unknown clients may still be running an older bundle. Retain its files.
  if(clients.some(client=>!clientBuilds.has(client.id)))return;
  const keep=new Set([CACHE,...clients.map(client=>PREFIX+clientBuilds.get(client.id))]);
  for(const name of await caches.keys())if(name.startsWith(PREFIX)&&!keep.has(name))await caches.delete(name);
}
async function verifiedResponse(file){
  const url=new URL(file.url,BASE),response=await fetch(new Request(url,{cache:'reload',credentials:'same-origin',mode:'same-origin'}));
  if(!response.ok||response.type==='opaque'||response.url!==url.href)throw new Error('App file could not be downloaded: '+file.url);
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await response.clone().arrayBuffer())),n=>n.toString(16).padStart(2,'0')).join('');
  if(hash!==file.sha256)throw new Error('App file failed verification: '+file.url);
  return [url.href,response];
}
self.addEventListener('install',event=>event.waitUntil((async()=>{
  // Validate every response before writing. A failed update leaves the active
  // worker and its cache in place, including when quota prevents installation.
  const responses=await Promise.all(FILES.map(verifiedResponse)),existed=await caches.has(CACHE);
  try{const cache=await caches.open(CACHE);await Promise.all(responses.map(([url,response])=>cache.put(url,response)));}
  catch(error){if(!existed)await caches.delete(CACHE);throw error;}
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  await self.clients.claim();
  for(const client of await scopedClients()){client.postMessage({type:'DRINKS_ACTIVE_BUILD',buildId:BUILD_ID});client.postMessage({type:'DRINKS_REPORT_BUILD'});}
  await reportAndPrune();
})()));
self.addEventListener('message',event=>{
  const source=event.source;
  if(!source||!('url' in source)||!inScope(new URL(source.url)))return;
  if(event.data?.type==='DRINKS_SKIP_WAITING'){event.waitUntil(self.skipWaiting());return;}
  if(event.data?.type==='DRINKS_CLIENT_BUILD'&&/^[A-Za-z0-9._-]{1,64}$/.test(event.data.buildId)){
    clientBuilds.set(source.id,event.data.buildId);
    source.postMessage({type:'DRINKS_ACTIVE_BUILD',buildId:BUILD_ID});
    event.waitUntil(reportAndPrune());
  }
});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||!inScope(url))return;
  const entry=url.pathname===BASE.pathname||url.pathname===BASE.pathname+'index.html';
  if(request.mode==='navigate'&&entry){event.respondWith((async()=>await (await caches.open(CACHE)).match(new URL('index.html',BASE).href)||fetch(request))());return;}
  if(!url.search&&STATIC.has(url.href)){event.respondWith((async()=>await (await caches.open(CACHE)).match(url.href)||fetch(request))());return;}
  // Older open tabs keep their own hashed JS/CSS until they choose to reload.
  // This only reads previously verified app caches; it never caches responses.
  if(!url.search&&url.pathname.startsWith(BASE.pathname+'assets/')&&/\.[A-Za-z0-9]+$/.test(url.pathname)&&/\.(?:js|css)$/.test(url.pathname)){
    event.respondWith((async()=>{
      for(const name of await caches.keys())if(name.startsWith(PREFIX)){const response=await (await caches.open(name)).match(url.href);if(response)return response;}
      return fetch(request);
    })());
  }
});
