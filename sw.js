// sw.js - For GitHub Pages
const CACHE_NAME = 'noten-v2';

// 🔥 IMPORTANT: Change this to match your GitHub repo name
const BASE_PATH = '/noten-pwa'; // Replace 'noten-pwa' with YOUR repo name

const ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/icon.svg`,
  `${BASE_PATH}/icon-192.png`,
  `${BASE_PATH}/icon-512.png`
];

// Install - Cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Saving app files for offline');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Fetch - Serve cached files
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip requests that aren't HTTP/HTTPS
  if (!event.request.url.startsWith('http')) return;

  // Handle GitHub Pages specific paths
  const url = new URL(event.request.url);
  
  // If requesting the root of your site, serve index.html
  if (url.pathname === '/' || url.pathname === '') {
    event.respondWith(
      caches.match(`${BASE_PATH}/index.html`)
        .then(response => response || fetch(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse; // Use cached version
        }
        return fetch(event.request)
          .then(response => {
            // Cache new files automatically
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          })
          .catch(() => {
            // Offline fallback
            return new Response('Offline - Please connect to internet', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Activate - Clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});
