const gameBoard = document.getElementById('gameBoard');
const movesElement = document.getElementById('moves');
const bestElement = document.getElementById('best');
const resetBtn = document.getElementById('reset');

const emojis = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎸', '🎹'];
let cards = [];
let flippedCards = [];
let moves = 0;
let best = localStorage.getItem('memoryBest') || '-';

bestElement.textContent = best;

function initGame() {
    cards = [...emojis, ...emojis];
    cards = shuffleArray(cards);
    gameBoard.innerHTML = '';
    flippedCards = [];
    moves = 0;
    movesElement.textContent = moves;

    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.emoji = emoji;
        card.dataset.index = index;
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function flipCard(e) {
    const card = e.target;
    
    if (card.classList.contains('flipped') || 
        card.classList.contains('matched') || 
        flippedCards.length === 2) {
        return;
    }

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        moves++;
        movesElement.textContent = moves;
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    const match = card1.dataset.emoji === card2.dataset.emoji;

    if (match) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        flippedCards = [];
        checkWin();
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
        }, 1000);
    }
}

function checkWin() {
    const matchedCards = document.querySelectorAll('.matched');
    
    if (matchedCards.length === cards.length) {
        setTimeout(() => {
            alert(`Congratulations! You won in ${moves} moves!`);
            
            if (best === '-' || moves < parseInt(best)) {
                best = moves;
                bestElement.textContent = best;
                localStorage.setItem('memoryBest', best);
            }
        }, 500);
    }
}

resetBtn.addEventListener('click', initGame);

initGame();
