// Global State
let allGames = [];
let onlineGames = [];
let offlineGames = [];
let displayedGames = [];
let currentCategory = 'all';
let currentSearchTerm = '';
let currentPage = 0;
const gamesPerPage = 20;
let isLoading = false;
let isOfflineMode = false;

// DOM Elements
const gamesGrid = document.getElementById('games-grid');
const recentGamesGrid = document.getElementById('recent-games');
const recentSection = document.getElementById('recent-section');
const searchInput = document.getElementById('search-input');
const categoriesWrapper = document.querySelector('.categories-wrapper');
const loadingSpinner = document.getElementById('loading-spinner');
const noResults = document.getElementById('no-results');
const themeToggle = document.getElementById('theme-toggle');
const gameViewer = document.getElementById('game-viewer');
const gameIframe = document.getElementById('game-iframe');
const gameTitle = document.getElementById('game-title');
const closeGameBtn = document.getElementById('close-game-btn');
const fullscreenGameBtn = document.getElementById('fullscreen-game-btn');
const networkStatus = document.getElementById('network-status');
const networkMessage = document.getElementById('network-message');
const gamesSectionTitle = document.getElementById('games-section-title');

// Initialize App
async function init() {
    // Check theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon();

    // Check cache expiry
    checkCacheExpiry();

    // Load games
    await loadGames();

    // Load recent games
    loadRecentGames();

    // Setup event listeners
    setupEventListeners();

    // Check network status
    updateNetworkStatus();

    // Setup infinite scroll
    setupInfiniteScroll();
}

// Load Games from JSON files
async function loadGames() {
    try {
        // Try to load from cache first
        const cachedOnlineGames = getCachedData('onlineGames');
        const cachedOfflineGames = getCachedData('offlineGames');

        if (navigator.onLine) {
            // Online: Fetch fresh data
            const [onlineResponse, offlineResponse] = await Promise.all([
                fetch('onlinegameadd.json'),
                fetch('offlinegameadd.json')
            ]);

            onlineGames = await onlineResponse.json();
            offlineGames = await offlineResponse.json();

            // Cache the data
            setCachedData('onlineGames', onlineGames);
            setCachedData('offlineGames', offlineGames);
        } else {
            // Offline: Use cached data
            onlineGames = cachedOnlineGames || [];
            offlineGames = cachedOfflineGames || [];
            isOfflineMode = true;
        }

        // Combine all games
        allGames = [...onlineGames, ...offlineGames];

        // Generate categories
        generateCategories();

        // Display initial games
        displayGames();

    } catch (error) {
        console.error('Error loading games:', error);
        // Try to use cached data
        const cachedOnlineGames = getCachedData('onlineGames');
        const cachedOfflineGames = getCachedData('offlineGames');
        
        if (cachedOnlineGames || cachedOfflineGames) {
            onlineGames = cachedOnlineGames || [];
            offlineGames = cachedOfflineGames || [];
            allGames = [...onlineGames, ...offlineGames];
            isOfflineMode = true;
            generateCategories();
            displayGames();
        }
    }
}

// Generate Categories from Games
function generateCategories() {
    const categories = new Set();
    allGames.forEach(game => {
        if (game.category) {
            categories.add(game.category.toLowerCase());
        }
    });

    // Clear existing categories (except "All Games")
    const allButton = categoriesWrapper.querySelector('[data-category="all"]');
    categoriesWrapper.innerHTML = '';
    categoriesWrapper.appendChild(allButton);

    // Add category buttons
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.setAttribute('data-category', category);
        btn.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoriesWrapper.appendChild(btn);
    });
}

// Filter Games
function filterGames() {
    let filtered = allGames;

    // Filter by category
    if (currentCategory !== 'all') {
        filtered = filtered.filter(game => 
            game.category && game.category.toLowerCase() === currentCategory
        );
    }

    // Filter by search term
    if (currentSearchTerm) {
        filtered = filtered.filter(game =>
            game.name.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
            (game.description && game.description.toLowerCase().includes(currentSearchTerm.toLowerCase()))
        );
    }

    // In offline mode, only show offline games
    if (isOfflineMode) {
        filtered = filtered.filter(game => offlineGames.some(og => og.id === game.id));
    }

    return filtered;
}

// Display Games
function displayGames(append = false) {
    const filtered = filterGames();
    
    if (!append) {
        currentPage = 0;
        gamesGrid.innerHTML = '';
        displayedGames = [];
    }

    const start = currentPage * gamesPerPage;
    const end = start + gamesPerPage;
    const gamesToDisplay = filtered.slice(start, end);

    if (gamesToDisplay.length === 0 && displayedGames.length === 0) {
        noResults.classList.remove('hidden');
        gamesGrid.classList.add('hidden');
        return;
    } else {
        noResults.classList.add('hidden');
        gamesGrid.classList.remove('hidden');
    }

    gamesToDisplay.forEach(game => {
        const card = createGameCard(game);
        gamesGrid.appendChild(card);
        displayedGames.push(game);
    });

    currentPage++;

    // Update section title
    if (currentCategory === 'all') {
        gamesSectionTitle.textContent = isOfflineMode ? 'Offline Games' : 'All Games';
    } else {
        gamesSectionTitle.textContent = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
    }
}

// Create Game Card
function createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.setAttribute('data-game-id', game.id);

    const isOffline = offlineGames.some(og => og.id === game.id);

    card.innerHTML = `
        <div class="game-card-image">
            <img src="${game.icon}" alt="${game.name}" loading="lazy" 
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22280%22 height=%22180%22%3E%3Crect fill=%22%23ddd%22 width=%22280%22 height=%22180%22/%3E%3Ctext fill=%22%23999%22 font-family=%22Arial%22 font-size=%2218%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3ENo Image%3C/text%3E%3C/svg%3E'">
        </div>
        <div class="game-card-content">
            <h3 class="game-card-title">${game.name}</h3>
            <p class="game-card-description">${game.description || 'No description available'}</p>
            <div class="game-card-footer">
                <span class="game-card-category">${game.category || 'gaming'}</span>
                ${isOffline ? '<span class="game-card-badge">Offline</span>' : ''}
            </div>
        </div>
    `;

    card.addEventListener('click', () => openGame(game));

    return card;
}

// Open Game in Iframe
function openGame(game) {
    gameTitle.textContent = game.name;
    gameIframe.src = game.url;
    gameViewer.classList.remove('hidden');
    document.getElementById('main-content').classList.add('hidden');

    // Save to recent games
    saveRecentGame(game);
}

// Close Game
function closeGame() {
    gameIframe.src = '';
    gameViewer.classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
}

// Toggle Fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        gameViewer.requestFullscreen().catch(err => {
            console.error('Error attempting to enable fullscreen:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// Load Recent Games
function loadRecentGames() {
    const recentGames = getRecentGames();
    
    if (recentGames.length === 0) {
        recentSection.classList.add('hidden');
        return;
    }

    recentSection.classList.remove('hidden');
    recentGamesGrid.innerHTML = '';

    recentGames.forEach(game => {
        const card = createGameCard(game);
        recentGamesGrid.appendChild(card);
    });
}

// Get Recent Games from LocalStorage
function getRecentGames() {
    const recent = localStorage.getItem('recentGames');
    if (!recent) return [];
    
    try {
        const recentIds = JSON.parse(recent);
        return recentIds
            .map(id => allGames.find(game => game.id === id))
            .filter(game => game !== undefined)
            .slice(0, 10); // Show max 10 recent games
    } catch (error) {
        return [];
    }
}

// Save Recent Game
function saveRecentGame(game) {
    let recent = [];
    const stored = localStorage.getItem('recentGames');
    
    if (stored) {
        try {
            recent = JSON.parse(stored);
        } catch (error) {
            recent = [];
        }
    }

    // Remove if already exists
    recent = recent.filter(id => id !== game.id);
    
    // Add to beginning
    recent.unshift(game.id);
    
    // Keep only last 10
    recent = recent.slice(0, 10);
    
    localStorage.setItem('recentGames', JSON.stringify(recent));
    
    // Reload recent games section
    loadRecentGames();
}

// Cache Data in LocalStorage
function setCachedData(key, data) {
    const cacheData = {
        data: data,
        timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
}

// Get Cached Data from LocalStorage
function getCachedData(key) {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    try {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        const maxAge = 10 * 24 * 60 * 60 * 1000; // 10 days
        
        if (age > maxAge) {
            localStorage.removeItem(key);
            return null;
        }
        
        return data;
    } catch (error) {
        return null;
    }
}

// Check and Clear Expired Cache
function checkCacheExpiry() {
    const lastCheck = localStorage.getItem('lastCacheCheck');
    const now = Date.now();
    
    if (!lastCheck || (now - parseInt(lastCheck)) > (24 * 60 * 60 * 1000)) {
        // Check all cached items
        ['onlineGames', 'offlineGames'].forEach(key => {
            getCachedData(key); // This will auto-remove if expired
        });
        
        localStorage.setItem('lastCacheCheck', now.toString());
    }
}

// Update Network Status
function updateNetworkStatus() {
    if (navigator.onLine) {
        networkStatus.classList.add('hidden');
        isOfflineMode = false;
    } else {
        networkStatus.classList.remove('hidden');
        networkStatus.classList.remove('online');
        networkMessage.textContent = '⚠️ You are offline. Showing cached games.';
        isOfflineMode = true;
    }
}

// Update Theme Icon
function updateThemeIcon() {
    const theme = document.documentElement.getAttribute('data-theme');
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    
    if (theme === 'dark') {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }
}

// Setup Infinite Scroll
function setupInfiniteScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isLoading) {
                const filtered = filterGames();
                const hasMore = (currentPage * gamesPerPage) < filtered.length;
                
                if (hasMore) {
                    isLoading = true;
                    loadingSpinner.classList.remove('hidden');
                    
                    setTimeout(() => {
                        displayGames(true);
                        loadingSpinner.classList.add('hidden');
                        isLoading = false;
                    }, 500);
                }
            }
        });
    }, { threshold: 0.5 });

    observer.observe(loadingSpinner);
}

// Setup Event Listeners
function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon();
    });

    // Search
    searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value;
        displayGames();
    });

    // Category filters
    categoriesWrapper.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-btn')) {
            // Update active state
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');

            // Update current category and display
            currentCategory = e.target.getAttribute('data-category');
            displayGames();
        }
    });

    // Game viewer controls
    closeGameBtn.addEventListener('click', closeGame);
    fullscreenGameBtn.addEventListener('click', toggleFullscreen);

    // Network status
    window.addEventListener('online', () => {
        updateNetworkStatus();
        loadGames(); // Reload games when back online
    });

    window.addEventListener('offline', () => {
        updateNetworkStatus();
        displayGames(); // Refresh to show only offline games
    });

    // Logo click - reload
    document.querySelector('.logo').addEventListener('click', () => {
        location.reload();
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
