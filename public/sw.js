// Love Days — Service Worker
const CACHE = 'love-days-v1';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(['/', '/manifest.json', '/icon-192.png']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => cached ?? fetch(e.request))
  );
});

// 通知クリック: アプリを前面に
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ('focus' in client) { client.focus(); return; }
      }
      if (clients.openWindow) clients.openWindow('/home');
    })
  );
});

// Periodic Background Sync（対応ブラウザのみ）
self.addEventListener('periodicsync', e => {
  if (e.tag === 'love-days-daily-check') {
    e.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(list => {
        // アプリが開いていない場合のみ後続処理（開いていれば foreground で通知済み）
        if (list.length === 0) {
          // バックグラウンドではデータアクセスできないため、ユーザーが次回開いたときに通知される
        }
      })
    );
  }
});
