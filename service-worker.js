const CACHE_NAME = "taiwan-adventure-pwa-v1";

const APP_SHELL = [
  "/vocabulary1/",
  "/vocabulary1/index.html",
  "/vocabulary1/manifest.json",
  "/vocabulary1/icons/icon-192.png",
  "/vocabulary1/icons/icon-512.png"
];

// 安裝：先把主要檔案放進快取
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// 啟用：清掉舊快取
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 離線讀取：先讀網路，失敗就讀快取
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || caches.match("/vocabulary1/index.html");
        });
      })
  );
});