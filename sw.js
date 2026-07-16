const CACHE_NAME = 'panaderia-cache-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './panaderia-logo.png'
];

// Instalación de la PWA
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activación y limpieza de memorias viejas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia Network-First: Busca siempre en internet para mantener Google Sheets actualizado.
// Si no hay conexión, carga la app desde la memoria local.
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Guardamos una copia fresca en caché si la petición es exitosa y no es de Google
        if (response && response.status === 200 && !e.request.url.includes('google')) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla internet, sirve lo que esté en caché
        return caches.match(e.request);
      })
  );
});