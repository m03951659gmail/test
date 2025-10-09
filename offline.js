// Offline Games Specific Logic

// Fetch and cache offline games
async function fetchOfflineGames() {
    try {
        const response = await fetch('offlinegameadd.json');
        const games = await response.json();
        
        // Update cache
        setCachedData('offlineGames', games);
        
        return games;
    } catch (error) {
        console.error('Error fetching offline games:', error);
        return getCachedData('offlineGames') || [];
    }
}

// Cache offline game assets
async function cacheOfflineGameAssets(game) {
    if ('caches' in window) {
        try {
            const cache = await caches.open('offline-games-v1');
            const urlsToCache = [
                game.url,
                game.icon
            ];
            
            await cache.addAll(urlsToCache);
            console.log(`Cached assets for ${game.name}`);
        } catch (error) {
            console.error(`Error caching ${game.name}:`, error);
        }
    }
}

// Cache all offline games
async function cacheAllOfflineGames() {
    const offlineGames = await fetchOfflineGames();
    
    for (const game of offlineGames) {
        await cacheOfflineGameAssets(game);
    }
    
    console.log('All offline games cached');
}

// Check if game is cached
async function isGameCached(gameUrl) {
    if ('caches' in window) {
        const cache = await caches.open('offline-games-v1');
        const response = await cache.match(gameUrl);
        return !!response;
    }
    return false;
}

// Get cached offline games
async function getCachedOfflineGames() {
    const offlineGames = getCachedData('offlineGames') || [];
    const cachedGames = [];
    
    for (const game of offlineGames) {
        if (await isGameCached(game.url)) {
            cachedGames.push(game);
        }
    }
    
    return cachedGames;
}

// Download offline game for offline play
async function downloadOfflineGame(game) {
    if ('caches' in window) {
        try {
            await cacheOfflineGameAssets(game);
            
            // Show success message
            showNotification(`${game.name} is now available offline!`);
            
            return true;
        } catch (error) {
            console.error('Error downloading game:', error);
            showNotification(`Failed to download ${game.name}`, 'error');
            return false;
        }
    }
    return false;
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 0.5rem;
        box-shadow: var(--shadow-lg);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Export functions
window.offlineGameUtils = {
    fetchOfflineGames,
    cacheOfflineGameAssets,
    cacheAllOfflineGames,
    isGameCached,
    getCachedOfflineGames,
    downloadOfflineGame
};
