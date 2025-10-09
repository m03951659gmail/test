// PWA Install Functionality

let deferredPrompt;
let isInstalled = false;

// Check if already installed
if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
    isInstalled = true;
}

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered:', registration.scope);

                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000); // Check every hour

                // Cache offline games on install
                if (!isInstalled) {
                    cacheOfflineGamesOnInstall();
                }
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });

        // Handle service worker updates
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
    });
}

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the default prompt
    e.preventDefault();
    
    // Store the event for later use
    deferredPrompt = e;
    
    // Show custom install banner if not already shown
    const hasSeenBanner = localStorage.getItem('pwa-banner-dismissed');
    const installTime = localStorage.getItem('pwa-install-time');
    
    if (!hasSeenBanner && !installTime && !isInstalled) {
        showInstallBanner();
    }
});

// Show install banner
function showInstallBanner() {
    const banner = document.getElementById('pwa-install-banner');
    const installBtn = document.getElementById('pwa-install-btn');
    const closeBtn = document.getElementById('pwa-close-btn');

    if (!banner) return;

    banner.classList.remove('hidden');

    // Install button click
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for user response
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('PWA installed');
            localStorage.setItem('pwa-install-time', Date.now().toString());
            
            // Cache offline games after installation
            await cacheOfflineGamesOnInstall();
            
            // Show success message
            showInstallSuccess();
        } else {
            console.log('PWA installation declined');
        }

        // Clear the deferred prompt
        deferredPrompt = null;
        banner.classList.add('hidden');
    });

    // Close button click
    closeBtn.addEventListener('click', () => {
        banner.classList.add('hidden');
        localStorage.setItem('pwa-banner-dismissed', 'true');
        
        // Show banner again after 7 days
        setTimeout(() => {
            localStorage.removeItem('pwa-banner-dismissed');
        }, 7 * 24 * 60 * 60 * 1000);
    });
}

// Show installation success message
function showInstallSuccess() {
    const message = document.createElement('div');
    message.className = 'install-success';
    message.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--surface-color);
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: var(--shadow-xl);
            text-align: center;
            z-index: 10000;
            max-width: 400px;
        ">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
            <h2 style="margin-bottom: 0.5rem;">Successfully Installed!</h2>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                Offline games are now being cached. You can play them anytime, even without internet!
            </p>
            <button onclick="this.closest('.install-success').remove()" 
                    style="background: var(--primary-color); color: white; border: none; 
                           padding: 0.75rem 2rem; border-radius: 0.5rem; cursor: pointer; 
                           font-weight: 600;">
                Got it!
            </button>
        </div>
        <div onclick="this.closest('.install-success').remove()" 
             style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                    background: rgba(0,0,0,0.5); z-index: 9999;"></div>
    `;
    document.body.appendChild(message);

    // Auto remove after 5 seconds
    setTimeout(() => {
        message.remove();
    }, 5000);
}

// Cache offline games on PWA install
async function cacheOfflineGamesOnInstall() {
    try {
        // Fetch offline games list
        const response = await fetch('/offlinegameadd.json');
        const offlineGames = await response.json();

        // Collect all URLs to cache
        const urlsToCache = [];
        
        offlineGames.forEach(game => {
            urlsToCache.push(game.url);
            urlsToCache.push(game.icon);
            
            // If it's a local game, also cache the folder
            if (game.url.startsWith('offline-games/')) {
                // Add common game assets
                const gameFolder = game.url.substring(0, game.url.lastIndexOf('/'));
                urlsToCache.push(`${gameFolder}/style.css`);
                urlsToCache.push(`${gameFolder}/script.js`);
            }
        });

        // Send message to service worker to cache these URLs
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'CACHE_URLS',
                urls: urlsToCache
            });
        }

        console.log('Offline games caching initiated');
    } catch (error) {
        console.error('Error caching offline games:', error);
    }
}

// Handle app installed event
window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    isInstalled = true;
    localStorage.setItem('pwa-install-time', Date.now().toString());
    
    // Hide banner if visible
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
        banner.classList.add('hidden');
    }
});

// Clear old cache after 10 days
function checkAndClearOldCache() {
    const lastCacheCheck = localStorage.getItem('last-cache-clear');
    const now = Date.now();
    const tenDays = 10 * 24 * 60 * 60 * 1000;

    if (!lastCacheCheck || (now - parseInt(lastCacheCheck)) > tenDays) {
        // Send message to service worker to clear old cache
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'CLEAR_OLD_CACHE'
            });
        }

        localStorage.setItem('last-cache-clear', now.toString());
    }
}

// Run cache check on load
window.addEventListener('load', () => {
    checkAndClearOldCache();
});

// iOS/Safari install instructions
function showiOSInstallInstructions() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isInStandaloneMode = window.navigator.standalone;

    if (isIOS && !isInStandaloneMode) {
        const hasSeenInstructions = sessionStorage.getItem('ios-install-seen');
        
        if (!hasSeenInstructions) {
            const instructions = document.createElement('div');
            instructions.className = 'ios-install-instructions';
            instructions.innerHTML = `
                <div style="
                    position: fixed;
                    bottom: 80px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--surface-color);
                    padding: 1.5rem;
                    border-radius: 1rem;
                    box-shadow: var(--shadow-xl);
                    max-width: 320px;
                    z-index: 9999;
                    text-align: center;
                ">
                    <h3 style="margin-bottom: 0.75rem;">Install Game Portal</h3>
                    <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1rem;">
                        Tap <span style="font-size: 1.25rem;">⎙</span> and then "Add to Home Screen"
                    </p>
                    <button onclick="this.closest('.ios-install-instructions').remove(); sessionStorage.setItem('ios-install-seen', 'true');" 
                            style="background: var(--primary-color); color: white; border: none; 
                                   padding: 0.5rem 1.5rem; border-radius: 0.5rem; cursor: pointer;">
                        Got it
                    </button>
                </div>
            `;
            document.body.appendChild(instructions);

            setTimeout(() => {
                instructions.remove();
                sessionStorage.setItem('ios-install-seen', 'true');
            }, 10000);
        }
    }
}

// Show iOS instructions after a delay
setTimeout(showiOSInstallInstructions, 3000);

// Export functions for external use
window.pwaInstall = {
    showInstallBanner,
    cacheOfflineGamesOnInstall,
    isInstalled: () => isInstalled
};
