const CACHE = '2day-v12.0.2-guidance-modal';
const SHELL = ['./', './index.html', './manifest.webmanifest', './assets/programs.js', './assets/share.js', './assets/calendar.js', './assets/calendar-links.js', './assets/app-update.js', './assets/program-acceptance.js', './assets/vendor/qrcode.js'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL.map(path => new Request(path, {cache:'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('2day-') && key !== CACHE).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || (url.pathname.startsWith('/api/') || url.pathname.includes('/calendar/') || url.pathname.endsWith('/update.html'))) return;
  event.respondWith(fetch(event.request, {cache:'no-cache'}).then(response => {
    if (response.ok) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy)));
    }
    return response;
  }).catch(async () => {
    const cached = await caches.match(event.request);
    return cached || new Response('Offline. Reconnect to load this resource.', { status: 503 });
  }));
});
