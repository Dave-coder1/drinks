/* Build-generated app-shell cache. Personal data is never handled here. */
const BUILD_ID="7291b7e2eab18ccc";
const FILES=[{"url":"assets/index-B8yaAoCV.js","sha256":"fdc5306c59a464aabcc52813f34409baac8306c93e0788f5097cc9e58efaafe0"},{"url":"assets/index-sGcl82r6.css","sha256":"ae1280e3071fc64c8ce203df39d60cf26b30f93baa276966686b3adb2b8383fd"},{"url":"build-info.json","sha256":"f7ec46b487ba75f66c9a1e71b9276a4a67fb819a69e43865b15015f8d691fe88"},{"url":"icons/apple-touch-icon.png","sha256":"ac319fc65b975e0776bcc7a3d5e6137e40594d31859ee9e6dc51774b5bbd7c52"},{"url":"icons/favicon.svg","sha256":"dbabb923976fe8ab22970cad43ecbac180b279c1e99aa9972b27de84d04f4f12"},{"url":"icons/icon-192.png","sha256":"eb68f68c5ad17e42615c182af19690f52a8187d6cb6578c463fab2e8daaaff60"},{"url":"icons/icon-512.png","sha256":"e8aaa2a440b65613d2857b5e36b4724a2f6449c72b776370f8ce472c539e64d3"},{"url":"icons/maskable-512.png","sha256":"5ef882d870df7e215583ff32ada24c551aa6f9fc6583ff2ccd16f0c77f3117dc"},{"url":"index.html","sha256":"552faa14942acead41189c3944bd7138b51de3b683c5edd6e052e7016ce3cc3d"},{"url":"manifest.webmanifest","sha256":"c017bfb200d1bfcb9d2f42f072fbb94c12f8fbf3f2893977dc037b773426958c"}];
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
