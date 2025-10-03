// Preloader
window.addEventListener('load', function () {
    setTimeout(function () {
        const preloader = document.getElementById('preloader');
        preloader.style.opacity = '0';
        preloader.style.display = 'none';
            document.getElementById('game-container').style.display = 'block';
            createBackgroundParticles();
    }, 2000); // Simulate loading time
});

// Add CSS animations
const style = document.createElement('style');
style.innerHTML = `
    @keyframes pulse {
        from { opacity: 1; }
        to { opacity: 0.5; }
    }
    
    @keyframes scorePop {
        0% { transform: scale(1); }
        50% { transform: scale(1.5); }
        100% { transform: scale(1); }
    }
    
    @keyframes muzzleFlash {
        0% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.2); }
        100% { opacity: 0; transform: scale(0.8); }
    }
    
    @keyframes fireTrail {
        0% { opacity: 1; transform: scale(1) rotate(0deg); }
        100% { opacity: 0; transform: scale(0.3) rotate(360deg); }
    }
    
    @keyframes shockwave {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(3); opacity: 0; }
    }
    
    #score {
        transition: transform 0.2s ease-out;
    }
    
    .health-fill {
        transition: width 0.3s ease, opacity 0.3s ease;
    }
`;
document.head.appendChild(style);

// Background particles effect
function createBackgroundParticles() {
    const colors = ['#e94560', '#ff6b6b', '#ffc93c', '#00b8a9', '#ffffff'];

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        // Random properties
        const size = Math.random() * 5 + 2;
        const posX = Math.random() * window.innerWidth;
        const posY = Math.random() * window.innerHeight;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const duration = Math.random() * 15 + 10;
        const delay = Math.random() * 5;

        // Apply styles
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}px`;
        particle.style.top = `${posY}px`;
        particle.style.backgroundColor = color;
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;

        // Add to body
        document.body.appendChild(particle);

        // Add floating animation
        const keyframes = `
            @keyframes float {
                0% {
                    transform: translate(0, 0);
                }
                50% {
                    transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px);
                }
                100% {
                    transform: translate(0, 0);
                }
            }
        `;

        const style = document.createElement('style');
        style.innerHTML = keyframes;
        document.head.appendChild(style);
    }
}

// Game Variables
let canvas, ctx;
let gameRunning = false;
let score = 0;
let health = 100;
let animationId;
let enemies = [];
let bullets = [];
let particles = []; // New: For enhanced particle effects
let muzzleFlashes = []; // New: For muzzle flash effects
let screenShake = { x: 0, y: 0, intensity: 0, duration: 0 }; // New: Screen shake
let lastEnemyTime = 0;
let enemySpawnRate = 1500; // milliseconds

const player = {
    x: 0,
    y: 0,
    width: 60,
    height: 60,
    speed: 8,
    color: '#e94560',
    isShooting: false,
    lastShot: 0,
    shootDelay: 300, // milliseconds
    wingAngle: 0,
    wingDirection: 1,

    draw: function () {
        ctx.fillStyle = this.color;

        // Draw dragon body with glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow

        // Draw animated dragon wings
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(
            this.x - 20,
            this.y - 10,
            30,
            15 + Math.sin(this.wingAngle) * 5,
            Math.PI / 4 + Math.sin(this.wingAngle) * 0.2,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(
            this.x + 20,
            this.y - 10,
            30,
            15 + Math.sin(this.wingAngle) * 5,
            -Math.PI / 4 - Math.sin(this.wingAngle) * 0.2,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Update wing animation
        this.wingAngle += 0.1 * this.wingDirection;
        if (Math.abs(this.wingAngle) > 0.5) {
            this.wingDirection *= -1;
        }

        // Draw dragon eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x - 10, this.y - 5, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 10, this.y - 5, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x - 10, this.y - 5, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 10, this.y - 5, 2, 0, Math.PI * 2);
        ctx.fill();
    },

    update: function () {
        // Keep player within canvas bounds
        if (this.x < this.width / 2) this.x = this.width / 2;
        if (this.x > canvas.width - this.width / 2) this.x = canvas.width - this.width / 2;
        if (this.y < this.height / 2) this.y = this.height / 2;
        if (this.y > canvas.height - this.height / 2) this.y = canvas.height - this.height / 2;

        // Shooting logic
        if (this.isShooting && Date.now() - this.lastShot > this.shootDelay) {
            this.shoot();
            this.lastShot = Date.now();
        }
    },

    shoot: function () {
        bullets.push({
            x: this.x,
            y: this.y - this.height / 2,
            width: 5,
            height: 15,
            speed: 10,
            color: '#ffc93c',
            trail: [] // New: For bullet trail effect
        });

        // New: Create muzzle flash effect
        createMuzzleFlash(this.x, this.y - this.height / 2);
        
        // New: Create fire particles when shooting
        createFireParticles(this.x, this.y - this.height / 2);
        
        // New: Small screen shake when firing
        addScreenShake(1, 100);

        // Uncomment to add sound
        // const shootSound = new Audio('shoot.wav');
        // shootSound.play();
    }
};

// New: Create muzzle flash effect
function createMuzzleFlash(x, y) {
    muzzleFlashes.push({
        x: x,
        y: y,
        size: 30,
        opacity: 1,
        life: 0,
        maxLife: 5
    });
}

// New: Create fire particles when shooting
function createFireParticles(x, y) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + Math.random() * 10,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 3 - 2,
            size: Math.random() * 4 + 2,
            color: `hsl(${Math.random() * 60 + 15}, 100%, ${50 + Math.random() * 30}%)`,
            life: 0,
            maxLife: 15 + Math.random() * 10,
            type: 'fire'
        });
    }
}

// New: Add screen shake effect
function addScreenShake(intensity, duration) {
    screenShake.intensity = Math.max(screenShake.intensity, intensity);
    screenShake.duration = Math.max(screenShake.duration, duration);
}

// Initialize game
function initGame() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Set player initial position
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;

    // Event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.getElementById('start-button').addEventListener('click', startGame);
    document.getElementById('restart-button').addEventListener('click', restartGame);

    // Touch controls for mobile
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    // Mouse controls
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
}

// Resize canvas to fit window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Start game
function startGame() {
    const startScreen = document.getElementById('start-screen');
    startScreen.style.animation = 'fadeOut 0.5s forwards';
    setTimeout(() => {
        startScreen.style.display = 'none';
    }, 500);

    gameRunning = true;
    score = 0;
    health = 100;
    enemies = [];
    bullets = [];
    particles = []; // New: Reset particles
    muzzleFlashes = []; // New: Reset muzzle flashes
    screenShake = { x: 0, y: 0, intensity: 0, duration: 0 }; // New: Reset screen shake
    updateHealthBar();
    updateScore();
    gameLoop();
}

// Restart game
function restartGame() {
    document.getElementById('game-over-screen').style.display = 'none';
    startGame();
}

// Game over
function gameOver() {
    const gameOverScreen = document.getElementById('game-over-screen');
    gameOverScreen.style.display = 'flex';
    gameOverScreen.style.animation = 'fadeIn 0.5s forwards';

    gameRunning = false;
    cancelAnimationFrame(animationId);
    document.getElementById('final-score').textContent = score;
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;

    // New: Apply screen shake
    if (screenShake.duration > 0) {
        screenShake.x = (Math.random() - 0.5) * screenShake.intensity;
        screenShake.y = (Math.random() - 0.5) * screenShake.intensity;
        screenShake.duration--;
        screenShake.intensity *= 0.95; // Fade out shake
    } else {
        screenShake.x = 0;
        screenShake.y = 0;
    }

    // Apply screen shake transform
    ctx.save();
    ctx.translate(screenShake.x, screenShake.y);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    drawBackground();

    // Update and draw player
    player.update();
    player.draw();

    // Spawn enemies
    spawnEnemies();

    // Update and draw enemies
    updateEnemies();

    // Update and draw bullets
    updateBullets();

    // New: Update and draw particles
    updateParticles();
    
    // New: Update and draw muzzle flashes
    updateMuzzleFlashes();

    // Check collisions
    checkCollisions();

    // Restore transform
    ctx.restore();

    // Continue loop
    animationId = requestAnimationFrame(gameLoop);
}

// New: Update particles system
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        
        // Update particle
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;
        
        // Apply gravity for fire particles
        if (particle.type === 'fire') {
            particle.vy += 0.1;
        }
        
        // Calculate alpha and size with safety checks
        const alpha = Math.max(0, 1 - (particle.life / particle.maxLife));
        let drawSize = particle.size * alpha;
        
        // Handle different particle types
        if (particle.type === 'shockwave') {
            drawSize = particle.size * (particle.life / particle.maxLife);
        }
        
        // Ensure size is never negative or zero
        drawSize = Math.max(0.1, drawSize);
        
        // Draw particle only if it has a valid size and alpha
        if (alpha > 0 && drawSize > 0) {
            ctx.save();
            ctx.globalAlpha = alpha;
            
            if (particle.type === 'shockwave') {
                // Draw shockwave as a ring
                ctx.strokeStyle = particle.color;
                ctx.lineWidth = 2;
                ctx.shadowColor = particle.color;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, drawSize, 0, Math.PI * 2);
                ctx.stroke();
            } else {
                // Draw regular particles
                ctx.fillStyle = particle.color;
                ctx.shadowColor = particle.color;
                ctx.shadowBlur = Math.max(1, particle.size);
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, drawSize, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
        
        // Remove dead particles
        if (particle.life >= particle.maxLife || alpha <= 0) {
            particles.splice(i, 1);
        }
    }
}

// New: Update muzzle flashes
function updateMuzzleFlashes() {
    for (let i = muzzleFlashes.length - 1; i >= 0; i--) {
        const flash = muzzleFlashes[i];
        flash.life++;
        
        const alpha = Math.max(0, 1 - (flash.life / flash.maxLife));
        const size = Math.max(0.1, flash.size * (1 + flash.life * 0.2));
        
        if (alpha > 0 && size > 0) {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ffc93c';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(flash.x, flash.y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        if (flash.life >= flash.maxLife || alpha <= 0) {
            muzzleFlashes.splice(i, 1);
        }
    }
}

// Draw background
function drawBackground() {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0f3460');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    ctx.fillStyle = 'white';
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2;
        ctx.fillRect(x, y, size, size);
    }
}

// Spawn enemies
function spawnEnemies() {
    const now = Date.now();
    if (now - lastEnemyTime > enemySpawnRate) {
        const size = Math.random() * 30 + 20;
        enemies.push({
            x: Math.random() * (canvas.width - size) + size / 2,
            y: -size,
            width: size,
            height: size,
            speed: Math.random() * 2 + 1,
            color: `hsl(${Math.random() * 60 + 300}, 80%, 60%)`,
            health: Math.floor(size / 10)
        });
        lastEnemyTime = now;

        // Increase difficulty
        if (score > 0 && score % 500 === 0 && enemySpawnRate > 500) {
            enemySpawnRate -= 100;
        }
    }
}

// Update enemies
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        // Move enemy
        enemy.y += enemy.speed;

        // Draw enemy with glow effect
        ctx.save();
        ctx.fillStyle = enemy.color;
        ctx.shadowColor = enemy.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Draw enemy eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(enemy.x - enemy.width * 0.2, enemy.y - enemy.height * 0.1, enemy.width * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width * 0.2, enemy.y - enemy.height * 0.1, enemy.width * 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(enemy.x - enemy.width * 0.2, enemy.y - enemy.height * 0.1, enemy.width * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width * 0.2, enemy.y - enemy.height * 0.1, enemy.width * 0.05, 0, Math.PI * 2);
        ctx.fill();

        // Remove if off screen
        if (enemy.y > canvas.height + enemy.height) {
            enemies.splice(i, 1);
        }
    }
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];

        // Move bullet
        bullet.y -= bullet.speed;

        // New: Add to trail
        bullet.trail.push({ x: bullet.x, y: bullet.y + bullet.height });
        if (bullet.trail.length > 8) {
            bullet.trail.shift();
        }

        // New: Draw bullet trail
        for (let j = 0; j < bullet.trail.length; j++) {
            const trailPoint = bullet.trail[j];
            const alpha = (j + 1) / bullet.trail.length * 0.5;
            const size = Math.max(0.1, (j + 1) / bullet.trail.length * 3);
            
            if (alpha > 0 && size > 0) {
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = bullet.color;
                ctx.shadowColor = bullet.color;
                ctx.shadowBlur = 5;
                ctx.beginPath();
                ctx.arc(trailPoint.x, trailPoint.y, size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // Draw enhanced glowing bullet
        ctx.save();
        ctx.fillStyle = bullet.color;
        ctx.shadowColor = bullet.color;
        ctx.shadowBlur = 15;
        ctx.fillRect(bullet.x - bullet.width / 2, bullet.y, bullet.width, bullet.height);
        
        // Add inner glow
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 5;
        ctx.fillRect(bullet.x - bullet.width / 4, bullet.y + 2, bullet.width / 2, bullet.height - 4);
        ctx.restore();

        // Remove if off screen
        if (bullet.y + bullet.height < 0) {
            bullets.splice(i, 1);
        }
    }
}

// Check collisions
function checkCollisions() {
    // Bullet-enemy collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];

        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];

            // Simple circle collision detection
            const dx = bullet.x - enemy.x;
            const dy = (bullet.y + bullet.height / 2) - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < enemy.width / 2) {
                // Hit enemy
                enemy.health--;

                // Remove bullet
                bullets.splice(i, 1);

                // Enhanced hit effect
                createEnhancedHitEffect(enemy.x, enemy.y, enemy.color);

                // If enemy is dead
                if (enemy.health <= 0) {
                    // Add score
                    score += Math.floor(enemy.width);
                    updateScore();

                    // Remove enemy
                    enemies.splice(j, 1);

                    // Enhanced explosion with screen shake
                    createEnhancedExplosion(enemy.x, enemy.y, enemy.color, enemy.width);
                    addScreenShake(3, 200);
                }

                break;
            }
        }
    }

    // Player-enemy collisions
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < (player.width / 2 + enemy.width / 2)) {
            // Collision occurred
            health -= 10;
            updateHealthBar();

            // Remove enemy
            enemies.splice(i, 1);

            // Enhanced explosion
            createEnhancedExplosion(enemy.x, enemy.y, enemy.color, enemy.width);
            addScreenShake(5, 300);

            // Check if game over
            if (health <= 0) {
                health = 0;
                updateHealthBar();
                gameOver();
            }
        }
    }
}

// Enhanced hit effect
function createEnhancedHitEffect(x, y, color) {
    // Create spark particles
    for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 3 + 1,
            color: '#ffffff',
            life: 0,
            maxLife: 8 + Math.random() * 5,
            type: 'spark'
        });
    }
    
    // Create colored hit particles
    for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        
        particles.push({
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 4 + 2,
            color: color,
            life: 0,
            maxLife: 12 + Math.random() * 8,
            type: 'hit'
        });
    }
}

// Enhanced explosion effect
function createEnhancedExplosion(x, y, color, size) {
    const particleCount = Math.floor(size / 2) + 15;
    
    // Create shockwave effect
    particles.push({
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        size: size * 0.3,
        color: '#ffffff',
        life: 0,
        maxLife: 20,
        type: 'shockwave'
    });
    
    // Create explosion particles
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        const particleSize = Math.random() * 6 + 2;
        
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: particleSize,
            color: `hsl(${Math.random() * 60 + 15}, 100%, ${50 + Math.random() * 30}%)`,
            life: 0,
            maxLife: 25 + Math.random() * 15,
            type: 'explosion'
        });
    }
    
    // Create debris particles
    for (let i = 0; i < 6; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 2;
        
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1,
            size: Math.random() * 3 + 1,
            color: color,
            life: 0,
            maxLife: 40 + Math.random() * 20,
            type: 'debris'
        });
    }
}

// Create hit effect (keeping original for compatibility)
function createHitEffect(x, y, color) {
    createEnhancedHitEffect(x, y, color);
}

// Create explosion (keeping original for compatibility)
function createExplosion(x, y, color) {
    createEnhancedExplosion(x, y, color, 30);
}

// Update score display
function updateScore() {
    const scoreElement = document.getElementById('score');
    scoreElement.textContent = score;

    // Add pop animation
    scoreElement.style.transform = 'scale(1.5)';
    setTimeout(() => {
        scoreElement.style.transform = 'scale(1)';
    }, 200);
}

// Update health bar
function updateHealthBar() {
    const healthFill = document.getElementById('health-fill');
    healthFill.style.width = `${health}%`;

    if (health < 30) {
        healthFill.style.animation = 'pulse 0.5s infinite alternate';
    } else {
        healthFill.style.animation = 'none';
    }
}

// Keyboard controls
function handleKeyDown(e) {
    if (!gameRunning) return;

    switch (e.key) {
        case 'ArrowLeft':
            player.x -= player.speed;
            break;
        case 'ArrowRight':
            player.x += player.speed;
            break;
        case 'ArrowUp':
            player.y -= player.speed;
            break;
        case 'ArrowDown':
            player.y += player.speed;
            break;
        case ' ':
            player.isShooting = true;
            break;
    }
}

function handleKeyUp(e) {
    if (e.key === ' ') {
        player.isShooting = false;
    }
}

// Touch controls
let touchX = 0;
let touchY = 0;

function handleTouchStart(e) {
    if (!gameRunning) return;
    e.preventDefault();
    const touch = e.touches[0];
    touchX = touch.clientX;
    touchY = touch.clientY;
    player.isShooting = true;
}

function handleTouchMove(e) {
    if (!gameRunning) return;
    e.preventDefault();
    const touch = e.touches[0];
    player.x = touch.clientX;
    player.y = touch.clientY;
}

function handleTouchEnd(e) {
    if (!gameRunning) return;
    e.preventDefault();
    player.isShooting = false;
}

// Mouse controls
function handleMouseMove(e) {
    if (!gameRunning) return;
    player.x = e.clientX;
    player.y = e.clientY;
}

function handleMouseDown(e) {
    if (!gameRunning) return;
    player.isShooting = true;
}

function handleMouseUp(e) {
    if (!gameRunning) return;
    player.isShooting = false;
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);
