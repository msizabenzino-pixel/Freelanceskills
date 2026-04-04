const CACHE_NAME = 'freelanceskills-v4';
const ADMIN_CACHE = 'freelanceskills-admin-v4';

const STATIC_ASSETS = [
  '/manifest.json',
  '/favcon-fls.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

const ADMIN_ASSETS = [
  '/manifest.json',
  '/favcon-fls.png',
  '/icons/icon-192x192.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS).catch(() => {})),
      caches.open(ADMIN_CACHE).then(cache => cache.addAll(ADMIN_ASSETS).catch(() => {})),
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== ADMIN_CACHE)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // API calls — always network, offline fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ error: 'You are offline', offline: true }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // Hashed versioned assets (/assets/*.js, /assets/*.css) — cache-first (they are immutable)
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(response => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // HTML pages (/, /jobs, /blog, etc.) — always network-first, no caching
  // This prevents stale HTML from breaking the app after deployments
  const isHtml = event.request.headers.get('Accept')?.includes('text/html');
  if (isHtml || url.pathname === '/') {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response('<html><body><h1>You are offline</h1><p>Please reconnect and refresh.</p></body></html>', {
          status: 503,
          headers: { 'Content-Type': 'text/html' }
        })
      )
    );
    return;
  }

  // Static assets (icons, fonts, images) — cache with network update
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        const networkFetch = fetch(event.request).then(response => {
          if (response.ok && (url.protocol === 'http:' || url.protocol === 'https:')) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
        return cached || networkFetch;
      })
    )
  );
});

self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'FreelanceSkills Admin', {
      body: data.body || 'Admin alert',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: { url: data.url || '/admin/mobile' },
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/admin/mobile')
  );
});
