const CACHE_VERSION = 'v1';
const CACHE_NAME = `game-portal-${CACHE_VERSION}`;
const OFFLINE_CACHE = `offline-games-${CACHE_VERSION}`;

// Assets to cache on install
const CORE_ASSETS = [
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
    '/onlinegameadd.json',

'/offlineicon',
    '/offlineicon/memory-match/icon.png',
    '/offlineicon/pong/icon.png',
    '/offlineicon/snake/icon.png',
    '/offlineicon/tetris/icon.png',
    '/offlineicon/tic-tac-toe/icon.png',
    
    '/offline-games',
    '/offline-games/memory-match',
    '/offline-games/memory-match/index.html',
    '/offline-games/memory-match/script.js',
    '/offline-games/memory-match/style.css',
    
    '/offline-games/pong',
    '/offline-games/pong/index.html',
    '/offline-games/pong/script.js',
    '/offline-games/pong/style.css',
    
    '/offline-games',
    '/onlinegameadd.json',
    '/onlinegameadd.json',
    '/onlinegameadd.json',
    
    '/offline-games',
    '/onlinegameadd.json',
    '/onlinegameadd.json',
    '/onlinegameadd.json',
    
    '/offline-games',
    '/onlinegameadd.json',
    '/onlinegameadd.json',
    '/onlinegameadd.json',
    
    
    '/icon/icon-128.png',
     '/icon/icon-96.png',
     '/icon/icon-72.png',
     '/icon/icon-512.png',
     '/icon/icon-384.png',
     '/icon/icon-192.png',
     '/icon/icon-152.png',
     '/icon/icon-144.png',

    '/offlinegameadd.json'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching core assets');
            return cache.addAll(CORE_ASSETS);
        }).then(() => {
            console.log('[Service Worker] Installed successfully');
            return self.skipWaiting();
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[Service Worker] Activated successfully');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                // Return cached version and update cache in background
                fetchAndCache(request);
                return cachedResponse;
            }

            // Not in cache, fetch from network
            return fetch(request).then((response) => {
                // Don't cache if not a success response
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                // Clone the response
                const responseToCache = response.clone();

                // Cache the new resource
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, responseToCache);
                });

                return response;
            }).catch(() => {
                // Network failed, try to return cached version
                return caches.match(request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    // Return offline page if available
                    if (request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                });
            });
        })
    );
});

// Background fetch and cache update
function fetchAndCache(request) {
    fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
            return;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
        });
    }).catch(() => {
        // Silently fail - we're already serving from cache
    });
}

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_URLS') {
        const urls = event.data.urls;
        event.waitUntil(
            caches.open(OFFLINE_CACHE).then((cache) => {
                return cache.addAll(urls);
            })
        );
    }

    if (event.data && event.data.type === 'CLEAR_OLD_CACHE') {
        const maxAge = 10 * 24 * 60 * 60 * 1000; // 10 days
        event.waitUntil(clearOldCache(maxAge));
    }
});

// Clear old cached items
async function clearOldCache(maxAge) {
    const cacheNames = await caches.keys();
    const now = Date.now();

    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();

        for (const request of requests) {
            const response = await cache.match(request);
            const dateHeader = response.headers.get('date');
            
            if (dateHeader) {
                const cacheTime = new Date(dateHeader).getTime();
                if (now - cacheTime > maxAge) {
                    await cache.delete(request);
                    console.log('[Service Worker] Deleted old cache:', request.url);
                }
            }
        }
    }
}

// Periodic background sync (if supported)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-games') {
        event.waitUntil(syncGames());
    }
});

async function syncGames() {
    try {
        const [onlineResponse, offlineResponse] = await Promise.all([
            fetch('/onlinegameadd.json'),
            fetch('/offlinegameadd.json')
        ]);

        const cache = await caches.open(CACHE_NAME);
        await cache.put('/onlinegameadd.json', onlineResponse.clone());
        await cache.put('/offlinegameadd.json', offlineResponse.clone());

        console.log('[Service Worker] Games synced successfully');
    } catch (error) {
        console.error('[Service Worker] Sync failed:', error);
    }
}

// Push notification event (for future feature)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New games available!',
        icon: '/icon/icon-192.png',
        badge: '/icon/icon-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    event.waitUntil(
        self.registration.showNotification('Game Portal', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow('/')
    );
});
