// ===== GLOBAL STATE =====
const state = {
    theme: 'light',
    isOnline: navigator.onLine,
    currentCategory: 'all',
    searchQuery: '',
    allGames: [],
    displayedGames: [],
    recentlyPlayed: [],
    currentPage: 0,
    gamesPerPage: 20,
    isLoading: false
};

// ===== CONSTANTS =====
const CACHE_EXPIRY_DAYS = 10;
const CACHE_KEY = 'gamesCache';
const RECENT_GAMES_KEY = 'recentlyPlayed';
const THEME_KEY = 'theme';
const COOKIE_CONSENT_KEY = 'cookieConsent';

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Check cookie consent
    checkCookieConsent();
    
    // Initialize theme
    initializeTheme();
    
    // Check online status
    updateOnlineStatus();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load recently played games
    loadRecentlyPlayed();
    
    // Load games based on online/offline status
    await loadGames();
    
    // Setup infinite scroll
    setupInfiniteScroll();
    
    // Clear old cache
    clearOldCache();
}

// ===== COOKIE CONSENT =====
function checkCookieConsent() {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
        document.getElementById('cookieConsent').classList.remove('hidden');
    }
}

document.getElementById('acceptCookies')?.addEventListener('click', () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    document.getElementById('cookieConsent').classList.add('hidden');
});

// ===== THEME MANAGEMENT =====
function initializeTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    state.theme = savedTheme;
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

function toggleTheme() {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    state.theme = newTheme;
    localStorage.setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
}

// ===== ONLINE/OFFLINE STATUS =====
function updateOnlineStatus() {
    state.isOnline = navigator.onLine;
    const statusElement = document.getElementById('connectionStatus');
    if (statusElement) {
        statusElement.textContent = state.isOnline ? 'Online' : 'Offline';
        statusElement.className = `status-indicator ${state.isOnline ? 'online' : 'offline'}`;
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    
    // Search
    document.getElementById('searchInput')?.addEventListener('input', handleSearch);
    
    // Online/Offline events
    window.addEventListener('online', () => {
        updateOnlineStatus();
        loadGames();
    });
    
    window.addEventListener('offline', () => {
        updateOnlineStatus();
        loadGames();
    });
    
    // Game player controls
    document.getElementById('closeGame')?.addEventListener('click', closeGame);
    document.getElementById('fullscreenBtn')?.addEventListener('click', toggleFullscreen);
}

// ===== LOAD GAMES =====
async function loadGames() {
    state.isLoading = true;
    showLoading();
    
    try {
        if (state.isOnline) {
            await loadOnlineGames();
        } else {
            await loadOfflineGames();
        }
        
        // Reset pagination
        state.currentPage = 0;
        state.displayedGames = [];
        
        // Apply filters
        applyFilters();
        
        // Display first batch
        displayNextBatch();
        
    } catch (error) {
        console.error('Error loading games:', error);
        showNoResults();
    } finally {
        state.isLoading = false;
        hideLoading();
    }
}

// ===== SEARCH & FILTER =====
function handleSearch(event) {
    state.searchQuery = event.target.value.toLowerCase().trim();
    state.currentPage = 0;
    state.displayedGames = [];
    applyFilters();
    displayNextBatch();
}

function filterByCategory(category) {
    state.currentCategory = category;
    state.currentPage = 0;
    state.displayedGames = [];
    
    // Update active category button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update title
    const title = category === 'all' ? 'All Games' : category.charAt(0).toUpperCase() + category.slice(1);
    document.getElementById('gamesTitle').textContent = title;
    
    applyFilters();
    displayNextBatch();
}

function applyFilters() {
    let filtered = [...state.allGames];
    
    // Filter by category
    if (state.currentCategory !== 'all') {
        filtered = filtered.filter(game => 
            game.category.toLowerCase() === state.currentCategory.toLowerCase()
        );
    }
    
    // Filter by search query
    if (state.searchQuery) {
        filtered = filtered.filter(game => 
            game.name.toLowerCase().includes(state.searchQuery) ||
            game.description.toLowerCase().includes(state.searchQuery) ||
            game.category.toLowerCase().includes(state.searchQuery)
        );
    }
    
    state.displayedGames = filtered;
    updateGamesCount();
}

function updateGamesCount() {
    const countElement = document.getElementById('gamesCount');
    if (countElement) {
        countElement.textContent = `${state.displayedGames.length} games`;
    }
}

// ===== DISPLAY GAMES =====
function displayNextBatch() {
    const gamesGrid = document.getElementById('gamesGrid');
    if (!gamesGrid) return;
    
    // Clear grid if first page
    if (state.currentPage === 0) {
        gamesGrid.innerHTML = '';
    }
    
    // Check if there are games to display
    if (state.displayedGames.length === 0) {
        showNoResults();
        return;
    } else {
        hideNoResults();
    }
    
    // Calculate slice
    const start = state.currentPage * state.gamesPerPage;
    const end = start + state.gamesPerPage;
    const batch = state.displayedGames.slice(start, end);
    
    // Display games
    batch.forEach(game => {
        const gameCard = createGameCard(game);
        gamesGrid.appendChild(gameCard);
    });
    
    state.currentPage++;
}

function createGameCard(game) {
    const card = document.createElement('div');
    card.className = `game-card ${state.isOnline ? 'online-game' : 'offline-game'}`;
    card.onclick = () => playGame(game);
    
    card.innerHTML = `
        <img src="${game.icon}" 
             alt="${game.name}" 
             class="game-card-image"
             loading="lazy"
             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23ddd%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2220%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E'">
        <div class="game-card-content">
            <h3 class="game-card-title">${game.name}</h3>
            <p class="game-card-description">${game.description}</p>
            <span class="game-card-category">${game.category}</span>
        </div>
    `;
    
    return card;
}

// ===== INFINITE SCROLL =====
function setupInfiniteScroll() {
    let debounceTimer;
    
    window.addEventListener('scroll', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const scrollPosition = window.innerHeight + window.scrollY;
            const threshold = document.documentElement.scrollHeight - 500;
            
            if (scrollPosition >= threshold && !state.isLoading) {
                const remainingGames = state.displayedGames.length - (state.currentPage * state.gamesPerPage);
                if (remainingGames > 0) {
                    displayNextBatch();
                }
            }
        }, 200);
    });
}

// ===== CATEGORIES =====
function updateCategories(games) {
    const categories = new Set(['all']);
    games.forEach(game => {
        if (game.category) {
            categories.add(game.category.toLowerCase());
        }
    });
    
    const categoriesList = document.getElementById('categoriesList');
    if (categoriesList) {
        categoriesList.innerHTML = '';
        
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = `category-btn ${category === 'all' ? 'active' : ''}`;
            button.setAttribute('data-category', category);
            button.textContent = category === 'all' ? 'All Games' : category.charAt(0).toUpperCase() + category.slice(1);
            button.addEventListener('click', (e) => {
                state.currentCategory = category;
                state.currentPage = 0;
                state.displayedGames = [];
                
                document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                const title = category === 'all' ? 'All Games' : category.charAt(0).toUpperCase() + category.slice(1);
                document.getElementById('gamesTitle').textContent = title;
                
                applyFilters();
                displayNextBatch();
            });
            
            categoriesList.appendChild(button);
        });
    }
}

// ===== RECENTLY PLAYED =====
function loadRecentlyPlayed() {
    try {
        const recent = localStorage.getItem(RECENT_GAMES_KEY);
        if (recent) {
            state.recentlyPlayed = JSON.parse(recent);
            displayRecentlyPlayed();
        }
    } catch (error) {
        console.error('Error loading recently played:', error);
    }
}

function displayRecentlyPlayed() {
    if (state.recentlyPlayed.length === 0) return;
    
    const recentSection = document.getElementById('recentGamesSection');
    const recentGrid = document.getElementById('recentGamesGrid');
    
    if (recentSection && recentGrid) {
        recentSection.classList.remove('hidden');
        recentGrid.innerHTML = '';
        
        state.recentlyPlayed.slice(0, 6).forEach(game => {
            const gameCard = createGameCard(game);
            recentGrid.appendChild(gameCard);
        });
    }
}

function addToRecentlyPlayed(game) {
    // Remove if already exists
    state.recentlyPlayed = state.recentlyPlayed.filter(g => g.id !== game.id);
    
    // Add to beginning
    state.recentlyPlayed.unshift(game);
    
    // Keep only last 20
    state.recentlyPlayed = state.recentlyPlayed.slice(0, 20);
    
    // Save to localStorage
    try {
        localStorage.setItem(RECENT_GAMES_KEY, JSON.stringify(state.recentlyPlayed));
    } catch (error) {
        console.error('Error saving recently played:', error);
    }
}

// ===== PLAY GAME =====
function playGame(game) {
    const gamePlayer = document.getElementById('gamePlayer');
    const gameFrame = document.getElementById('gameFrame');
    const gameTitleDisplay = document.getElementById('gameTitleDisplay');
    
    if (gamePlayer && gameFrame && gameTitleDisplay) {
        gameTitleDisplay.textContent = game.name;
        gameFrame.src = game.url;
        gamePlayer.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Add to recently played
        addToRecentlyPlayed(game);
    }
}

function closeGame() {
    const gamePlayer = document.getElementById('gamePlayer');
    const gameFrame = document.getElementById('gameFrame');
    
    if (gamePlayer && gameFrame) {
        gameFrame.src = '';
        gamePlayer.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

function toggleFullscreen() {
    const gameFrame = document.getElementById('gameFrame');
    if (!gameFrame) return;
    
    if (!document.fullscreenElement) {
        if (gameFrame.requestFullscreen) {
            gameFrame.requestFullscreen();
        } else if (gameFrame.webkitRequestFullscreen) {
            gameFrame.webkitRequestFullscreen();
        } else if (gameFrame.msRequestFullscreen) {
            gameFrame.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// ===== CACHE MANAGEMENT =====
function clearOldCache() {
    try {
        const cache = localStorage.getItem(CACHE_KEY);
        if (cache) {
            const parsed = JSON.parse(cache);
            const cacheDate = new Date(parsed.timestamp);
            const now = new Date();
            const daysDiff = (now - cacheDate) / (1000 * 60 * 60 * 24);
            
            if (daysDiff > CACHE_EXPIRY_DAYS) {
                localStorage.removeItem(CACHE_KEY);
                console.log('Cache cleared due to expiry');
            }
        }
    } catch (error) {
        console.error('Error clearing cache:', error);
    }
}

function saveToCache(data) {
    try {
        const cacheData = {
            timestamp: new Date().toISOString(),
            data: data
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
        console.error('Error saving to cache:', error);
    }
}

function loadFromCache() {
    try {
        const cache = localStorage.getItem(CACHE_KEY);
        if (cache) {
            const parsed = JSON.parse(cache);
            return parsed.data;
        }
    } catch (error) {
        console.error('Error loading from cache:', error);
    }
    return null;
}

// ===== UI HELPERS =====
function showLoading() {
    document.getElementById('loadingIndicator')?.classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingIndicator')?.classList.add('hidden');
}

function showNoResults() {
    document.getElementById('noResults')?.classList.remove('hidden');
}

function hideNoResults() {
    document.getElementById('noResults')?.classList.add('hidden');
}
