const CACHE_NAME = 'workout-cache-v6';

const PRECACHE_URLS = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'manifest.json',
  'data/workout-data.json',
  'icons/apple-touch-icon.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-512-maskable.png',
  'icons/exercises/barbell-back-squat.png',
  'icons/exercises/dumbbell-standing-calf-raises.png',
  'icons/exercises/dumbbell-bulgarian-split-squat.png',
  'icons/exercises/abs-leg-raises.png',
  'icons/exercises/dumbbell-row.png',
  'icons/exercises/dumbbell-rear-delt-fly.png',
  'icons/exercises/dumbbell-hammer-curl.png',
  'icons/exercises/wide-grip-weighted-pull-up.png',
  'icons/exercises/dumbbell-front-squat.png',
  'icons/exercises/dumbbell-stationary-lunge.png',
  'icons/exercises/dumbbell-single-leg-rdl.png',
  'icons/exercises/dumbbell-globet-squat.png',
  'icons/exercises/abs-weighted-knee-raises.png',
  'icons/exercises/dumbbell-shoulder-press.png',
  'icons/exercises/dumbbell-tricep-overhead-extension.png',
  'icons/exercises/dumbbell-lateral-raises.png',
  'icons/exercises/dumbbell-incline-bench-press.png',
  'icons/exercises/weighted-dips.png',
  'icons/exercises/dumbbell-romain-deadlift.png',
  'icons/exercises/dumbbell-reverse-lunge.png',
  'icons/exercises/seated-calf-raises.png',
  'icons/exercises/glute-bridge.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
