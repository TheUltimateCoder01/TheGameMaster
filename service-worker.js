const CACHE = 'game-master-v2';
const STATIC = [
  '/styles.css',
  '/app.js',
  '/favorites.js',
  '/games/games-data.js',
  '/assets/images/Game Masters Logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(STATIC))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always fetch HTML fresh so updates show immediately
  if (event.request.destination === 'document' || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for everything else (CSS, JS, images)
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
