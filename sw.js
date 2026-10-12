const CACHE_NAME = 'rj-induslift-v2';
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
  const url = event.request.url;

  // 1. NO interceptar llamadas a Google (Apps Script, APIs, etc.)
  if (url.indexOf('script.google.com') !== -1 ||
      url.indexOf('googleusercontent.com') !== -1 ||
      url.indexOf('google.com') !== -1) {
    return; // Dejar que el navegador maneje la petición normalmente
  }

  // 2. Para el resto, usar caché primero, luego red
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        return response; // Devolver desde caché
      }
      return fetch(event.request).then(function(fetchResponse) {
        // Solo cachear peticiones GET exitosas
        if (event.request.method === 'GET' && fetchResponse.ok) {
          const responseClone = fetchResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return fetchResponse;
      });
    }).catch(function() {
      // Solo devolver index.html si la petición es para una página HTML
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
      // Para otros recursos, devolver un error limpio
      return new Response('', { status: 404, statusText: 'Not Found' });
    })
  );
});
