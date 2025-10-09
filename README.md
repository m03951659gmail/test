# Gaming Hub - Online & Offline Gaming Web Application

A modern, progressive web application (PWA) for playing online and offline games with a beautiful, responsive interface.

## Features

### Core Features
- ✨ **Dark/Light Mode** - Toggle between themes with persistent preferences
- 🔍 **Search & Filter** - Find games by name, description, or category
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- ⚡ **Infinite Scrolling** - Loads 20 games at a time for optimal performance
- 💾 **LocalStorage Caching** - Auto-clears every 10 days
- 🎯 **Recently Played** - Quick access to your recently played games

### PWA Features
- 📲 **Installable** - Install as a native app on any device
- 🔄 **Offline Support** - Play offline games when no internet connection
- 🚀 **Service Worker** - Fast loading and offline functionality
- 📦 **Auto-caching** - Offline games automatically cached on first visit

### Gaming Features
- 🎮 **Online Games** - Stream games from external sources
- 🎯 **Offline Games** - Fully functional games that work offline
- 🖼️ **Fullscreen Mode** - Games open in immersive fullscreen iframe
- 🏆 **Categories** - Auto-generated from game metadata
- 📊 **Game Cards** - Beautiful cards inspired by CrazyGames design

## Project Structure

```
gaming-hub/
├── index.html              # Main HTML file
├── index.css              # Main styles
├── online.css             # Online games styles
├── offline.css            # Offline games styles
├── index.js               # Main JavaScript logic
├── online.js              # Online games functionality
├── offline.js             # Offline games functionality
├── pwa-install.js         # PWA installation logic
├── service-worker.js      # Service worker for PWA
├── manifest.json          # PWA manifest
├── onlinegameadd.json     # Online games database
├── offlinegameadd.json    # Offline games database
├── icon-192.png           # PWA icon (192x192)
├── icon-512.png           # PWA icon (512x512)
├── offline-games/         # Offline game files
│   ├── tic-tac-toe/
│   ├── memory-match/
│   ├── snake/
│   ├── brick-breaker/
│   └── flappy-bird/
└── offlineicon/           # Offline game icons
    ├── tic-tac-toe/
    ├── memory-match/
    ├── snake/
    ├── brick-breaker/
    └── flappy-bird/
```

## Adding Games

### Adding Online Games

Edit `onlinegameadd.json` and add your game:

```json
{
  "id": "unique-id",
  "name": "Game Name",
  "description": "Game description",
  "url": "https://game-url.com",
  "icon": "https://icon-url.com/image.jpg",
  "category": "action"
}
```

### Adding Offline Games

1. Create a folder in `offline-games/` with your game files
2. Add an icon in `offlineicon/[game-folder]/icon.png`
3. Edit `offlinegameadd.json`:

```json
{
  "id": "unique-id",
  "name": "Game Name",
  "description": "Game description",
  "url": "offline-games/game-folder/index.html",
  "icon": "offlineicon/game-folder/icon.png",
  "category": "puzzle"
}
```

## Installation & Usage

### Local Development

1. Clone or download this repository
2. Serve the files using any HTTP server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (npx)
   npx serve
   
   # Using PHP
   php -S localhost:8000
   ```
3. Open `http://localhost:8000` in your browser

### Production Deployment

1. Upload all files to your web server
2. Ensure HTTPS is enabled (required for PWA)
3. The service worker will automatically register
4. Users can install the PWA from their browser

## Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ✅ All modern mobile browsers

## Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **JavaScript (ES6+)** - Vanilla JavaScript, no frameworks
- **Service Worker API** - PWA functionality
- **LocalStorage API** - Data persistence
- **Canvas API** - Offline games rendering

## Features Breakdown

### Cookie Consent
- Shows on first visit
- Stores user preference in localStorage
- Required for GDPR compliance

### Theme System
- Light and dark mode
- Persistent across sessions
- Smooth transitions

### Caching Strategy
- Static assets cached on install
- Offline games cached separately
- Auto-cleanup after 10 days
- Network-first for online games

### Game Player
- Fullscreen iframe for immersive experience
- Back button to return to library
- Device fullscreen option
- Auto-saves to recently played

## Included Offline Games

1. **Tic Tac Toe** - Classic X and O game with AI
2. **Memory Match** - Match pairs of emoji cards
3. **Snake** - Classic snake game with scoring
4. **Brick Breaker** - Break bricks with paddle and ball
5. **Flappy Bird** - Tap to fly through pipes

## Customization

### Changing Colors

Edit the CSS variables in `index.css`:

```css
:root {
    --accent-primary: #6200ea;
    --accent-secondary: #03dac6;
    /* ... other variables */
}
```

### Modifying Layout

The layout uses CSS Grid and Flexbox. Adjust the grid in `index.css`:

```css
.games-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}
```

## Performance

- ⚡ Lazy loading for images
- 🔄 Infinite scroll pagination
- 💾 Efficient caching strategy
- 📦 Minimal dependencies (vanilla JS)
- 🚀 Service worker pre-caching

## SEO

The application includes:
- Meta tags for description, keywords, author
- Open Graph tags for social sharing
- Twitter Card support
- Semantic HTML structure
- Fast loading times

## License

This project is open source and available for personal and commercial use.

## Credits

Created with ❤️ for gamers everywhere.

## Support

For issues or questions, please create an issue in the repository.

---

**Enjoy gaming! 🎮**
