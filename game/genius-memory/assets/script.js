
    class GeniusMemoryGame {
        constructor() {
            this.board = document.getElementById('gameBoard');
            this.movesDisplay = document.getElementById('moves');
            this.timeDisplay = document.getElementById('time');
            this.matchesDisplay = document.getElementById('matches');
            this.winModal = document.getElementById('winModal');
            this.restartBtn = document.getElementById('restartBtn');
            this.playAgainBtn = document.getElementById('playAgainBtn');
            this.soundToggle = document.getElementById('soundToggle');

            this.moves = 0;
            this.matches = 0;
            this.timer = 0;
            this.timerInterval = null;
            this.firstCard = null;
            this.secondCard = null;
            this.lockBoard = false;
            this.soundEnabled = true;
            this.currentLevel = '4x4';

            this.cardSymbols = {
                '4x4': ['🌟', '🎯', '🎨', '🎭', '🎪', '🎸', '🎺', '🎲'],
                '5x5': ['🌟', '🎯', '🎨', '🎭', '🎪', '🎸', '🎺', '🎲', '🎊', '🎈', '🎃', '🎁', '🎀'],
                '6x6': ['🌟', '🎯', '🎨', '🎭', '🎪', '🎸', '🎺', '🎲', '🎊', '🎈', '🎃', '🎁', '🎀', '🎖️', '🎗️', '🎫', '🎬', '🎤']
            };

            this.init();
        }

        init() {
            this.attachEventListeners();
            this.createBoard();
            this.startTimer();
        }

        attachEventListeners() {
            this.restartBtn.addEventListener('click', () => this.restartGame());
            this.playAgainBtn.addEventListener('click', () => this.closeWinModal());
            this.soundToggle.addEventListener('click', () => this.toggleSound());

            // Difficulty buttons
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.currentLevel = e.target.dataset.level;
                    this.restartGame();
                });
            });
        }

        createBoard() {
            this.board.innerHTML = '';
            this.board.className = `game-board grid-${this.currentLevel}`;

            const symbols = this.getShuffledSymbols();

            symbols.forEach((symbol, index) => {
                const card = document.createElement('div');
                card.className = 'card';
                card.dataset.symbol = symbol;
                card.dataset.index = index;

                card.innerHTML = `
                    <div class="card-face card-back"></div>
                    <div class="card-face card-front">${symbol}</div>
                `;

                card.addEventListener('click', () => this.flipCard(card));
                this.board.appendChild(card);
            });
        }

        getShuffledSymbols() {
            const level = this.currentLevel;
            const gridSize = parseInt(level.split('x')[0]);
            const totalCards = gridSize * gridSize;
            const pairsNeeded = totalCards / 2;

            const symbols = this.cardSymbols[level].slice(0, pairsNeeded);
            const doubledSymbols = [...symbols, ...symbols];

            return this.shuffleArray(doubledSymbols);
        }

        shuffleArray(array) {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }

        flipCard(card) {
            if (this.lockBoard || card.classList.contains('flipped') || card.classList.contains('matched')) {
                return;
            }

            card.classList.add('flipped');
            this.playSound('flip');

            if (!this.firstCard) {
                this.firstCard = card;
                return;
            }

            this.secondCard = card;
            this.moves++;
            this.movesDisplay.textContent = this.moves;
            this.lockBoard = true;

            this.checkForMatch();
        }

        checkForMatch() {
            const isMatch = this.firstCard.dataset.symbol === this.secondCard.dataset.symbol;

            setTimeout(() => {
                if (isMatch) {
                    this.handleMatch();
                } else {
                    this.handleMismatch();
                }
            }, 800);
        }

        handleMatch() {
            this.firstCard.classList.add('matched');
            this.secondCard.classList.add('matched');
            this.matches++;
            this.matchesDisplay.textContent = this.matches;

            this.playSound('match');
            this.resetBoard();

            if (this.checkWin()) {
                setTimeout(() => this.showWinModal(), 500);
            }
        }

        handleMismatch() {
            this.firstCard.classList.remove('flipped');
            this.secondCard.classList.remove('flipped');
            this.playSound('mismatch');
            this.resetBoard();
        }

        resetBoard() {
            [this.firstCard, this.secondCard] = [null, null];
            this.lockBoard = false;
        }

        checkWin() {
            const level = this.currentLevel;
            const gridSize = parseInt(level.split('x')[0]);
            const totalPairs = (gridSize * gridSize) / 2;
            return this.matches === totalPairs;
        }

        showWinModal() {
            this.stopTimer();
            this.playSound('win');

            document.getElementById('winMoves').textContent = this.moves;
            document.getElementById('winTime').textContent = this.formatTime(this.timer);

            this.winModal.classList.add('show');
        }

        closeWinModal() {
            this.winModal.classList.remove('show');
            this.restartGame();
        }

        restartGame() {
            this.moves = 0;
            this.matches = 0;
            this.timer = 0;
            this.movesDisplay.textContent = '0';
            this.matchesDisplay.textContent = '0';
            this.timeDisplay.textContent = '00:00';

            this.resetBoard();
            this.createBoard();
            this.startTimer();
        }

        startTimer() {
            this.stopTimer();
            this.timerInterval = setInterval(() => {
                this.timer++;
                this.timeDisplay.textContent = this.formatTime(this.timer);
            }, 1000);
        }

        stopTimer() {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
        }

        formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        toggleSound() {
            this.soundEnabled = !this.soundEnabled;
            this.soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
        }

        playSound(type) {
            if (!this.soundEnabled) return;

            // Create audio context for sound effects
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            let frequency = 440;
            let duration = 0.1;

            switch (type) {
                case 'flip':
                    frequency = 600;
                    duration = 0.1;
                    break;
                case 'match':
                    frequency = 800;
                    duration = 0.3;
                    break;
                case 'mismatch':
                    frequency = 300;
                    duration = 0.2;
                    break;
                case 'win':
                    frequency = 1000;
                    duration = 0.5;
                    break;
            }

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        }
    }

    // Initialize the game after enhanced preloader
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        const gameContainer = document.getElementById('gameContainer');

        // Enhanced preloader timing with multiple stages
        setTimeout(() => {
            preloader.classList.add('hidden');

            // Smooth transition to game
            setTimeout(() => {
                gameContainer.classList.add('loaded');
                new GeniusMemoryGame();
            }, 600);
        }, 3500); // Extended time to showcase all animations
    });
