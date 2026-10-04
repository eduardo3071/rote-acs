// RoteACS service worker: caches the app shell so launching the installed
// PWA with no connection shows the app instead of the browser's offline
// error page. Data offline-support (families cache, sync queue) is handled
// separately in src/lib/territory.ts via localStorage — this file only
// covers the navigation shell.
const CACHE = "roteacs-shell-v1";
const SHELL_URL = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(SHELL_URL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(fetch(event.request).catch(() => caches.match(SHELL_URL)));
});

// Offline voice model (Vosk): cache-first so speech recognition works without
// internet after the first download. Separate from the navigation shell above.
const MODEL_CACHE = "roteacs-vosk-model-v1";
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET") return;
  if (!url.pathname.includes("vosk-model-small-pt")) return;
  event.respondWith(
    caches.open(MODEL_CACHE).then(async (cache) => {
      const hit = await cache.match(event.request);
      if (hit) return hit;
      const res = await fetch(event.request);
      if (res.ok) cache.put(event.request, res.clone());
      return res;
    }),
  );
});
