// ===== ONLINE GAMES FUNCTIONALITY =====

async function loadOnlineGames() {
    try {
        // Try to load from cache first
        const cachedData = loadFromCache();
        
        if (cachedData && cachedData.onlineGames) {
            console.log('Loading online games from cache');
            state.allGames = cachedData.onlineGames;
            updateCategories(state.allGames);
            return;
        }
        
        // Fetch from JSON file
        console.log('Fetching online games from JSON');
        const response = await fetch('onlinegameadd.json');
        
        if (!response.ok) {
            throw new Error('Failed to fetch online games');
        }
        
        const games = await response.json();
        state.allGames = games;
        
        // Save to cache
        saveToCache({ onlineGames: games });
        
        // Update categories
        updateCategories(games);
        
    } catch (error) {
        console.error('Error loading online games:', error);
        
        // Try to load from cache as fallback
        const cachedData = loadFromCache();
        if (cachedData && cachedData.onlineGames) {
            console.log('Using cached online games as fallback');
            state.allGames = cachedData.onlineGames;
            updateCategories(state.allGames);
        } else {
            state.allGames = [];
            showNetworkError();
        }
    }
}

function showNetworkError() {
    const gamesGrid = document.getElementById('gamesGrid');
    if (gamesGrid) {
        gamesGrid.innerHTML = `
            <div class="network-error">
                <h3>⚠️ Network Error</h3>
                <p>Unable to load online games. Please check your internet connection and try again.</p>
                <button onclick="loadGames()" class="cookie-btn" style="margin-top: 16px;">Retry</button>
            </div>
        `;
    }
}

// ===== ONLINE GAME SPECIFIC FEATURES =====

// Preload game iframe for faster loading
function preloadGame(gameUrl) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = gameUrl;
    document.head.appendChild(link);
}

// Track online game analytics (if needed)
function trackOnlineGamePlay(game) {
    console.log('Playing online game:', game.name);
    // Add analytics tracking here if needed
}

// Check if game URL is accessible
async function checkGameAvailability(gameUrl) {
    try {
        const response = await fetch(gameUrl, { method: 'HEAD', mode: 'no-cors' });
        return true;
    } catch (error) {
        console.error('Game not accessible:', error);
        return false;
    }
}

// Add online game badge to cards
function addOnlineGameBadge(cardElement) {
    const badge = document.createElement('div');
    badge.className = 'online-badge';
    badge.textContent = 'Online';
    cardElement.appendChild(badge);
}
