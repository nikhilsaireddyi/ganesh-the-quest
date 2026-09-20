// Self-destructing & auto-cleanup Service Worker
// Automatically unregisters itself, flushes old caches, and updates client tabs
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      return self.registration.unregister();
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      return self.clients.matchAll({ type: 'window' });
    }).then((clients) => {
      for (const client of clients) {
        // Auto-navigate to fresh URL without stale caches
        client.navigate(client.url);
      }
    })
  );
});

// Pass through all network requests directly
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
