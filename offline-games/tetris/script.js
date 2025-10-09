const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const startBtn = document.getElementById('start');

const BLOCK_SIZE = 20;
const BOARD_WIDTH = 12;
const BOARD_HEIGHT = 20;

const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[0, 1, 0], [1, 1, 1]], // T
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]], // Z
    [[1, 0, 0], [1, 1, 1]], // L
    [[0, 0, 1], [1, 1, 1]]  // J
];

const COLORS = ['#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'];

let board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
let currentPiece = null;
let currentX = 0;
let currentY = 0;
let score = 0;
let level = 1;
let lines = 0;
let gameLoop = null;
let dropInterval = 1000;

function newPiece() {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    currentPiece = {
        shape: SHAPES[shapeIndex],
        color: COLORS[shapeIndex]
    };
    currentX = Math.floor(BOARD_WIDTH / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentY = 0;

    if (collision()) {
        gameOver();
    }
}

function collision() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                const newX = currentX + x;
                const newY = currentY + y;
                
                if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
                    return true;
                }
                if (newY >= 0 && board[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

function merge() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                board[currentY + y][currentX + x] = currentPiece.color;
            }
        }
    }
}

function rotate() {
    const rotated = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
    );
    const previous = currentPiece.shape;
    currentPiece.shape = rotated;
    
    if (collision()) {
        currentPiece.shape = previous;
    }
}

function clearLines() {
    let linesCleared = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++;
        }
    }

    if (linesCleared > 0) {
        lines += linesCleared;
        score += linesCleared * 100 * level;
        level = Math.floor(lines / 10) + 1;
        
        linesElement.textContent = lines;
        scoreElement.textContent = score;
        levelElement.textContent = level;
        
        dropInterval = Math.max(100, 1000 - (level * 100));
    }
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw board
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (board[y][x]) {
                ctx.fillStyle = board[y][x];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
            }
        }
    }

    // Draw current piece
    if (currentPiece) {
        ctx.fillStyle = currentPiece.color;
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    ctx.fillRect(
                        (currentX + x) * BLOCK_SIZE,
                        (currentY + y) * BLOCK_SIZE,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    );
                }
            }
        }
    }
}

function drop() {
    currentY++;
    if (collision()) {
        currentY--;
        merge();
        clearLines();
        newPiece();
    }
    draw();
}

function gameOver() {
    clearInterval(gameLoop);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
    startBtn.textContent = 'Restart';
}

function startGame() {
    board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    score = 0;
    level = 1;
    lines = 0;
    scoreElement.textContent = score;
    levelElement.textContent = level;
    linesElement.textContent = lines;
    dropInterval = 1000;
    
    clearInterval(gameLoop);
    newPiece();
    gameLoop = setInterval(drop, dropInterval);
    startBtn.textContent = 'Restart';
}

document.addEventListener('keydown', (e) => {
    if (!currentPiece) return;
    
    switch (e.key) {
        case 'ArrowLeft':
            currentX--;
            if (collision()) currentX++;
            break;
        case 'ArrowRight':
            currentX++;
            if (collision()) currentX--;
            break;
        case 'ArrowDown':
            drop();
            break;
        case 'ArrowUp':
            rotate();
            break;
    }
    draw();
});

startBtn.addEventListener('click', startGame);
draw();
