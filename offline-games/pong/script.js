const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerScoreElement = document.getElementById('playerScore');
const computerScoreElement = document.getElementById('computerScore');
const startBtn = document.getElementById('start');

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;

let playerScore = 0;
let computerScore = 0;
let gameLoop = null;
let gameStarted = false;

const paddle1 = {
    x: 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

const paddle2 = {
    x: canvas.width - PADDLE_WIDTH - 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: BALL_SIZE,
    dx: 5,
    dy: 5
};

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
    ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
}

function update() {
    if (!gameStarted) return;

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top/bottom
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy *= -1;
    }

    // Ball collision with paddles
    if (ball.x - ball.size < paddle1.x + paddle1.width &&
        ball.y > paddle1.y &&
        ball.y < paddle1.y + paddle1.height) {
        ball.dx = Math.abs(ball.dx);
        ball.dx *= 1.05; // Increase speed slightly
    }

    if (ball.x + ball.size > paddle2.x &&
        ball.y > paddle2.y &&
        ball.y < paddle2.y + paddle2.height) {
        ball.dx = -Math.abs(ball.dx);
        ball.dx *= 1.05;
    }

    // Score points
    if (ball.x < 0) {
        computerScore++;
        computerScoreElement.textContent = computerScore;
        resetBall();
    }

    if (ball.x > canvas.width) {
        playerScore++;
        playerScoreElement.textContent = playerScore;
        resetBall();
    }

    // AI for computer paddle
    const paddleCenter = paddle2.y + paddle2.height / 2;
    if (paddleCenter < ball.y - 35) {
        paddle2.y += 4;
    } else if (paddleCenter > ball.y + 35) {
        paddle2.y -= 4;
    }

    // Keep paddles in bounds
    paddle1.y = Math.max(0, Math.min(canvas.height - paddle1.height, paddle1.y));
    paddle2.y = Math.max(0, Math.min(canvas.height - paddle2.height, paddle2.y));

    // Check for win
    if (playerScore >= 10 || computerScore >= 10) {
        gameOver();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() * 2 - 1) * 5;
}

function gameOver() {
    gameStarted = false;
    clearInterval(gameLoop);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    
    const winner = playerScore > computerScore ? 'Player' : 'Computer';
    ctx.fillText(`${winner} Wins!`, canvas.width / 2, canvas.height / 2);
    
    startBtn.textContent = 'Play Again';
}

function startGame() {
    playerScore = 0;
    computerScore = 0;
    playerScoreElement.textContent = playerScore;
    computerScoreElement.textContent = computerScore;
    
    paddle1.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
    paddle2.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
    
    resetBall();
    gameStarted = true;
    
    clearInterval(gameLoop);
    gameLoop = setInterval(() => {
        update();
        draw();
    }, 1000 / 60);
    
    startBtn.textContent = 'Restart';
}

function gameLoop() {
    update();
    draw();
}

// Mouse/Touch controls
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    paddle1.y = e.clientY - rect.top - paddle1.height / 2;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    paddle1.y = touch.clientY - rect.top - paddle1.height / 2;
});

startBtn.addEventListener('click', startGame);

draw();
