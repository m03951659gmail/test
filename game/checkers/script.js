document.addEventListener('DOMContentLoaded', () => {
            // Game constants
            const PLAYER = 'player';
            const AI = 'ai';
            const EMPTY = '';
            const KING = 'king';
            
            // Game state
            let board = [];
            let currentPlayer = PLAYER;
            let selectedPiece = null;
            let validMoves = [];
            let timerInterval = null;
            let seconds = 0;
            let turnCount = 0;
            let adTurnCount = 0;
            let soundEnabled = true;

            // DOM elements
            const splashScreen = document.querySelector('.splash-screen');
            const gameContainer = document.querySelector('.game-container');
            const boardElement = document.getElementById('board');
            const statusElement = document.getElementById('status');
            const newGameBtn = document.getElementById('newGameBtn');
            const timerElement = document.querySelector('.timer');
            const turnCountElement = document.querySelector('.turn-count');
            const resultScreen = document.getElementById('resultScreen');
            const resultTitle = document.getElementById('resultTitle');
            const resultImage = document.getElementById('resultImage');
            const finalTime = document.getElementById('finalTime');
            const finalTurns = document.getElementById('finalTurns');
            const playAgainBtn = document.getElementById('playAgainBtn');
            const adsScreen = document.getElementById('adsScreen');
            const countdownElement = document.getElementById('countdown');
            const adCloseBtn = document.getElementById('adCloseBtn');
            const soundToggle = document.getElementById('soundToggle');
            
            // Audio elements
            const clickSound = document.getElementById('clickSound');
            const moveSound = document.getElementById('moveSound');
            const winSound = document.getElementById('winSound');
            const loseSound = document.getElementById('loseSound');
            const buttonSound = document.getElementById('buttonSound');
            const captureSound = document.getElementById('captureSound');

            // Initialize the game
            function initGame() {
                // Create initial board
                board = Array(8).fill().map(() => Array(8).fill(EMPTY));
                
                // Set up AI pieces (top three rows)
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 8; col++) {
                        if ((row + col) % 2 === 1) {
                            board[row][col] = AI;
                        }
                    }
                }
                
                // Set up player pieces (bottom three rows)
                for (let row = 5; row < 8; row++) {
                    for (let col = 0; col < 8; col++) {
                        if ((row + col) % 2 === 1) {
                            board[row][col] = PLAYER;
                        }
                    }
                }
                
                currentPlayer = PLAYER;
                selectedPiece = null;
                validMoves = [];
                seconds = 0;
                turnCount = 0;
                adTurnCount = 0;
                
                updateTimer();
                updateTurnCount();
                renderBoard();
                updateStatus();
            }
            
            // Start the game timer
            function startTimer() {
                if (!timerInterval) {
                    timerInterval = setInterval(() => {
                        seconds++;
                        updateTimer();
                    }, 1000);
                }
            }
            
            // Stop the game timer
            function stopTimer() {
                if (timerInterval) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                }
            }
            
            // Update timer display
            function updateTimer() {
                const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
                const secs = (seconds % 60).toString().padStart(2, '0');
                timerElement.textContent = `Time: ${mins}:${secs}`;
            }
            
            // Update turn count display
            function updateTurnCount() {
                turnCountElement.textContent = `Turns: ${turnCount}`;
            }
            
            // Play sound effect
            function playSound(sound) {
                if (soundEnabled) {
                    sound.currentTime = 0;
                    sound.play().catch(e => console.log("Audio play failed:", e));
                }
            }
            
            // Toggle sound
            function toggleSound() {
                soundEnabled = !soundEnabled;
                soundToggle.classList.toggle('off', !soundEnabled);
                playSound(buttonSound);
            }
            
            // Render the board
            function renderBoard() {
                boardElement.innerHTML = '';
                
                for (let row = 0; row < 8; row++) {
                    for (let col = 0; col < 8; col++) {
                        const cell = document.createElement('div');
                        cell.className = `cell ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                        cell.dataset.row = row;
                        cell.dataset.col = col;
                        
                        // Highlight valid moves
                        if (validMoves.some(move => move.to.row === row && move.to.col === col)) {
                            const move = validMoves.find(m => m.to.row === row && m.to.col === col);
                            if (move.captured) {
                                cell.classList.add('valid-capture');
                            } else {
                                cell.classList.add('valid-move');
                            }
                        }
                        
                        // Add piece if present
                        if (board[row][col] !== EMPTY) {
                            const piece = document.createElement('div');
                            const pieceType = board[row][col];
                            piece.className = `piece ${pieceType === PLAYER || (pieceType.king && pieceType.color === PLAYER) ? PLAYER : AI}`;
                            
                            // Check if king
                            if (typeof pieceType === 'object' && pieceType.king) {
                                piece.classList.add(KING);
                            }
                            
                            // Highlight selected piece
                            if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
                                piece.classList.add('selected');
                            }
                            
                            piece.addEventListener('click', () => {
                                playSound(clickSound);
                                handlePieceClick(row, col);
                            });
                            cell.appendChild(piece);
                        } else if (currentPlayer === PLAYER) {
                            cell.addEventListener('click', () => {
                                playSound(clickSound);
                                handleCellClick(row, col);
                            });
                        }
                        
                        boardElement.appendChild(cell);
                    }
                }
            }
            
            // Update game status display
            function updateStatus() {
                const winner = getWinner();
                if (winner !== null) {
                    showResultScreen(winner);
                } else {
                    statusElement.textContent = `${currentPlayer === PLAYER ? 'Player' : 'AI'}'s turn`;
                }
            }
            
            // Determine the winner (null if game not over)
            function getWinner() {
                let playerPieces = 0;
                let aiPieces = 0;
                let playerHasMoves = false;
                let aiHasMoves = false;
                
                for (let row = 0; row < 8; row++) {
                    for (let col = 0; col < 8; col++) {
                        const piece = board[row][col];
                        if (piece === PLAYER || (typeof piece === 'object' && piece.color === PLAYER)) {
                            playerPieces++;
                            if (!playerHasMoves && getValidMoves(row, col).length > 0) {
                                playerHasMoves = true;
                            }
                        } else if (piece === AI || (typeof piece === 'object' && piece.color === AI)) {
                            aiPieces++;
                            if (!aiHasMoves && getValidMoves(row, col).length > 0) {
                                aiHasMoves = true;
                            }
                        }
                    }
                }
                
                if (playerPieces === 0 || (currentPlayer === PLAYER && !playerHasMoves)) return AI;
                if (aiPieces === 0 || (currentPlayer === AI && !aiHasMoves)) return PLAYER;
                
                return null;
            }
            
            // Show result screen
            function showResultScreen(winner) {
                stopTimer();
                
                if (winner === PLAYER) {
                    resultTitle.textContent = "You Win!";
                    resultTitle.className = "result-title win-title";
                    resultImage.src = "img/win.png";
                    playAgainBtn.className = "play-again-btn win-btn";
                    playSound(winSound);
                } else {
                    resultTitle.textContent = "You Lose!";
                    resultTitle.className = "result-title lose-title";
                    resultImage.src = "img/lose.png";
                    playAgainBtn.className = "play-again-btn lose-btn";
                    playSound(loseSound);
                }
                
                finalTime.textContent = timerElement.textContent.replace("Time: ", "");
                finalTurns.textContent = turnCount;
                
                resultScreen.style.display = "flex";
            }
            
            // Show ads screen
            function showAdsScreen() {
                adsScreen.style.display = "flex";
                adCloseBtn.classList.remove("active");
                let countdown = 5;
                countdownElement.textContent = countdown;
                
                const countdownInterval = setInterval(() => {
                    countdown--;
                    countdownElement.textContent = countdown;
                    
                    if (countdown <= 0) {
                        clearInterval(countdownInterval);
                        adCloseBtn.classList.add("active");
                    }
                }, 1000);
            }
            
            // Handle piece click
            function handlePieceClick(row, col) {
                if (currentPlayer !== PLAYER || getWinner() !== null) return;
                
                const piece = board[row][col];
                if ((piece === PLAYER || (typeof piece === 'object' && piece.king && piece.color === PLAYER))) {
                    selectedPiece = { row, col };
                    validMoves = getValidMoves(row, col);
                    renderBoard();
                }
            }
            
            // Handle cell click
            function handleCellClick(row, col) {
                if (!selectedPiece || currentPlayer !== PLAYER || getWinner() !== null) return;
                
                const move = validMoves.find(m => m.to.row === row && m.to.col === col);
                if (move) {
                    // Start timer on first move
                    if (turnCount === 0) {
                        startTimer();
                    }
                    
                    makeMove(move);
                    
                    // Play capture sound if a piece was captured
                    if (move.captured) {
                        playSound(captureSound);
                    } else {
                        playSound(moveSound);
                    }
                    
                    if (!move.captured || !hasMoreCaptures(row, col)) {
                        currentPlayer = AI;
                        turnCount++;
                        updateTurnCount();
                        updateStatus();
                        
                        // Check if we should show ads (every 10 turns)
                        adTurnCount++;
                        if (adTurnCount >= 10) {
                            adTurnCount = 0;
                            setTimeout(showAdsScreen, 500);
                        } else {
                            setTimeout(aiMove, 1000);
                        }
                    }
                }
            }
            
            // Get all valid moves for a piece
            function getValidMoves(row, col) {
                const piece = board[row][col];
                const moves = [];
                const isKing = typeof piece === 'object' && piece.king;
                const color = typeof piece === 'object' ? piece.color : piece;
                
                // Check captures first (mandatory)
                const captures = getCaptures(row, col, color, isKing);
                if (captures.length > 0) return captures;
                
                // Regular moves
                const directions = [];
                if (color === PLAYER || isKing) directions.push({ dr: -1, dc: -1 }, { dr: -1, dc: 1 }); // Upward
                if (color === AI || isKing) directions.push({ dr: 1, dc: -1 }, { dr: 1, dc: 1 }); // Downward
                
                for (const dir of directions) {
                    const newRow = row + dir.dr;
                    const newCol = col + dir.dc;
                    
                    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8 && board[newRow][newCol] === EMPTY) {
                        moves.push({
                            from: { row, col },
                            to: { row: newRow, col: newCol },
                            captured: null
                        });
                    }
                }
                
                return moves;
            }
            
            // Get all possible captures for a piece
            function getCaptures(row, col, color, isKing, mustCapture = null) {
                const captures = [];
                const directions = [
                    { dr: -1, dc: -1 }, { dr: -1, dc: 1 }, // Upward
                    { dr: 1, dc: -1 }, { dr: 1, dc: 1 }    // Downward
                ];
                
                for (const dir of directions) {
                    if (!isKing) {
                        if (color === PLAYER && dir.dr === 1) continue; // Player can't move down
                        if (color === AI && dir.dr === -1) continue;    // AI can't move up
                    }
                    
                    const midRow = row + dir.dr;
                    const midCol = col + dir.dc;
                    const destRow = row + 2 * dir.dr;
                    const destCol = col + 2 * dir.dc;
                    
                    if (destRow < 0 || destRow >= 8 || destCol < 0 || destCol >= 8) continue;
                    
                    const middlePiece = board[midRow][midCol];
                    if (middlePiece !== EMPTY && 
                        ((typeof middlePiece === 'object' && middlePiece.color !== color) || 
                         (typeof middlePiece === 'string' && middlePiece !== color))) {
                        
                        if (mustCapture && (midRow !== mustCapture.row || midCol !== mustCapture.col)) {
                            continue;
                        }
                        
                        if (board[destRow][destCol] === EMPTY) {
                            captures.push({
                                from: { row, col },
                                to: { row: destRow, col: destCol },
                                captured: { row: midRow, col: midCol }
                            });
                        }
                    }
                }
                
                return captures;
            }
            
            // Check if a piece has more captures
            function hasMoreCaptures(row, col) {
                const piece = board[row][col];
                const isKing = typeof piece === 'object' && piece.king;
                const color = typeof piece === 'object' ? piece.color : piece;
                return getCaptures(row, col, color, isKing).length > 0;
            }
            
            // Make a move on the board
            function makeMove(move) {
                const { from, to, captured } = move;
                const piece = board[from.row][from.col];
                
                // Move the piece
                board[to.row][to.col] = board[from.row][from.col];
                board[from.row][from.col] = EMPTY;
                
                // Remove captured piece
                if (captured) {
                    board[captured.row][captured.col] = EMPTY;
                }
                
                // Check for promotion
                if ((typeof piece === 'string' && piece === PLAYER && to.row === 0) || 
                    (typeof piece === 'string' && piece === AI && to.row === 7) ||
                    (typeof piece === 'object' && piece.color === PLAYER && to.row === 0) ||
                    (typeof piece === 'object' && piece.color === AI && to.row === 7)) {
                    
                    board[to.row][to.col] = {
                        color: typeof piece === 'object' ? piece.color : piece,
                        king: true
                    };
                }
                
                selectedPiece = { row: to.row, col: to.col };
                validMoves = captured ? getCaptures(to.row, to.col, 
                    typeof piece === 'object' ? piece.color : piece, 
                    typeof piece === 'object' && piece.king, 
                    captured) : [];
                
                renderBoard();
                updateStatus();
            }
            
            // AI move logic
            function aiMove() {
                if (getWinner() !== null) return;
                
                const move = findBestMove();
                if (move) {
                    makeMove(move);
                    
                    // Play capture sound if a piece was captured
                    if (move.captured) {
                        playSound(captureSound);
                    } else {
                        playSound(moveSound);
                    }
                    
                    if (move.captured && hasMoreCaptures(move.to.row, move.to.col)) {
                        setTimeout(aiMove, 1000);
                    } else {
                        currentPlayer = PLAYER;
                        updateStatus();
                    }
                } else {
                    currentPlayer = PLAYER;
                    updateStatus();
                }
            }
            
            // Simple AI - looks for best immediate move
            function findBestMove() {
                const moves = getAllValidMoves(AI);
                let bestMove = null;
                let bestScore = -Infinity;
                
                for (const move of moves) {
                    const originalBoard = JSON.parse(JSON.stringify(board));
                    makeMove(move);
                    
                    let currentRow = move.to.row;
                    let currentCol = move.to.col;
                    let moreCaptures = move.captured && hasMoreCaptures(currentRow, currentCol);
                    
                    while (moreCaptures) {
                        const captures = getCaptures(currentRow, currentCol, 
                            typeof board[currentRow][currentCol] === 'object' ? 
                            board[currentRow][currentCol].color : board[currentRow][currentCol], 
                            typeof board[currentRow][currentCol] === 'object' && 
                            board[currentRow][currentCol].king);
                        
                        if (captures.length === 0) break;
                        
                        const captureMove = captures[0];
                        makeMove(captureMove);
                        currentRow = captureMove.to.row;
                        currentCol = captureMove.to.col;
                        moreCaptures = hasMoreCaptures(currentRow, currentCol);
                    }
                    
                    const score = evaluateBoard();
                    
                    board = JSON.parse(JSON.stringify(originalBoard));
                    
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = move;
                    }
                }
                
                return bestMove;
            }
            
            // Get all valid moves for a player
            function getAllValidMoves(player) {
                const moves = [];
                let hasCaptures = false;
                
                for (let row = 0; row < 8; row++) {
                    for (let col = 0; col < 8; col++) {
                        const piece = board[row][col];
                        if ((piece === player || (typeof piece === 'object' && piece.color === player))) {
                            const captures = getCaptures(row, col, 
                                typeof piece === 'object' ? piece.color : piece, 
                                typeof piece === 'object' && piece.king);
                            
                            if (captures.length > 0) {
                                hasCaptures = true;
                                moves.push(...captures);
                            }
                        }
                    }
                }
                
                if (hasCaptures) return moves;
                
                for (let row = 0; row < 8; row++) {
                    for (let col = 0; col < 8; col++) {
                        const piece = board[row][col];
                        if ((piece === player || (typeof piece === 'object' && piece.color === player))) {
                            moves.push(...getValidMoves(row, col));
                        }
                    }
                }
                
                return moves;
            }
            
            // Evaluate board position
            function evaluateBoard() {
                let score = 0;
                
                for (let row = 0; row < 8; row++) {
                    for (let col = 0; col < 8; col++) {
                        const piece = board[row][col];
                        
                        if (piece === AI) {
                            score += 3 + (7 - row) * 0.1;
                        } else if (piece === PLAYER) {
                            score -= 3 + row * 0.1;
                        } else if (typeof piece === 'object') {
                            if (piece.color === AI) {
                                score += 5 + (3.5 - Math.abs(col - 3.5)) * 0.1;
                            } else {
                                score -= 5 + (3.5 - Math.abs(col - 3.5)) * 0.1;
                            }
                        }
                    }
                }
                
                return score;
            }
            
            // Event listeners
            document.querySelector('.play-btn').addEventListener('click', () => {
                playSound(buttonSound);
                splashScreen.classList.add('hidden');
                setTimeout(() => {
                    splashScreen.style.display = 'none';
                    gameContainer.style.display = 'flex';
                    initGame();
                }, 500);
            });
            
            newGameBtn.addEventListener('click', () => {
                playSound(buttonSound);
                initGame();
            });
            
            playAgainBtn.addEventListener('click', () => {
                playSound(buttonSound);
                resultScreen.style.display = 'none';
                initGame();
            });
            
            adCloseBtn.addEventListener('click', () => {
                playSound(buttonSound);
                adsScreen.style.display = 'none';
                if (currentPlayer === AI) {
                    setTimeout(aiMove, 500);
                }
            });
            
            soundToggle.addEventListener('click', toggleSound);
        });