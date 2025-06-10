// sw.js

// 1. Constants
// Choose a cache name for your app. Best practice is to include a version number.
const CACHE_NAME = 'webxr-vertical-plane-test-v1';

// List of all the files and assets your app needs to function offline.
const URLS_TO_CACHE = [
    // The main HTML file. '.' or '/' represents the root.
    './index.html',
    
    // For the multi-file version, you would cache these:
    // './style.css',
    // './app.js',
    // './manifest.json',

    // CRITICAL: Cache the external Three.js library files.
    // Without these, the app will fail offline even if index.html is cached.
    'https://unpkg.com/three@0.160.0/build/three.module.js',
    'https://unpkg.com/three@0.160.0/examples/jsm/controls/ARButton.js', // Caching this just in case, good practice

    // You would add any app icons here, e.g.:
    // './icons/icon-192x192.png'
];


// 2. Install Event
// This event runs when the service worker is first installed.
// It's the perfect time to open a cache and add our app's files to it.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event in progress.');
  
  // waitUntil() ensures the service worker won't install until the code inside has successfully finished.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell and assets.');
        // addAll() fetches all the URLs in the array and stores their responses in the cache.
        // This is an all-or-nothing operation.
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => {
        console.log('Service Worker: Caching complete! Ready for offline use.');
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache assets:', error);
      })
  );
});


// 3. Activate Event
// This event is fired after installation, when the service worker becomes active.
// It's the best place to clean up old, unused caches.
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event in progress.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // If a cache's name is different from our current CACHE_NAME, it's an old cache. Delete it.
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});


// 4. Fetch Event
// This event intercepts every network request made by the page.
// We use a "Cache-First" strategy here.
self.addEventListener('fetch', (event) => {
  // Let the browser handle requests for scripts that are not part of our app shell.
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  // respondWith() hijacks the request and lets us provide our own response.
  event.respondWith(
    // Check if the requested resource is already in our cache.
    caches.match(event.request)
      .then((cachedResponse) => {
        // If a cached response is found, return it immediately.
        if (cachedResponse) {
          // console.log('Service Worker: Serving from cache:', event.request.url);
          return cachedResponse;
        }
        
        // If the resource is not in the cache, fetch it from the network.
        // console.log('Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request);
      })
  );
});