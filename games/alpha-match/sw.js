const CACHE_NAME = "alpha-match-pixel-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./src/game.js",
  "./manifest.webmanifest",
  "./assets/sprites/A.png",
  "./assets/sprites/B.png",
  "./assets/sprites/C.png",
  "./assets/sprites/D.png",
  "./assets/sprites/E.png",
  "./assets/sprites/F.png",
  "./assets/sprites/card-back.png",
  "./assets/sprites/check.png",
  "./assets/sprites/close.png",
  "./assets/sprites/confetti-1.png",
  "./assets/sprites/confetti-2.png",
  "./assets/sprites/confetti-3.png",
  "./assets/sprites/confetti-4.png",
  "./assets/sprites/heart.png",
  "./assets/sprites/home.png",
  "./assets/sprites/lock.png",
  "./assets/sprites/pause.png",
  "./assets/sprites/restart.png",
  "./assets/sprites/sound.png",
  "./assets/sprites/sparkle-1.png",
  "./assets/sprites/sparkle-2.png",
  "./assets/sprites/sparkle-3.png",
  "./assets/sprites/sparkle-4.png",
  "./assets/sprites/star.png",
  "./assets/alpha-match-spritesheet.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
