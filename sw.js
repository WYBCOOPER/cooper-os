/* COOPER OS Service Worker — 网络优先（保证总是最新版） */
const CACHE = 'cooper-os-v10';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 网络优先：先请求网络，失败才用缓存（确保总控台永远最新）
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // API 请求不缓存，直接网络
  if (url.pathname.startsWith('/api/')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
