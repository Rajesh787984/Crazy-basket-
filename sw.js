const CACHE_NAME = 'crazy-basket-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com', // Cache Tailwind CSS
  // AI studio files are loaded from here
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js",
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js",
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"
];

// Install: Caches core static assets needed for the app shell.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache. Caching app shell...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()) // Activate new service worker immediately
  );
});

// Activate: Cleans up old caches.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all open clients
  );
});

// Fetch: Implements a network-first strategy for navigation requests,
// falling back to cache. For other assets, it uses a cache-first strategy.
self.addEventListener('fetch', event => {
  const { request } = event;

  // For navigation requests (HTML pages), use Network First to get latest content.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // If fetch is successful, clone it and put it in the cache.
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try to get it from the cache.
          return caches.match(request);
        })
    );
    return;
  }

  // For other requests (JS, CSS, images, etc.), use Cache First for speed.
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // Return from cache if found.
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from network, cache it, and return the response.
        return fetch(request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
  );
});
