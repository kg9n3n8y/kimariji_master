self.importScripts('./fudalist.js');

const CACHE_VERSION = 'v2.0.0';
const APP_CACHE = `kimariji-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `kimariji-runtime-${CACHE_VERSION}`;

const APP_SHELL = [
  './',
  './?source=pwa',
  './index.html',
  './style.css',
  './script.js',
  './fudalist.js',
  './manifest.json',
  './sw.js',
  './icon.png',
  './icon-512.png',
  './thumbnail.png'
];

const FUDA_DATA = (() => {
  if (Array.isArray(self.fudalist)) {
    return self.fudalist;
  }
  if (typeof fudalist !== 'undefined' && Array.isArray(fudalist)) {
    return fudalist;
  }
  return [];
})();

const PRECACHE_URLS = buildPrecacheList();

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(APP_CACHE).then(cache => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames =>
        Promise.all(
          cacheNames
            .filter(name => ![APP_CACHE, RUNTIME_CACHE].includes(name))
            .map(name => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(handleFetch(event.request));
});

function buildPrecacheList() {
  const assets = new Set(APP_SHELL);
  assets.add('./torifuda/tori_0.png');

  FUDA_DATA.forEach(entry => {
    addAssetPath(assets, entry.normal);
    addAssetPath(assets, entry.reverse);
    if (typeof entry.goroImage === 'string' && entry.goroImage.trim() !== '') {
      addAssetPath(assets, `./goro_slide/${entry.goroImage}`);
      addAssetPath(assets, `./goro_thumbnail/${entry.goroImage}`);
    }
  });

  return Array.from(assets);
}

function addAssetPath(store, assetPath) {
  if (typeof assetPath !== 'string') {
    return;
  }
  const trimmed = assetPath.trim();
  if (!trimmed) {
    return;
  }

  if (/^https?:\/\//.test(trimmed)) {
    store.add(trimmed);
  } else if (trimmed.startsWith('./') || trimmed.startsWith('../')) {
    store.add(trimmed);
  } else if (trimmed.startsWith('/')) {
    store.add(`.${trimmed}`);
  } else {
    store.add(`./${trimmed}`);
  }
}

async function handleFetch(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const runtimeCache = await caches.open(RUNTIME_CACHE);
      runtimeCache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    if (request.mode === 'navigate') {
      const fallback = await matchNavigationFallback();
      if (fallback) {
        return fallback;
      }
    }
    return new Response('', { status: 503, statusText: 'Service Unavailable' });
  }
}

async function matchNavigationFallback() {
  const fallbacks = ['./?source=pwa', './index.html'];
  for (const url of fallbacks) {
    const cached = await caches.match(url);
    if (cached) {
      return cached;
    }
  }
  return null;
}
