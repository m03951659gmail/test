// ===== PWA INSTALLATION FUNCTIONALITY =====

let deferredPrompt;
let isAppInstalled = false;

// Check if app is already installed
window.addEventListener('load', () => {
    // Register service worker
    registerServiceWorker();
    
    // Check if running as PWA
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
        isAppInstalled = true;
        console.log('App is running as PWA');
    }
    
    // Cache offline games when app loads
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'CACHE_OFFLINE_GAMES'
        });
    }
});

// Register Service Worker
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/'
            });
            
            console.log('Service Worker registered successfully:', registration);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('Service Worker update found');
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('New Service Worker available');
                        // Optionally show update notification to user
                    }
                });
            });
            
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
}

// Capture the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (event) => {
    console.log('beforeinstallprompt event fired');
    
    // Prevent the default prompt
    event.preventDefault();
    
    // Store the event for later use
    deferredPrompt = event;
    
    // Show custom install prompt after a delay (if not already installed)
    if (!isAppInstalled && !hasUserDismissedPrompt()) {
        setTimeout(() => {
            showInstallPrompt();
        }, 5000); // Show after 5 seconds
    }
});

// Show custom install prompt
function showInstallPrompt() {
    const installPrompt = document.getElementById('pwaInstallPrompt');
    if (installPrompt) {
        installPrompt.classList.remove('hidden');
    }
}

// Hide install prompt
function hideInstallPrompt() {
    const installPrompt = document.getElementById('pwaInstallPrompt');
    if (installPrompt) {
        installPrompt.classList.add('hidden');
    }
}

// Check if user has dismissed the prompt before
function hasUserDismissedPrompt() {
    const dismissed = localStorage.getItem('pwaPromptDismissed');
    if (dismissed) {
        const dismissedDate = new Date(dismissed);
        const now = new Date();
        const daysSinceDismissal = (now - dismissedDate) / (1000 * 60 * 60 * 24);
        
        // Show prompt again after 7 days
        return daysSinceDismissal < 7;
    }
    return false;
}

// Install PWA button click handler
document.getElementById('installPWA')?.addEventListener('click', async () => {
    if (!deferredPrompt) {
        console.log('Install prompt not available');
        return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    
    if (outcome === 'accepted') {
        console.log('PWA installation accepted');
        isAppInstalled = true;
    }
    
    // Clear the deferred prompt
    deferredPrompt = null;
    
    // Hide the custom prompt
    hideInstallPrompt();
});

// Dismiss PWA install prompt
document.getElementById('dismissPWA')?.addEventListener('click', () => {
    // Save dismissal to localStorage
    localStorage.setItem('pwaPromptDismissed', new Date().toISOString());
    
    // Hide the prompt
    hideInstallPrompt();
});

// Listen for app installed event
window.addEventListener('appinstalled', (event) => {
    console.log('PWA was installed successfully');
    isAppInstalled = true;
    hideInstallPrompt();
    
    // Show success message
    showInstallSuccessMessage();
});

// Show installation success message
function showInstallSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'pwa-success-message';
    message.style.cssText = `
        position: fixed;
        top: 80px;
        right: 24px;
        background-color: #4caf50;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    message.innerHTML = `
        <strong>✓ App Installed!</strong><br>
        You can now access Gaming Hub from your home screen.
    `;
    document.body.appendChild(message);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        message.style.opacity = '0';
        message.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(message);
        }, 300);
    }, 5000);
}

// Handle offline status changes
window.addEventListener('online', () => {
    console.log('App is online');
    // Optionally refresh games or show notification
});

window.addEventListener('offline', () => {
    console.log('App is offline');
    // Optionally show offline notification
});

// Request persistent storage (if supported)
if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().then((granted) => {
        if (granted) {
            console.log('Storage will not be cleared except by explicit user action');
        } else {
            console.log('Storage may be cleared by the UA under storage pressure');
        }
    });
}
