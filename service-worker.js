self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('game-master-cache').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/app.js',
        '/favorites.js',
        '/games/games-data.js',
        '/assets/images/Game Masters Logo.png'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
}); 