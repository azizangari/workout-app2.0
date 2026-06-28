/* Rest timer + always fetch fresh HTML when online. Version: 2025.06.27-5 */
const REST_DONE_TAG = 'rest-done';
const REST_TIMER_TAG = 'rest-timer';

let restAlarmId = null;

function clearRestAlarm() {
  if (restAlarmId != null) {
    clearTimeout(restAlarmId);
    restAlarmId = null;
  }
}

function closeTagged(tag) {
  return self.registration.getNotifications({ tag }).then((list) => {
    list.forEach((n) => n.close());
  });
}

function scheduleRestAlarm(endAt, exerciseName) {
  clearRestAlarm();
  const delay = Math.max(0, endAt - Date.now());
  restAlarmId = setTimeout(() => {
    restAlarmId = null;
    self.registration.showNotification('Rest complete', {
      body: exerciseName ? `Next set — ${exerciseName}` : 'Time for your next set',
      tag: REST_DONE_TAG,
      vibrate: [180, 90, 180, 90, 280],
      requireInteraction: true,
      silent: false,
    });
  }, delay);
}

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || !data.type) return;

  if (data.type === 'REST_TIMER_SCHEDULE') {
    scheduleRestAlarm(data.endAt, data.exerciseName);
    return;
  }

  if (data.type === 'REST_TIMER_CLEAR') {
    clearRestAlarm();
    closeTagged(REST_TIMER_TAG);
    closeTagged(REST_DONE_TAG);
    return;
  }

  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.pathname.endsWith('/index.html') || url.pathname.endsWith('/')) {
    event.respondWith(fetch(event.request));
  }
});
