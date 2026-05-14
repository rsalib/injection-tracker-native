// Injection Tracker — Service Worker (Vite build)
// Strategy: cache-first for app shell (Vite-built assets), network-first for live data.
// Bump CACHE_VERSION on each deploy so clients pick up the new hashed bundles.

const CACHE_VERSION = "v2";
const APP_CACHE = `injtrack-shell-${CACHE_VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) =>
      cache.addAll(["/", "/index.html"])
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n.startsWith("injtrack-shell-") && n !== APP_CACHE)
          .map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Never intercept Firebase, Gemini, FDA, PubMed, or Google API calls.
  const LIVE_HOSTS = [
    "firebaseio.com",
    "firebasestorage.googleapis.com",
    "generativelanguage.googleapis.com",
    "googleapis.com",
    "identitytoolkit.googleapis.com",
    "securetoken.googleapis.com",
    "accounts.google.com",
    "google.com",
    "firebaseapp.com",
    "eutils.ncbi.nlm.nih.gov",
    "api.fda.gov",
    "run.app"
  ];
  if (LIVE_HOSTS.some((h) => url.hostname.includes(h))) return;

  // Never intercept Firebase Auth redirect URLs — these carry auth tokens in the URL
  // and must reach the app untouched. Intercepting them loses the auth state on mobile.
  if (
    url.pathname.includes("/__/auth/") ||
    url.searchParams.has("apiKey") ||
    url.hash.includes("access_token") ||
    url.hash.includes("id_token") ||
    url.searchParams.has("code") ||
    url.searchParams.has("state")
  ) return;

  // Vite hashed assets (/assets/*.js, /assets/*.css) — cache-first, they never change.
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((resp) => {
          if (resp && resp.ok) {
            const copy = resp.clone();
            caches.open(APP_CACHE).then((c) => c.put(req, copy));
          }
          return resp;
        });
      })
    );
    return;
  }

  // App shell (index.html + root) — network-first so updates are always picked up.
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req).then((resp) => {
        if (resp && resp.ok) {
          const copy = resp.clone();
          caches.open(APP_CACHE).then((c) => c.put(req, copy));
        }
        return resp;
      }).catch(() => caches.match(req).then(cached => cached || caches.match("/index.html")))
    );
  }
});
