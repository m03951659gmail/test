# Game Portal - PWA Game Website

A feature-rich Progressive Web App (PWA) for playing online and offline games with a beautiful, modern UI.

## Features

✨ **Core Features**
- 🎮 Online and Offline Game Support
- 🌓 Dark/Light Mode Toggle
- 🔍 Real-time Search & Filter
- 📱 Fully Responsive Design
- ⚡ Infinite Scrolling (20 games per load)
- 💾 LocalStorage & Cache API
- 🎯 Recently Played Games
- 📂 Auto-generated Categories
- 🎨 Clean, Modern UI

🚀 **PWA Features**
- 📲 Install Prompt on First Visit
- 📴 Full Offline Support
- 🔄 Service Worker Caching
- 💿 Automatic Offline Game Caching
- 🌐 Network Status Detection
- ⚙️ Background Sync Support

🎯 **Game Features**
- 🖼️ Fullscreen Game Viewer with iFrame
- ⏮️ Back Button
- 🖥️ Fullscreen Toggle
- 📊 Game Analytics (Play Count)
- 🏆 High Score Tracking
- ⏰ 10-Day Auto Cache Cleanup

## File Structure

```
/
├── index.html              # Main HTML file
├── index.css              # Main styles
├── online.css             # Online-specific styles
├── offline.css            # Offline-specific styles
├── index.js               # Main JavaScript logic
├── online.js              # Online games functionality
├── offline.js             # Offline games functionality
├── pwa-install.js         # PWA installation logic
├── service-worker.js      # Service Worker for caching
├── manifest.json          # PWA manifest
├── onlinegameadd.json     # Online games data
├── offlinegameadd.json    # Offline games data
├── offline-games/         # Offline game files
│   ├── tic-tac-toe/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   ├── snake/
│   ├── memory-match/
│   ├── tetris/
│   └── pong/
└── offlineicon/           # Offline game icons
    ├── tic-tac-toe/
    ├── snake/
    ├── memory-match/
    ├── tetris/
    └── pong/
```

## Adding Games

### Adding Online Games

Edit `onlinegameadd.json` and add a new game object:

```json
{
  "id": "unique-id",
  "name": "Game Name",
  "description": "Game description",
  "url": "https://example.com/game",
  "icon": "https://example.com/icon.jpg",
  "category": "action"
}
```

### Adding Offline Games

1. Create a folder in `offline-games/` with your game files
2. Add an icon in `offlineicon/[game-name]/`
3. Edit `offlinegameadd.json`:

```json
{
  "id": "unique-id",
  "name": "Game Name",
  "description": "Game description",
  "url": "offline-games/game-folder/index.html",
  "icon": "offlineicon/game-icon-folder/icon.png",
  "category": "puzzle"
}
```

## Categories

Categories are automatically generated from the games' `category` field. Common categories:
- action
- puzzle
- racing
- shooting
- sports
- arcade
- strategy

## How It Works

### PWA Installation
1. User visits the site for the first time
2. Install banner appears automatically
3. User can install the app
4. Offline games are cached automatically on install

### Online/Offline Mode
- **Online**: Shows all games (online + offline)
- **Offline**: Shows only cached offline games
- Auto-detection of network status
- Seamless switching between modes

### Caching Strategy
- **Core Assets**: Cached on service worker install
- **Game Data**: Cached in LocalStorage (10-day expiry)
- **Offline Games**: Cached via Cache API
- **Recent Games**: Stored in LocalStorage

### Data Persistence
- Recent games: LocalStorage (10-day expiry)
- Game analytics: LocalStorage (permanent)
- Theme preference: LocalStorage (permanent)
- Cache check: Every 24 hours
- Auto cleanup: After 10 days

## Technologies Used

- HTML5
- CSS3 (with CSS Variables for theming)
- Vanilla JavaScript (ES6+)
- Service Worker API
- Cache API
- LocalStorage API
- Intersection Observer (for infinite scroll)
- Canvas API (for offline games)

## Browser Support

- ✅ Chrome/Edge (88+)
- ✅ Firefox (85+)
- ✅ Safari (14+)
- ✅ Opera (74+)
- ⚠️ iOS Safari (PWA support with limitations)

## Performance

- **Lazy Loading**: Images load on demand
- **Infinite Scroll**: Loads 20 games at a time
- **Service Worker**: Background caching
- **Optimized Assets**: Minimal CSS/JS
- **Fast Load**: Core assets < 100KB

## Customization

### Changing Theme Colors

Edit CSS variables in `index.css`:

```css
:root {
    --primary-color: #6366f1;
    --primary-dark: #4f46e5;
    /* ... other variables */
}
```

### Adjusting Game Load Count

Edit `index.js`:

```javascript
const gamesPerPage = 20; // Change this value
```

### Modifying Cache Duration

Edit `index.js`:

```javascript
const maxAge = 10 * 24 * 60 * 60 * 1000; // 10 days in milliseconds
```

## Development

### Running Locally

This is a static site, so you can:

1. **Using a local server:**
   ```bash
   python -m http.server 8000
   # or
   npx serve
   ```

2. **Open directly:**
   - Just open `index.html` in a browser
   - Note: Service Worker requires HTTPS or localhost

### Testing PWA

1. Use Chrome DevTools > Application tab
2. Check Service Worker status
3. Test offline mode
4. Audit with Lighthouse

## Included Offline Games

1. **Tic Tac Toe** - Classic two-player game
2. **Snake** - Retro snake game with score tracking
3. **Memory Match** - Card matching puzzle game
4. **Tetris Classic** - Block puzzle game
5. **Pong** - Classic arcade game

## SEO Features

- Meta tags for social sharing (Open Graph, Twitter)
- Descriptive title and meta description
- Semantic HTML structure
- Accessible markup
- Mobile-friendly viewport
- Fast loading times

## Security

- No external dependencies
- HTTPS recommended for PWA
- Content Security Policy compatible
- No data collection
- Privacy-focused (all data stored locally)

## Future Enhancements

- [ ] Push notifications for new games
- [ ] User accounts and cloud sync
- [ ] Multiplayer support
- [ ] Leaderboards
- [ ] Game ratings and reviews
- [ ] Social sharing
- [ ] More offline games

## License

This project is open source and available for personal and commercial use.

## Credits

Built with ❤️ using modern web technologies.

---

**Note**: Replace the placeholder game icons in `offlineicon/` with actual PNG images (recommended size: 192x192px or 512x512px).

**Note**: Add PWA icon images (`icon-72.png` through `icon-512.png`) in the root directory for the PWA to work properly.
