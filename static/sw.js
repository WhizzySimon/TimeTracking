const CACHE_PREFIX = 'timetracker-';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/version.json'
];

let CACHE_NAME = CACHE_PREFIX + 'v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    fetch('/version.json')
      .then((response) => response.json())
      .then((versionInfo) => {
        CACHE_NAME = CACHE_PREFIX + versionInfo.version + '-' + versionInfo.buildTime;
        return caches.open(CACHE_NAME);
      })
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/');
      })
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data === 'CHECK_UPDATE') {
    fetch('/version.json', { cache: 'no-store' })
      .then((response) => response.json())
      .then((versionInfo) => {
        const newCacheName = CACHE_PREFIX + versionInfo.version + '-' + versionInfo.buildTime;
        if (newCacheName !== CACHE_NAME) {
          self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({ type: 'UPDATE_AVAILABLE', version: versionInfo.version });
            });
          });
        }
      })
      .catch(() => {});
  }
  
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
