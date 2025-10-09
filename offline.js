// ===== OFFLINE GAMES FUNCTIONALITY =====

async function loadOfflineGames() {
    try {
        console.log('Loading offline games');
        
        // Try to load from localStorage cache
        const cachedData = loadFromCache();
        
        if (cachedData && cachedData.offlineGames) {
            console.log('Loading offline games from cache');
            state.allGames = cachedData.offlineGames;
            updateCategories(state.allGames);
            showOfflineMessage();
            return;
        }
        
        // Try to fetch from JSON file (might work if service worker cached it)
        try {
            const response = await fetch('offlinegameadd.json');
            if (response.ok) {
                const games = await response.json();
                state.allGames = games;
                
                // Save to cache for future offline use
                const currentCache = loadFromCache() || {};
                currentCache.offlineGames = games;
                saveToCache(currentCache);
                
                updateCategories(games);
                showOfflineMessage();
                return;
            }
        } catch (fetchError) {
            console.log('Fetch failed, using fallback');
        }
        
        // Fallback: Create default offline games if nothing is cached
        console.log('Using fallback offline games');
        state.allGames = getDefaultOfflineGames();
        updateCategories(state.allGames);
        showOfflineMessage();
        
    } catch (error) {
        console.error('Error loading offline games:', error);
        state.allGames = getDefaultOfflineGames();
        updateCategories(state.allGames);
        showOfflineMessage();
    }
}

function showOfflineMessage() {
    const gamesSection = document.querySelector('.games-section .container');
    if (gamesSection) {
        // Check if message already exists
        if (!document.getElementById('offlineMessageBox')) {
            const message = document.createElement('div');
            message.id = 'offlineMessageBox';
            message.className = 'offline-message';
            message.innerHTML = `
                <strong>📴 You're Offline</strong><br>
                You can still play offline games that are cached on your device!
            `;
            gamesSection.insertBefore(message, gamesSection.firstChild);
        }
    }
}

function getDefaultOfflineGames() {
    // Return a minimal set of games that should always be available
    return [
        {
            id: 'offline-1',
            name: 'Tic Tac Toe',
            description: 'Classic tic-tac-toe game. Play against AI or with a friend!',
            url: 'offline-games/tic-tac-toe/index.html',
            icon: 'offlineicon/tic-tac-toe/icon.png',
            category: 'puzzle'
        },
        {
            id: 'offline-2',
            name: 'Memory Match',
            description: 'Test your memory by matching pairs of cards in this classic game!',
            url: 'offline-games/memory-match/index.html',
            icon: 'offlineicon/memory-match/icon.png',
            category: 'puzzle'
        },
        {
            id: 'offline-3',
            name: 'Snake Classic',
            description: 'The classic snake game! Eat food and grow without hitting the walls!',
            url: 'offline-games/snake/index.html',
            icon: 'offlineicon/snake/icon.png',
            category: 'arcade'
        },
        {
            id: 'offline-4',
            name: 'Brick Breaker',
            description: 'Break all the bricks with your paddle and ball in this classic game!',
            url: 'offline-games/brick-breaker/index.html',
            icon: 'offlineicon/brick-breaker/icon.png',
            category: 'arcade'
        },
        {
            id: 'offline-5',
            name: 'Flappy Bird',
            description: 'Tap to fly and navigate through pipes in this challenging game!',
            url: 'offline-games/flappy-bird/index.html',
            icon: 'offlineicon/flappy-bird/icon.png',
            category: 'casual'
        }
    ];
}

// Cache offline games data when online
async function cacheOfflineGamesData() {
    if (navigator.onLine) {
        try {
            const response = await fetch('offlinegameadd.json');
            if (response.ok) {
                const games = await response.json();
                const currentCache = loadFromCache() || {};
                currentCache.offlineGames = games;
                saveToCache(currentCache);
                console.log('Offline games data cached successfully');
            }
        } catch (error) {
            console.error('Error caching offline games data:', error);
        }
    }
}

// Initialize offline games caching when app loads
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        // Cache offline games data when online
        cacheOfflineGamesData();
    });
}

// Add offline game badge to cards
function addOfflineGameBadge(cardElement) {
    const badge = document.createElement('div');
    badge.className = 'offline-badge';
    badge.textContent = 'Offline';
    cardElement.appendChild(badge);
}

// Check if offline game is cached and available
function isGameCached(gameUrl) {
    // This would check if the game files are cached by service worker
    // For now, we'll assume all offline games in the JSON are available
    return true;
}
