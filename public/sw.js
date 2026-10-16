// WTFTI service worker: daily reminder notifications only (no offline caching).
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) { /* plain-text payload */ }
  const title = data.title || '你的今日卡到了';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || '今天的运势、穿搭色和一句妆容建议，都在这里。',
      icon: '/favicon.svg',
      tag: 'wtfti-daily',
      data: { url: data.url || '/today/?utm_source=push' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url;
  event.waitUntil(self.clients.openWindow(url || '/today/'));
});
