const CACHE_NAME = 'rj-induslift-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-maskable.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  // No cachear el iframe de Google (GAS maneja su propia caché)
  if (event.request.url.indexOf('script.google.com') !== -1 ||
      event.request.url.indexOf('googleusercontent.com') !== -1 ||
      event.request.url.indexOf('google.com') !== -1) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request).then(function(fetchResponse) {
        if (event.request.method === 'GET' && fetchResponse.ok) {
          const responseClone = fetchResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return fetchResponse;
      });
    }).catch(function() {
      return caches.match('./index.html');
    })
  );
});
