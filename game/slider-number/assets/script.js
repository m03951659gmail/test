    // Create animated background particles
    function createParticles() {
        const particles = document.getElementById('particles');
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
            particles.appendChild(particle);
        }
    }

    // Preloader
    window.addEventListener('load', function () {
        setTimeout(function () {
            document.getElementById('preloader').classList.add('hidden');
            document.getElementById('main-container').style.opacity = '1';
        }, 1500);
    });

    // Game variables
    let moves = 0;
    let seconds = 0;
    let timerInterval;
    let gameStarted = false;

    function updateMoves() {
        moves++;
        document.getElementById('moves').textContent = moves;

        // Add pulse animation
        const movesElement = document.getElementById('moves');
        movesElement.style.transform = 'scale(1.2)';
        setTimeout(() => {
            movesElement.style.transform = 'scale(1)';
        }, 150);
    }

    function startTimer() {
        if (!gameStarted) {
            gameStarted = true;
            clearInterval(timerInterval);
            seconds = 0;
            updateTimerDisplay();
            timerInterval = setInterval(function () {
                seconds++;
                updateTimerDisplay();
            }, 1000);
        }
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        document.getElementById('time').textContent =
            `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    function resetGameStats() {
        moves = 0;
        gameStarted = false;
        document.getElementById('moves').textContent = moves;
        clearInterval(timerInterval);
        seconds = 0;
        updateTimerDisplay();
    }

    // Enhanced confetti
    function createConfetti() {
        const container = document.getElementById('confetti-container');
        container.innerHTML = '';

        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'];

        for (let i = 0; i < 150; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';

            const color = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.backgroundColor = color;
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.animationDuration = Math.random() * 3 + 2 + 's';

            const size = Math.random() * 8 + 4;
            confetti.style.width = size + 'px';
            confetti.style.height = size + 'px';

            confetti.style.animation = `confetti-fall ${confetti.style.animationDuration} linear forwards`;

            container.appendChild(confetti);

            setTimeout(() => {
                confetti.style.opacity = '1';
            }, 10);
        }

        setTimeout(() => {
            container.innerHTML = '';
        }, 6000);
    }

    // Add confetti animation
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes confetti-fall {
            0% {
                transform: translateY(-100vh) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Win modal functions
    function showWinModal(timeText, movesCount) {
        const modal = document.getElementById('win-modal');
        const stats = document.getElementById('win-stats');
        stats.innerHTML = `
            <div>⏱️ Time: ${timeText}</div>
            <div>🎯 Moves: ${movesCount}</div>
        `;
        modal.classList.add('show');
    }

    function closeWinModal() {
        document.getElementById('win-modal').classList.remove('show');
    }

    // Game engine code
    var Factory = function (prototypeObject, methods) {
        for (var name in methods) {
            methods[name] = { value: methods[name] };
        }
        return Object.create(prototypeObject, methods);
    };

    var Board = (function () {
        this.squares = [];
        this.height = 0;
        this.width = 0;
        return function (methods) { return Factory(Board.prototype, methods) };
    })();

    Board.prototype = {
        forEachNeighbor: (function () {
            var neighborOffsets = [[0, -1], [1, 0], [0, 1], [-1, 0]],
                diagonalNeighborOffsets = [[1, -1], [1, 1], [-1, 1], [-1, -1]];
            return function (left, top, func, conditions) {
                conditions = conditions || {};
                conditions.visitDiagonals = conditions.visitDiagonals === 'undefined' ? true : conditions.visitDiagonals;

                var testEachNeighbor = function (offset, index, array) {
                    if (this.inbounds(left + offset[0], top + offset[1])) {
                        func.call(this, left + offset[0], top + offset[1]);
                    }
                };

                neighborOffsets.forEach(testEachNeighbor, this);
                if (conditions.visitDiagonals) {
                    diagonalNeighborOffsets.forEach(testEachNeighbor, this);
                }
            }
        })(),
        get: function (left, top) {
            if (this.inbounds(left, top)) {
                return this.squares[left + top * this.width];
            } else {
                throw new Error('Cannot return a value at position (' + left + ', ' + top + ') because it is out of bounds');
            }
        },
        getNeighbors: function (left, top, conditions) {
            var neighbors = [];
            this.forEachNeighbor(left, top, function (l, t) {
                neighbors.push({ left: l, top: t });
            }, conditions);
            return neighbors;
        },
        inbounds: function (left, top) {
            return top >= 0 && left < this.width && top < this.height && left >= 0;
        },
        set: function (left, top, value) {
            if (this.inbounds(left, top)) {
                this.squares[left + top * this.width] = value;
            }
        },
        swap: function (left, top, left2, top2) {
            var temp = this.get(left, top);
            this.set(left, top, this.get(left2, top2));
            this.set(left2, top2, temp);
        },
        isTerminal: function () {
            return this.squares.join() == this.getWinState().join();
        },
        randomize: function () {
            var blank = {}, blankIndex = this.squares.indexOf(0),
                last = { left: -1, top: -1 }, neighbors, randomNeighbor,
                shuffles = 10 * this.height * this.width;

            if (blankIndex != -1) {
                blank.top = Math.floor(blankIndex / this.width);
                blank.left = blankIndex - blank.top * this.width;

                for (var i = 0; i < shuffles; i++) {
                    neighbors = this.getNeighbors(blank.left, blank.top, { visitDiagonals: false }).filter(function (neighbor) {
                        return !(neighbor.left === last.left && neighbor.top === last.top);
                    });

                    if (neighbors.length > 0) {
                        randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
                        this.swap(blank.left, blank.top, randomNeighbor.left, randomNeighbor.top);
                        last = blank;
                        blank = randomNeighbor;
                    }
                }
            } else {
                throw Error('Cannot randomize: no empty square');
            }
        },
        reset: function (width, height) {
            this.height = height;
            this.width = width;
            this.squares = this.getWinState().slice(0);
        },
        getWinState: (function () {
            var lastBoardSize, cache;
            return function () {
                if (typeof (lastBoardSize) == 'undefined' || this.width * this.height !== lastBoardSize) {
                    lastBoardSize = this.width * this.height;
                    return cache = new Array(lastBoardSize + 1).join('0').split('').map(function (e, i, a) {
                        return i < a.length - 1 ? i + 1 : 0
                    });
                } else {
                    return cache;
                }
            };
        })()
    };

    var Game = function (methods) {
        return Factory(Object, methods);
    };

    var GameHTML5View = (function () {
        var canvas, ctx, game, squareSize;
        return function (methods) { return Factory(GameHTML5View.prototype, methods) };
    })();

    GameHTML5View.prototype = {
        attachHTML5Events: function (events) {
            for (var type in events) {
                for (var domId in events[type]) {
                    this.onHTML5Event(domId, type, events[type][domId]);
                }
            }
        },
        getCoordinates: function (event) {
            var x, y;
            if (event.offsetX || event.offsetY) {
                x = event.offsetX;
                y = event.offsetY;
            } else {
                if (event.x || event.y) {
                    x = event.x;
                    y = event.y;
                } else {
                    x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                    y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                }
                x -= this.canvas.offsetLeft;
                y -= this.canvas.offsetTop;
            }
            return { left: x, top: y };
        },
        onHTML5Event: function (id, type, func) {
            document.getElementById(id).addEventListener(type, func);
        },
        calculateSquareSize: function () {
            var height = this.canvas.height - 1, width = this.canvas.width - 1;
            this.squareSize = Math.min(Math.floor(width / this.game.board.width), Math.floor(height / this.game.board.height));
        },
        init: function (game, canvasId, events) {
            this.canvas = document.getElementById(canvasId);
            this.ctx = this.canvas.getContext('2d');
            this.game = game;
            this.attachHTML5Events(events);
        },
        render: function () {
            var board = this.game.board;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            for (var top = 0; top < board.height; top++) {
                for (var left = 0; left < board.width; left++) {
                    this.renderSquare(left, top);
                }
            }
        },
        renderSquare: function (left, top) {
            var board = this.game.board,
                ctx = this.ctx,
                ss = this.squareSize,
                fontSize = Math.floor(ss / 2.2),
                value = board.get(left, top);

            if (value === 0) {
                // Draw subtle empty space background
                const x = left * (ss + 1);
                const y = top * (ss + 1);

                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.beginPath();
                ctx.roundRect(x + 2, y + 2, ss - 4, ss - 4, 6);
                ctx.fill();

                // Inner shadow for empty space
                ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
                ctx.shadowBlur = 8;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.shadowInset = true;

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.roundRect(x + 2, y + 2, ss - 4, ss - 4, 6);
                ctx.stroke();

                // Reset shadow
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
            } else {
                const x = left * (ss + 1);
                const y = top * (ss + 1);
                const depth = 6; // 3D depth

                // Save context for transformations
                ctx.save();

                // 1. Draw bottom shadow (furthest back)
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.beginPath();
                ctx.roundRect(x + depth + 1, y + depth + 1, ss - 2, ss - 2, 8);
                ctx.fill();

                // 2. Draw 3D side faces
                // Right side face
                ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                ctx.beginPath();
                ctx.moveTo(x + ss, y);
                ctx.lineTo(x + ss + depth, y + depth);
                ctx.lineTo(x + ss + depth, y + ss + depth);
                ctx.lineTo(x + ss, y + ss);
                ctx.closePath();
                ctx.fill();

                // Bottom side face
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.beginPath();
                ctx.moveTo(x, y + ss);
                ctx.lineTo(x + depth, y + ss + depth);
                ctx.lineTo(x + ss + depth, y + ss + depth);
                ctx.lineTo(x + ss, y + ss);
                ctx.closePath();
                ctx.fill();

                // 3. Create main face gradient (top surface)
                const mainGradient = ctx.createLinearGradient(x, y, x, y + ss);

                // Color based on number value for variety
                const colors = [
                    ['#ff6b6b', '#ee5a24'], // Red
                    ['#4ecdc4', '#00d2d3'], // Teal  
                    ['#45b7d1', '#3742fa'], // Blue
                    ['#f9ca24', '#f0932b'], // Orange
                    ['#6c5ce7', '#a29bfe'], // Purple
                    ['#00b894', '#00cec9'], // Green
                    ['#fd79a8', '#e84393'], // Pink
                    ['#fdcb6e', '#e17055'], // Yellow
                    ['#74b9ff', '#0984e3']  // Light Blue
                ];

                const colorPair = colors[(value - 1) % colors.length];
                mainGradient.addColorStop(0, colorPair[0]);
                mainGradient.addColorStop(1, colorPair[1]);

                // 4. Draw main face
                ctx.fillStyle = mainGradient;
                ctx.beginPath();
                ctx.roundRect(x, y, ss, ss, 8);
                ctx.fill();

                // 5. Add top highlight (bevel effect)
                const highlightGradient = ctx.createLinearGradient(x, y, x, y + ss / 3);
                highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
                highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

                ctx.fillStyle = highlightGradient;
                ctx.beginPath();
                ctx.roundRect(x + 2, y + 2, ss - 4, ss / 2, 6);
                ctx.fill();

                // 6. Add inner shadow for depth
                const shadowGradient = ctx.createLinearGradient(x, y + ss * 0.7, x, y + ss);
                shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
                shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');

                ctx.fillStyle = shadowGradient;
                ctx.beginPath();
                ctx.roundRect(x + 2, y + ss * 0.7, ss - 4, ss * 0.3 - 2, 6);
                ctx.fill();

                // 7. Add border/edge highlight
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.roundRect(x + 0.5, y + 0.5, ss - 1, ss - 1, 8);
                ctx.stroke();

                // 8. Draw number with 3D text effect
                ctx.font = `bold ${fontSize}px Poppins`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Text depth/shadow layers
                for (let i = depth; i > 0; i--) {
                    ctx.fillStyle = `rgba(0, 0, 0, ${0.1 * (depth - i + 1)})`;
                    ctx.fillText(value, x + ss / 2 + i / 2, y + ss / 2 + i / 2);
                }

                // Main text with gradient
                const textGradient = ctx.createLinearGradient(x, y, x, y + ss);
                textGradient.addColorStop(0, '#ffffff');
                textGradient.addColorStop(1, '#f0f0f0');

                ctx.fillStyle = textGradient;
                ctx.fillText(value, x + ss / 2, y + ss / 2);

                // Text highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillText(value, x + ss / 2, y + ss / 2 - 1);

                // Restore context
                ctx.restore();
            }
        }
    };

    var GameInput = (function () {
        var game;
        return function (methods) { return Factory(Object, methods) };
    })();

    function main() {
        var slider = new Game({
            board: new Board({
                isTerminal: function () {
                    return this.squares.join() == this.getWinState().join();
                },
                randomize: function () {
                    var blank = {}, blankIndex = this.squares.indexOf(0),
                        last = { left: -1, top: -1 }, neighbors, randomNeighbor,
                        shuffles = 10 * this.height * this.width;

                    if (blankIndex != -1) {
                        blank.top = Math.floor(blankIndex / this.width);
                        blank.left = blankIndex - blank.top * this.width;

                        for (var i = 0; i < shuffles; i++) {
                            neighbors = this.getNeighbors(blank.left, blank.top, { visitDiagonals: false }).filter(function (neighbor) {
                                return !(neighbor.left === last.left && neighbor.top === last.top);
                            });

                            if (neighbors.length > 0) {
                                randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
                                this.swap(blank.left, blank.top, randomNeighbor.left, randomNeighbor.top);
                                last = blank;
                                blank = randomNeighbor;
                            }
                        }
                    } else {
                        throw Error('Cannot randomize: no empty square');
                    }
                },
                reset: function (width, height) {
                    this.height = height;
                    this.width = width;
                    this.squares = this.getWinState().slice(0);
                },
                getWinState: (function () {
                    var lastBoardSize, cache;
                    return function () {
                        if (typeof (lastBoardSize) == 'undefined' || this.width * this.height !== lastBoardSize) {
                            lastBoardSize = this.width * this.height;
                            return cache = new Array(lastBoardSize + 1).join('0').split('').map(function (e, i, a) {
                                return i < a.length - 1 ? i + 1 : 0
                            });
                        } else {
                            return cache;
                        }
                    };
                })()
            }),
            input: new GameInput({
                init: function (game) {
                    this.game = game;
                },
                onSquareClick: function (left, top) {
                    var board = this.game.board, view = this.game.view;
                    var blank = board.getNeighbors(left, top, { visitDiagonals: false }).filter(function (neighbor) {
                        return board.get(neighbor.left, neighbor.top) === 0;
                    })[0];

                    if (blank) {
                        // Start timer on first move
                        startTimer();

                        // Animate tile movement
                        const canvas = view.canvas;
                        const ctx = view.ctx;
                        const ss = view.squareSize;

                        // Create smooth animation
                        const fromX = left * (ss + 1);
                        const fromY = top * (ss + 1);
                        const toX = blank.left * (ss + 1);
                        const toY = blank.top * (ss + 1);

                        let progress = 0;
                        const animationDuration = 200; // ms
                        const startTime = Date.now();

                        const animate = () => {
                            const elapsed = Date.now() - startTime;
                            progress = Math.min(elapsed / animationDuration, 1);

                            // Easing function for smooth animation
                            const easeProgress = 1 - Math.pow(1 - progress, 3);

                            // Clear and redraw
                            view.render();

                            if (progress < 1) {
                                // Draw moving tile with 3D effect
                                const currentX = fromX + (toX - fromX) * easeProgress;
                                const currentY = fromY + (toY - fromY) * easeProgress;

                                const value = board.get(left, top);
                                const fontSize = Math.floor(ss / 2.2);
                                const depth = 6;

                                // Add slight lift effect during animation
                                const liftOffset = Math.sin(progress * Math.PI) * 3;
                                const animX = currentX;
                                const animY = currentY - liftOffset;

                                ctx.save();

                                // 1. Enhanced shadow during movement
                                ctx.fillStyle = `rgba(0, 0, 0, ${0.4 + liftOffset * 0.1})`;
                                ctx.beginPath();
                                ctx.roundRect(animX + depth + 2, animY + depth + 2 + liftOffset, ss - 2, ss - 2, 8);
                                ctx.fill();

                                // 2. Draw 3D side faces
                                // Right side face
                                ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                                ctx.beginPath();
                                ctx.moveTo(animX + ss, animY);
                                ctx.lineTo(animX + ss + depth, animY + depth);
                                ctx.lineTo(animX + ss + depth, animY + ss + depth);
                                ctx.lineTo(animX + ss, animY + ss);
                                ctx.closePath();
                                ctx.fill();

                                // Bottom side face
                                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                                ctx.beginPath();
                                ctx.moveTo(animX, animY + ss);
                                ctx.lineTo(animX + depth, animY + ss + depth);
                                ctx.lineTo(animX + ss + depth, animY + ss + depth);
                                ctx.lineTo(animX + ss, animY + ss);
                                ctx.closePath();
                                ctx.fill();

                                // 3. Main face gradient
                                const colors = [
                                    ['#ff6b6b', '#ee5a24'], ['#4ecdc4', '#00d2d3'], ['#45b7d1', '#3742fa'],
                                    ['#f9ca24', '#f0932b'], ['#6c5ce7', '#a29bfe'], ['#00b894', '#00cec9'],
                                    ['#fd79a8', '#e84393'], ['#fdcb6e', '#e17055'], ['#74b9ff', '#0984e3']
                                ];

                                const colorPair = colors[(value - 1) % colors.length];
                                const mainGradient = ctx.createLinearGradient(animX, animY, animX, animY + ss);
                                mainGradient.addColorStop(0, colorPair[0]);
                                mainGradient.addColorStop(1, colorPair[1]);

                                ctx.fillStyle = mainGradient;
                                ctx.beginPath();
                                ctx.roundRect(animX, animY, ss, ss, 8);
                                ctx.fill();

                                // 4. Top highlight
                                const highlightGradient = ctx.createLinearGradient(animX, animY, animX, animY + ss / 3);
                                highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
                                highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

                                ctx.fillStyle = highlightGradient;
                                ctx.beginPath();
                                ctx.roundRect(animX + 2, animY + 2, ss - 4, ss / 2, 6);
                                ctx.fill();

                                // 5. Inner shadow
                                const shadowGradient = ctx.createLinearGradient(animX, animY + ss * 0.7, animX, animY + ss);
                                shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
                                shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');

                                ctx.fillStyle = shadowGradient;
                                ctx.beginPath();
                                ctx.roundRect(animX + 2, animY + ss * 0.7, ss - 4, ss * 0.3 - 2, 6);
                                ctx.fill();

                                // 6. Border
                                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                                ctx.lineWidth = 1;
                                ctx.beginPath();
                                ctx.roundRect(animX + 0.5, animY + 0.5, ss - 1, ss - 1, 8);
                                ctx.stroke();

                                // 7. 3D text effect
                                ctx.font = `bold ${fontSize}px Poppins`;
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';

                                // Text depth layers
                                for (let i = depth; i > 0; i--) {
                                    ctx.fillStyle = `rgba(0, 0, 0, ${0.1 * (depth - i + 1)})`;
                                    ctx.fillText(value, animX + ss / 2 + i / 2, animY + ss / 2 + i / 2);
                                }

                                // Main text
                                const textGradient = ctx.createLinearGradient(animX, animY, animX, animY + ss);
                                textGradient.addColorStop(0, '#ffffff');
                                textGradient.addColorStop(1, '#f0f0f0');

                                ctx.fillStyle = textGradient;
                                ctx.fillText(value, animX + ss / 2, animY + ss / 2);

                                // Text highlight
                                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                                ctx.fillText(value, animX + ss / 2, animY + ss / 2 - 1);

                                ctx.restore();

                                requestAnimationFrame(animate);
                            } else {
                                // Animation complete, make the actual move
                                board.swap(left, top, blank.left, blank.top);
                                view.render();
                                updateMoves();

                                // Check for win
                                if (board.isTerminal()) {
                                    clearInterval(timerInterval);
                                    createConfetti();

                                    setTimeout(() => {
                                        const time = document.getElementById('time').textContent;
                                        showWinModal(time, moves);
                                    }, 500);
                                }
                            }
                        };

                        animate();
                    }
                }
            }),
            view: new GameHTML5View({
                calculateSquareSize: function () {
                    var height = this.canvas.height - 1, width = this.canvas.width - 1;
                    this.squareSize = Math.min(Math.floor(width / this.game.board.width), Math.floor(height / this.game.board.height));
                },
                init: function (game, canvasId, events) {
                    this.canvas = document.getElementById(canvasId);
                    this.ctx = this.canvas.getContext('2d');
                    this.game = game;
                    this.attachHTML5Events(events);
                },
                render: function () {
                    var board = this.game.board;
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    for (var top = 0; top < board.height; top++) {
                        for (var left = 0; left < board.width; left++) {
                            this.renderSquare(left, top);
                        }
                    }
                },
                renderSquare: function (left, top) {
                    var board = this.game.board,
                        ctx = this.ctx,
                        ss = this.squareSize,
                        fontSize = Math.floor(ss / 2.5),
                        value = board.get(left, top);

                    if (value === 0) {
                        ctx.clearRect(left * (ss + 1), top * (ss + 1), ss, ss);
                    } else {
                        const x = left * (ss + 1);
                        const y = top * (ss + 1);



                        // Create gradient for the top face
                        const gradient = ctx.createLinearGradient(x, y, x + ss, y + ss);
                        // gradient.addColorStop(0, '#667eea');
                        gradient.addColorStop(0.5, '#764ba2');
                        //gradient.addColorStop(1, '#f093fb');

                        // Main tile face
                        ctx.fillStyle = gradient;
                        ctx.beginPath();
                        ctx.roundRect(x, y, ss, ss, 8);
                        ctx.fill();

                        // Simulate right side shadow
                        ctx.fillStyle = '#5b4a91'; // darker purple
                        ctx.beginPath();
                        ctx.moveTo(x + ss, y);
                        ctx.lineTo(x + ss + 6, y - 6);
                        ctx.lineTo(x + ss + 6, y + ss - 6);
                        ctx.lineTo(x + ss, y + ss);
                        ctx.closePath();
                        ctx.fill();

                        // Simulate bottom shadow
                        ctx.fillStyle = '#503c7e'; // deeper shadow
                        ctx.beginPath();
                        ctx.moveTo(x, y + ss);
                        ctx.lineTo(x + ss, y + ss);
                        ctx.lineTo(x + ss + 6, y + ss - 6);
                        ctx.lineTo(x + 6, y + ss - 6);
                        ctx.closePath();
                        ctx.fill();

                        // Optional: add highlight to top-left edge
                        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(x + 2, y + ss - 6);
                        ctx.lineTo(x + 2, y + 2);
                        ctx.lineTo(x + ss - 6, y + 2);
                        ctx.stroke();


                        // Inner glow effect
                        const innerGradient = ctx.createRadialGradient(
                            x + ss / 2, y + ss / 2, 0,
                            x + ss / 2, y + ss / 2, ss / 2
                        );
                        innerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
                        innerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

                        ctx.fillStyle = innerGradient;
                        ctx.beginPath();
                        ctx.roundRect(x + 2, y + 2, ss - 4, ss - 4, 6);
                        ctx.fill();

                        // Text shadow
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                        ctx.font = `bold ${fontSize}px Poppins`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(value, x + ss / 2 + 1, y + ss / 2 + 1);

                        // Main text
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText(value, x + ss / 2, y + ss / 2);
                    }
                }
            }),
            init: function (id, externalEvents) {
                this.view.init(this, id, externalEvents);
                this.input.init(this);
            },
            newRandomGame: function (width, height) {
                this.board.reset(width, height);
                this.board.randomize();
                this.view.calculateSquareSize();
                this.view.render();
                resetGameStats();

                // Add fade-in animation for new game
                const canvas = this.view.canvas;
                canvas.style.opacity = '0';
                canvas.style.transform = 'scale(0.9)';

                setTimeout(() => {
                    canvas.style.opacity = '1';
                    canvas.style.transform = 'scale(1)';
                }, 100);
            }
        });

        slider.init('slider', {
            click: {
                slider: function (event) {
                    var coordinates = slider.view.getCoordinates(event);
                    var left = Math.floor(coordinates.left / (slider.view.squareSize + 1));
                    var top = Math.floor(coordinates.top / (slider.view.squareSize + 1));
                    if (slider.board.inbounds(left, top)) {
                        slider.input.onSquareClick(left, top);
                    }
                },
                slider3x3: function () {
                    slider.newRandomGame(3, 3);
                    addButtonClickEffect(this);
                },
                slider4x4: function () {
                    slider.newRandomGame(4, 4);
                    addButtonClickEffect(this);
                },
                slider5x5: function () {
                    slider.newRandomGame(5, 5);
                    addButtonClickEffect(this);
                },
                sliderCustomNew: function () {
                    var height = parseInt(document.getElementById('sliderCustomHeight').value);
                    var width = parseInt(document.getElementById('sliderCustomWidth').value);
                    slider.newRandomGame(width, height);
                    addButtonClickEffect(this);
                }
            }
        });

        slider.newRandomGame(3, 3);
    }

    // Button click effect
    function addButtonClickEffect(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    // Initialize everything
    document.addEventListener('DOMContentLoaded', function () {
        createParticles();
        setTimeout(main, 1600);
    });
