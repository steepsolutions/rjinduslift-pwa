/* sw.js — App shell offline-first con actualización atómica */
const CACHE_NAME = 'rj-induslift-v32';   // SUBIR en cada despliegue
const SHELL = [
  './', './index.html', './manifest.json', './app.css', './api.js', './core.js', './admin.js',
  './iconos.js', './tema.js', './politicas.html', './assets/icon-192.png', './assets/icon-512.png', './assets/icon-maskable.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      // addAll es atómico; 'reload' salta la caché HTTP de GitHub Pages (max-age=600)
      .then(function (cache) {
        return cache.addAll(SHELL.map(function (url) { return new Request(url, { cache: 'reload' }); }));
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (claves) {
        return Promise.all(claves.filter(function (c) { return c !== CACHE_NAME; })
          .map(function (c) { return caches.delete(c); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  const req = event.request;
  if (req.method !== 'GET') return;                        // login, envíos, etc.: nunca se interceptan
  if (new URL(req.url).origin !== self.location.origin) return;   // API de Google y terceros: directo a la red

  event.respondWith(
    caches.match(req, { ignoreSearch: req.mode === 'navigate' }).then(function (cacheada) {
      if (cacheada) return cacheada;                       // shell: respuesta inmediata, sin red
      return fetch(req).catch(function () {
        return req.mode === 'navigate'
          ? caches.match('./index.html')
          : new Response('', { status: 504, statusText: 'Sin conexión' });
      });
    })
  );
});
