// Online Games Specific Logic

// Fetch and update online games
async function fetchOnlineGames() {
    try {
        const response = await fetch('onlinegameadd.json');
        const games = await response.json();
        
        // Update cache
        setCachedData('onlineGames', games);
        
        return games;
    } catch (error) {
        console.error('Error fetching online games:', error);
        return getCachedData('onlineGames') || [];
    }
}

// Preload game for faster loading
function preloadGame(gameUrl) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = gameUrl;
    document.head.appendChild(link);
}

// Track game analytics (placeholder for future implementation)
function trackGamePlay(gameId) {
    const analytics = JSON.parse(localStorage.getItem('gameAnalytics') || '{}');
    analytics[gameId] = (analytics[gameId] || 0) + 1;
    localStorage.setItem('gameAnalytics', JSON.stringify(analytics));
}

// Get popular games based on play count
function getPopularGames() {
    const analytics = JSON.parse(localStorage.getItem('gameAnalytics') || '{}');
    const sorted = Object.entries(analytics)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    return sorted.map(([gameId]) => 
        allGames.find(game => game.id === gameId)
    ).filter(Boolean);
}

// Check if game URL is accessible
async function checkGameAvailability(gameUrl) {
    try {
        const response = await fetch(gameUrl, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Export functions for use in main app
window.onlineGameUtils = {
    fetchOnlineGames,
    preloadGame,
    trackGamePlay,
    getPopularGames,
    checkGameAvailability
};
