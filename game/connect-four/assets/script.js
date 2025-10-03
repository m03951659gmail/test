    // Complete Connect Four Game Implementation

    // Board configuration
    const BOARD_CONFIG = {
      ROWS: 6,
      COLUMNS: 8,
      PLAYER_1_COLOR: "#ef453b",
      PLAYER_2_COLOR: "#0059ff",
      PIECE_STROKE_STYLE: "black",
      MASK_COLOR: "#d8d8d8"
    };

    // Board piece types
    const BoardPiece = {
      EMPTY: 0,
      PLAYER_1: 1,
      PLAYER_2: 2,
      DRAW: 3
    };

    // Game state
    let gameState = {
      board: null,
      game: null,
      currentPlayer: 1,
      gameWon: false,
      isHumanTurn: true,
      winningPieces: []
    };

    // Board class
    class Board {
      constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.getBoardScale();
        this.initConstants();
        this.reset();
        this.setupResize();
      }

      reset() {
        this.map = [];
        for (let row = 0; row < BOARD_CONFIG.ROWS; row++) {
          this.map.push([]);
          for (let col = 0; col < BOARD_CONFIG.COLUMNS; col++) {
            this.map[row].push(BoardPiece.EMPTY);
          }
        }
        this.winnerBoardPiece = BoardPiece.EMPTY;
        this.winningPieces = [];
        this.clearCanvas();
      }

      getBoardScale() {
        this.SCALE = window.innerWidth < 640 ? 0.5 : 1;
        return this.SCALE;
      }

      initConstants() {
        this.CANVAS_HEIGHT = 480 * this.SCALE;
        this.CANVAS_WIDTH = 640 * this.SCALE;
        this.PIECE_RADIUS = 25 * this.SCALE;
        this.MASK_X_BEGIN = Math.max(0, (this.CANVAS_WIDTH - (3 * BOARD_CONFIG.COLUMNS + 1) * this.PIECE_RADIUS) / 2);
        this.MASK_Y_BEGIN = Math.max(0, (this.CANVAS_HEIGHT - (3 * BOARD_CONFIG.ROWS + 1) * this.PIECE_RADIUS) / 2);

        this.canvas.width = this.CANVAS_WIDTH;
        this.canvas.height = this.CANVAS_HEIGHT;
      }

      setupResize() {
        const currentScale = this.SCALE;
        window.addEventListener('resize', () => {
          this.getBoardScale();
          if (currentScale !== this.SCALE) {
            this.initConstants();
            this.clearCanvas();
            this.render();
          }
        });
      }

      async applyPlayerAction(player, column) {
        if (this.map[0][column] !== BoardPiece.EMPTY || column < 0 || column >= BOARD_CONFIG.COLUMNS) {
          return false;
        }

        let foundEmpty = false;
        let targetRow = 0;

        for (let row = 0; row < BOARD_CONFIG.ROWS - 1; row++) {
          if (this.map[row + 1][column] !== BoardPiece.EMPTY) {
            foundEmpty = true;
            targetRow = row;
            break;
          }
        }

        if (!foundEmpty) {
          targetRow = BOARD_CONFIG.ROWS - 1;
        }

        await this.animateAction(targetRow, column, player);
        this.map[targetRow][column] = player;
        this.render();
        return true;
      }

      async animateAction(row, column, player) {
        const color = this.getPlayerColor(player);
        let dropY = 0;
        const targetY = 3 * this.PIECE_RADIUS * row;

        while (targetY >= dropY) {
          this.clearCanvas();
          this.draw3DCircle({
            x: 3 * this.PIECE_RADIUS * column + this.MASK_X_BEGIN + 2 * this.PIECE_RADIUS,
            y: dropY + this.MASK_Y_BEGIN + 2 * this.PIECE_RADIUS,
            r: this.PIECE_RADIUS,
            fillStyle: color,
            strokeStyle: BOARD_CONFIG.PIECE_STROKE_STYLE
          });
          this.render();
          dropY += this.PIECE_RADIUS;
          await this.animationFrame();
        }

        // Play sound
        playSound('drop'); 
        return true;
      }

      getWinner() {
        if (this.winnerBoardPiece !== BoardPiece.EMPTY) {
          return this.winnerBoardPiece;
        }

        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
        let emptySpaces = 0;

        for (let row = 0; row < BOARD_CONFIG.ROWS; row++) {
          for (let col = 0; col < BOARD_CONFIG.COLUMNS; col++) {
            const piece = this.map[row][col];
            if (piece !== BoardPiece.EMPTY) {
              for (let [dr, dc] of directions) {
                const winningLine = this.checkDirection(row, col, piece, dr, dc);
                if (winningLine.length >= 4) {
                  this.winnerBoardPiece = piece;
                  this.winningPieces = winningLine;
                  return piece;
                }
              }
            } else {
              emptySpaces++;
            }
          }
        }

        if (emptySpaces === 0) {
          this.winnerBoardPiece = BoardPiece.DRAW;
          return BoardPiece.DRAW;
        }

        return BoardPiece.EMPTY;
      }

      checkDirection(startRow, startCol, piece, dr, dc) {
        const winningPieces = [];
        let r = startRow;
        let c = startCol;
        
        // Check in one direction
        while (r >= 0 && r < BOARD_CONFIG.ROWS && c >= 0 && c < BOARD_CONFIG.COLUMNS && this.map[r][c] === piece) {
          winningPieces.push({row: r, col: c});
          r += dr;
          c += dc;
        }
        
        // Check in opposite direction
        r = startRow - dr;
        c = startCol - dc;
        while (r >= 0 && r < BOARD_CONFIG.ROWS && c >= 0 && c < BOARD_CONFIG.COLUMNS && this.map[r][c] === piece) {
          winningPieces.unshift({row: r, col: c});
          r -= dr;
          c -= dc;
        }
        
        return winningPieces;
      }

      async announceWinner() {
        if (this.winnerBoardPiece !== BoardPiece.EMPTY) {
          // Trigger win animations
          if (this.winnerBoardPiece !== BoardPiece.DRAW) {
            await this.animateWinningPieces();
            this.createConfettiExplosion();
          }

          let message = "<h1>Game Over!</h1>";
          if (this.winnerBoardPiece === BoardPiece.DRAW) {
            message += "It's a draw! Well played!";
            playSound('draw');
          } else {
            message += `Player ${this.winnerBoardPiece} wins! 🎉`;
            playSound('win');
          }
          message += "<br>Click the board to play again.";
          this.showMessage(message);
        }
      }

      async animateWinningPieces() {
        const animationDuration = 2000; // 2 seconds
        const startTime = Date.now();
        
        while (Date.now() - startTime < animationDuration) {
          this.render(true);
          await this.animationFrame();
        }
      }

      createConfettiExplosion() {
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
          const confetti = document.createElement('div');
          confetti.className = 'confetti';
          confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
          confetti.style.left = Math.random() * 100 + '%';
          confetti.style.top = '100%';
          confetti.style.animation = `confettiExplosion ${2 + Math.random() * 3}s ease-out forwards`;
          confetti.style.animationDelay = Math.random() * 0.5 + 's';
          
          document.body.appendChild(confetti);
          
          setTimeout(() => {
            document.body.removeChild(confetti);
          }, 5000);
        }
      }

      getPlayerColor(player) {
        switch (player) {
          case BoardPiece.PLAYER_1:
            return BOARD_CONFIG.PLAYER_1_COLOR;
          case BoardPiece.PLAYER_2:
            return BOARD_CONFIG.PLAYER_2_COLOR;
          default:
            return "transparent";
        }
      }

      // Enhanced 3D circle drawing
      draw3DCircle({ x = 0, y = 0, r = 0, fillStyle = "", strokeStyle = "", isWinning = false }) {
        this.context.save();
        
        // Create radial gradient for 3D effect
        const gradient = this.context.createRadialGradient(
          x - r * 0.3, y - r * 0.3, 0,  // Inner circle (highlight)
          x, y, r                        // Outer circle
        );
        
        if (fillStyle === BOARD_CONFIG.PLAYER_1_COLOR) {
          gradient.addColorStop(0, '#FF8A80');  // Light red highlight
          gradient.addColorStop(0.3, '#ef453b'); // Original red
          gradient.addColorStop(0.7, '#D32F2F'); // Darker red
          gradient.addColorStop(1, '#B71C1C');   // Darkest red shadow
        } else if (fillStyle === BOARD_CONFIG.PLAYER_2_COLOR) {
          gradient.addColorStop(0, '#82B1FF');  // Light blue highlight  
          gradient.addColorStop(0.3, '#0059ff'); // Original blue
          gradient.addColorStop(0.7, '#1976D2'); // Darker blue
          gradient.addColorStop(1, '#0D47A1');   // Darkest blue shadow
        } else if (fillStyle === "transparent") {
          // For empty spaces, create a subtle inner shadow
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        }

        // Draw shadow first
        if (fillStyle !== "transparent") {
          this.context.beginPath();
          this.context.arc(x + 3, y + 3, r, 0, 2 * Math.PI, false);
          this.context.fillStyle = 'rgba(0, 0, 0, 0.3)';
          this.context.fill();
        }

        // Draw main circle with gradient
        this.context.beginPath();
        this.context.arc(x, y, r, 0, 2 * Math.PI, false);
        this.context.fillStyle = fillStyle === "transparent" ? gradient : gradient;
        this.context.fill();

        // Add winning piece effects
        if (isWinning) {
          // Glowing effect
          this.context.beginPath();
          this.context.arc(x, y, r + 5, 0, 2 * Math.PI, false);
          this.context.fillStyle = 'rgba(255, 215, 0, 0.3)';
          this.context.fill();
          
          // Pulsing ring
          const time = Date.now() * 0.005;
          const pulseRadius = r + 8 + Math.sin(time) * 3;
          this.context.beginPath();
          this.context.arc(x, y, pulseRadius, 0, 2 * Math.PI, false);
          this.context.strokeStyle = 'rgba(255, 215, 0, 0.6)';
          this.context.lineWidth = 2;
          this.context.stroke();
        }

        // Add stroke
        if (strokeStyle && fillStyle !== "transparent") {
          this.context.beginPath();
          this.context.arc(x, y, r, 0, 2 * Math.PI, false);
          this.context.strokeStyle = strokeStyle;
          this.context.lineWidth = 2;
          this.context.stroke();
        }

        // Add specular highlight for extra 3D effect
        if (fillStyle !== "transparent") {
          const highlightGradient = this.context.createRadialGradient(
            x - r * 0.4, y - r * 0.4, 0,
            x - r * 0.4, y - r * 0.4, r * 0.5
          );
          highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
          highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

          this.context.beginPath();
          this.context.arc(x - r * 0.4, y - r * 0.4, r * 0.3, 0, 2 * Math.PI, false);
          this.context.fillStyle = highlightGradient;
          this.context.fill();
        }

        this.context.restore();
      }

      drawCircle({ x = 0, y = 0, r = 0, fillStyle = "", strokeStyle = "", isWinning = false }) {
        this.draw3DCircle({ x, y, r, fillStyle, strokeStyle, isWinning });
      }

      drawMask() {
        this.context.save();
        this.context.fillStyle = BOARD_CONFIG.MASK_COLOR;
        this.context.beginPath();

        const pieceRadius2 = 2 * this.PIECE_RADIUS;
        const pieceRadius3 = 3 * this.PIECE_RADIUS;

        for (let row = 0; row < BOARD_CONFIG.ROWS; row++) {
          for (let col = 0; col < BOARD_CONFIG.COLUMNS; col++) {
            this.context.arc(
              pieceRadius3 * col + this.MASK_X_BEGIN + pieceRadius2,
              pieceRadius3 * row + this.MASK_Y_BEGIN + pieceRadius2,
              this.PIECE_RADIUS,
              0,
              2 * Math.PI
            );
            this.context.rect(
              pieceRadius3 * col + this.MASK_X_BEGIN + 2 * pieceRadius2,
              pieceRadius3 * row + this.MASK_Y_BEGIN,
              -pieceRadius2,
              pieceRadius2
            );
          }
        }

        //this.context.fill();
        this.context.restore();
      }

      clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }

      render(showWinningAnimation = false) {
        this.drawMask();

        for (let row = 0; row < BOARD_CONFIG.ROWS; row++) {
          for (let col = 0; col < BOARD_CONFIG.COLUMNS; col++) {
            const isWinning = showWinningAnimation && this.winningPieces.some(
              piece => piece.row === row && piece.col === col
            );
            
            this.drawCircle({
              x: 3 * this.PIECE_RADIUS * col + this.MASK_X_BEGIN + 2 * this.PIECE_RADIUS,
              y: 3 * this.PIECE_RADIUS * row + this.MASK_Y_BEGIN + 2 * this.PIECE_RADIUS,
              r: this.PIECE_RADIUS,
              fillStyle: this.getPlayerColor(this.map[row][col]),
              strokeStyle: BOARD_CONFIG.PIECE_STROKE_STYLE,
              isWinning: isWinning
            });
          }
        }
      }

      animationFrame() {
        return new Promise(resolve => requestAnimationFrame(resolve));
      }

      showMessage(content) {
        const messageEl = document.querySelector('.message');
        const contentEl = document.querySelector('.message-body-content');
        const dismissEl = document.querySelector('.message-body-dismiss');

        messageEl.classList.remove('hidden');
        contentEl.innerHTML = content;

        const handleDismiss = () => {
          messageEl.classList.add('invisible');
          messageEl.addEventListener('transitionend', () => {
            messageEl.classList.add('hidden');
            messageEl.classList.remove('invisible');
          });
          dismissEl.removeEventListener('click', handleDismiss);
        };

        dismissEl.addEventListener('click', handleDismiss);
      }

      getColumnFromCoord({ x, y }) {
        for (let col = 0; col < BOARD_CONFIG.COLUMNS; col++) {
          const centerX = 3 * this.PIECE_RADIUS * col + this.MASK_X_BEGIN + 2 * this.PIECE_RADIUS;
          if ((x - centerX) * (x - centerX) <= this.PIECE_RADIUS * this.PIECE_RADIUS) {
            return col;
          }
        }
        return -1;
      }
    }

    // AI Player class with minimax algorithm
    class AIPlayer {
      constructor(piece) {
        this.boardPiece = piece;
        this.enemyPiece = piece === BoardPiece.PLAYER_1 ? BoardPiece.PLAYER_2 : BoardPiece.PLAYER_1;
        this.maxDepth = 4;
      }

      async getMove(board) {
        const boardCopy = this.cloneBoard(board.map);
        const result = this.minimax(boardCopy, 0, -Infinity, Infinity, true);
        console.log(`AI Player ${this.boardPiece} chooses column ${result.column} with score ${result.score}`);
        return result.column;
      }

      minimax(board, depth, alpha, beta, maximizing) {
        const winner = this.evaluateBoard(board);

        if (depth === this.maxDepth || winner !== null) {
          return { score: this.getScore(board, winner, depth), column: -1 };
        }

        const validMoves = this.getValidMoves(board);
        let bestColumn = validMoves[0];

        if (maximizing) {
          let maxScore = -Infinity;
          for (let col of validMoves) {
            const newBoard = this.makeMove(board, col, this.boardPiece);
            const score = this.minimax(newBoard, depth + 1, alpha, beta, false).score;

            if (score > maxScore) {
              maxScore = score;
              bestColumn = col;
            }

            alpha = Math.max(alpha, score);
            if (beta <= alpha) break;
          }
          return { score: maxScore, column: bestColumn };
        } else {
          let minScore = Infinity;
          for (let col of validMoves) {
            const newBoard = this.makeMove(board, col, this.enemyPiece);
            const score = this.minimax(newBoard, depth + 1, alpha, beta, true).score;

            if (score < minScore) {
              minScore = score;
              bestColumn = col;
            }

            beta = Math.min(beta, score);
            if (beta <= alpha) break;
          }
          return { score: minScore, column: bestColumn };
        }
      }

      evaluateBoard(board) {
        // Check for winner
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

        for (let row = 0; row < BOARD_CONFIG.ROWS; row++) {
          for (let col = 0; col < BOARD_CONFIG.COLUMNS; col++) {
            const piece = board[row][col];
            if (piece !== BoardPiece.EMPTY) {
              for (let [dr, dc] of directions) {
                let count = 1;
                let r = row + dr;
                let c = col + dc;

                while (r >= 0 && r < BOARD_CONFIG.ROWS && c >= 0 && c < BOARD_CONFIG.COLUMNS && board[r][c] === piece) {
                  count++;
                  r += dr;
                  c += dc;
                }

                if (count >= 4) {
                  return piece;
                }
              }
            }
          }
        }

        // Check for draw
        if (this.getValidMoves(board).length === 0) {
          return BoardPiece.DRAW;
        }

        return null;
      }

      getScore(board, winner, depth) {
        if (winner === this.boardPiece) return 1000 - depth;
        if (winner === this.enemyPiece) return -1000 + depth;
        if (winner === BoardPiece.DRAW) return 0;

        // Evaluate position
        let score = 0;
        const center = Math.floor(BOARD_CONFIG.COLUMNS / 2);

        for (let row = 0; row < BOARD_CONFIG.ROWS; row++) {
          for (let col = 0; col < BOARD_CONFIG.COLUMNS; col++) {
            if (board[row][col] === this.boardPiece) {
              score += 3 - Math.abs(col - center);
            } else if (board[row][col] === this.enemyPiece) {
              score -= 3 - Math.abs(col - center);
            }
          }
        }

        return score;
      }

      getValidMoves(board) {
        const moves = [];
        for (let col = 0; col < BOARD_CONFIG.COLUMNS; col++) {
          if (board[0][col] === BoardPiece.EMPTY) {
            moves.push(col);
          }
        }
        return moves;
      }

      makeMove(board, column, piece) {
        const newBoard = this.cloneBoard(board);

        for (let row = BOARD_CONFIG.ROWS - 1; row >= 0; row--) {
          if (newBoard[row][column] === BoardPiece.EMPTY) {
            newBoard[row][column] = piece;
            break;
          }
        }

        return newBoard;
      }

      cloneBoard(board) {
        return board.map(row => [...row]);
      }
    }

    // Game class
    class Game {
      constructor(players, canvas) {
        this.players = players;
        this.board = new Board(canvas);
        this.currentPlayerIndex = 0;
        this.gameWon = false;
        this.moveAllowed = false;
      }

      async start() {
        this.moveAllowed = true;
        this.gameWon = false;
        this.board.reset();
        this.board.render();
        this.updateMessage(`Player ${this.currentPlayerIndex + 1}'s turn`);

        while (!this.gameWon) {
          await this.makeMove();
          const winner = this.board.getWinner();

          if (winner !== BoardPiece.EMPTY) {
            this.gameWon = true;
            this.moveAllowed = false;
            await this.board.announceWinner();
            break;
          }

          this.currentPlayerIndex = this.currentPlayerIndex === 0 ? 1 : 0;
          this.updateMessage(`Player ${this.currentPlayerIndex + 1}'s turn`);
        }
      }

      async makeMove() {
        if (!this.moveAllowed) return;

        const currentPlayer = this.players[this.currentPlayerIndex];
        let validMove = false;

        while (!validMove && !this.gameWon) {
          const column = await currentPlayer.getMove(this.board);
          this.moveAllowed = false;
          validMove = await this.board.applyPlayerAction(this.currentPlayerIndex + 1, column);
          this.moveAllowed = true;

          if (!validMove) {
            console.log("Invalid move, try again");
          }
        }
      }

      updateMessage(text) {
        const messageEl = document.querySelector('.section-message');
        if (messageEl) {
          messageEl.textContent = text;
        }
      }

      reset() {
        this.currentPlayerIndex = 0;
        this.gameWon = false;
        this.moveAllowed = false;
        this.board.reset();
        this.board.render();
      }
    }

    // Human Player class
    class HumanPlayer {
      constructor(canvas) {
        this.canvas = canvas;
        this.clickResolver = null;
        this.setupClickHandler();
      }

      setupClickHandler() {
        this.canvas.addEventListener('click', (event) => {
          const rect = this.canvas.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          const column = gameState.board.getColumnFromCoord({ x, y });

          if (this.clickResolver && column >= 0) {
            this.clickResolver(column);
          }
        });
      }

      async getMove(board) {
        return new Promise(resolve => {
          this.clickResolver = resolve;
        });
      }
    }

    // Initialize game
    function initGame() {
      const canvas = document.querySelector('.section-canvas');
      const selectedMode = document.querySelector('.mode-chooser-input:checked').value;

      let players = [];

      switch (selectedMode) {
        case 'offline-ai':
          players = [new HumanPlayer(canvas), new AIPlayer(BoardPiece.PLAYER_2)];
          break;
        case 'offline-human':
          players = [new HumanPlayer(canvas), new HumanPlayer(canvas)];
          break;
        default:
          players = [new HumanPlayer(canvas), new AIPlayer(BoardPiece.PLAYER_2)];
      }

      gameState.game = new Game(players, canvas);
      gameState.board = gameState.game.board;
      gameState.game.start();
    }

    // Enhanced preloader with smoother animation
    window.addEventListener('load', function () {
      // Initialize the board display
      const canvas = document.querySelector('.section-canvas');
      gameState.board = new Board(canvas);
      gameState.board.render();

      setTimeout(function () {
        const preloader = document.getElementById('preloader');
        preloader.style.opacity = '0';
        preloader.style.transform = 'scale(1.1)';
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 800);
      }, 2000);
    });

    // Game mode selection
    document.addEventListener('DOMContentLoaded', function () {
      const canvas = document.querySelector('.section-canvas');
      gameState.board = new Board(canvas);
      gameState.board.render();

      // Handle game start
      document.querySelector('.mode-chooser-submit').addEventListener('click', function () {
        const modeEl = document.querySelector('.mode');

        modeEl.classList.add('invisible');
        modeEl.addEventListener('transitionend', function () {
          modeEl.classList.add('hidden');
          initGame();
        });
      });

      // Handle board clicks for game reset
      canvas.addEventListener('click', function () {
        if (gameState.game && gameState.game.gameWon) {
          gameState.game.reset();
          setTimeout(() => gameState.game.start(), 100);
        }
      });
    });

    // Create floating particles
    function createParticles() {
      const particlesContainer = document.getElementById('particles');
      const particleCount = 50;

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particlesContainer.appendChild(particle);
      }
    }

    // Initialize particles
    createParticles();

    // Add interactive hover effects
    document.querySelectorAll('.mode-option').forEach(option => {
      option.addEventListener('mouseenter', function () {
        this.style.transform = 'scale(1.02)';
      });

      option.addEventListener('mouseleave', function () {
        this.style.transform = 'scale(1)';
      });
    });

    // Enhanced button click effect
    document.querySelector('.mode-chooser-submit').addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
      `;

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });

    // Add ripple animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    function playSound(type) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      let frequency, duration, gain;

      switch (type) {
        case 'drop':
          frequency = 220 + Math.random() * 100;
          duration = 0.2;
          gain = 0.3;
          break;
        case 'win':
          frequency = [523.25, 659.25, 783.99];
          duration = 0.15;
          gain = 0.5;
          break;
        case 'draw':
          frequency = 220;
          duration = 0.5;
          gain = 0.3;
          break;
        default:
          frequency = 440;
          duration = 0.1;
          gain = 0.2;
      }

      if (Array.isArray(frequency)) {
        let time = audioContext.currentTime;
        frequency.forEach((freq, i) => {
          oscillator.frequency.setValueAtTime(freq, time);
          time += duration;
        });
        gainNode.gain.setValueAtTime(gain, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration * frequency.length);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration * frequency.length);
      } else {
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gainNode.gain.value = gain;
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
      }
    }