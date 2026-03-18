const CACHE_NAME = 'freelanceskills-v3';
const ADMIN_CACHE = 'freelanceskills-admin-v3';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.png'
];

const ADMIN_ASSETS = [
  '/admin/mobile',
  '/admin',
  '/manifest.json',
  '/favicon.png',
  '/icons/icon-192x192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)),
      caches.open(ADMIN_CACHE).then(cache => cache.addAll(ADMIN_ASSETS).catch(() => {})),
    ])
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== ADMIN_CACHE)
          .map(name => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // API calls — network first, offline error fallback
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

  // Admin routes — cache first for offline support
  if (url.pathname.startsWith('/admin')) {
    event.respondWith(
      caches.open(ADMIN_CACHE).then(cache =>
        fetch(event.request)
          .then(response => {
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => cache.match(event.request).then(r => r || caches.match('/')))
      )
    );
    return;
  }

  // Everything else — stale-while-revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      fetch(event.request)
        .then(response => {
          cache.put(event.request, response.clone());
          return response;
        })
        .catch(() =>
          cache.match(event.request).then(r => r || caches.match('/'))
        )
    )
  );
});

// Push notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || '🛡️ FreelanceSkills Admin', {
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
