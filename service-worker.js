// ===== SERVICE WORKER FOR PWA =====

const CACHE_NAME = 'gaming-hub-v1';
const OFFLINE_CACHE = 'gaming-hub-offline-v1';

// Files to cache for offline functionality
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/index.css',
    '/online.css',
    '/offline.css',
    '/index.js',
    '/online.js',
    '/offline.js',
    '/pwa-install.js',
    '/manifest.json',
    '/offlinegameadd.json',
    '/icon-192.png',
    '/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Service Worker: Installed successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Installation failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cache) => {
                        if (cache !== CACHE_NAME && cache !== OFFLINE_CACHE) {
                            console.log('Service Worker: Deleting old cache', cache);
                            return caches.delete(cache);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                // Return cached response if found
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // Otherwise, fetch from network
                return fetch(request)
                    .then((networkResponse) => {
                        // Cache valid responses
                        if (networkResponse && networkResponse.status === 200) {
                            // Determine which cache to use
                            const cacheName = shouldCacheOffline(request.url) 
                                ? OFFLINE_CACHE 
                                : CACHE_NAME;
                            
                            // Clone the response before caching
                            const responseToCache = networkResponse.clone();
                            
                            caches.open(cacheName).then((cache) => {
                                cache.put(request, responseToCache);
                            });
                        }
                        
                        return networkResponse;
                    })
                    .catch((error) => {
                        console.log('Service Worker: Fetch failed, serving offline page', error);
                        
                        // Return offline page or fallback for failed requests
                        return caches.match('/index.html');
                    });
            })
    );
});

// Helper function to determine if a resource should be cached for offline use
function shouldCacheOffline(url) {
    return url.includes('offline-games/') || 
           url.includes('offlineicon/') || 
           url.includes('offlinegameadd.json');
}

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_OFFLINE_GAMES') {
        cacheOfflineGames();
    }
});

// Function to cache offline games
async function cacheOfflineGames() {
    try {
        const cache = await caches.open(OFFLINE_CACHE);
        
        // Fetch offline games list
        const response = await fetch('/offlinegameadd.json');
        const games = await response.json();
        
        // Cache each offline game and its assets
        const cachePromises = games.map(async (game) => {
            try {
                await cache.add(game.url);
                await cache.add(game.icon);
            } catch (error) {
                console.error(`Failed to cache game: ${game.name}`, error);
            }
        });
        
        await Promise.all(cachePromises);
        console.log('Service Worker: Offline games cached successfully');
        
    } catch (error) {
        console.error('Service Worker: Failed to cache offline games', error);
    }
}

// Background sync for caching offline games
self.addEventListener('sync', (event) => {
    if (event.tag === 'cache-offline-games') {
        event.waitUntil(cacheOfflineGames());
    }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-offline-games') {
        event.waitUntil(cacheOfflineGames());
    }
});
