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
