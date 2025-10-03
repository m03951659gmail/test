// DOM Elements
const startScreen = document.getElementById('start-screen');
const startText = document.getElementById('start-text');
const quizContainer = document.getElementById('quiz');
const questionElement = document.getElementById('question');
const optionsContainer = document.getElementById('options-container');
const progressBar = document.getElementById('progress-bar');
const questionCountElement = document.getElementById('question-count');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const resultContainer = document.getElementById('result-container');
const percentageElement = document.getElementById('percentage');
const scoreTextElement = document.getElementById('score-text');
const iqDescriptionElement = document.getElementById('iq-description');
const restartBtn = document.getElementById('restart-btn');

// Quiz Questions (100 questions total)
const questions = [
    // Section 1: Very Easy (1-20)
    {
        question: "What comes next in the sequence: 1, 2, 3, 4, __?",
        options: ["4", "5", "6", "7"],
        answer: "5"
    },
    {
        question: "Which of these is a color: Apple, Banana, Red, Table?",
        options: ["Apple", "Banana", "Red", "Table"],
        answer: "Red"
    },
    {
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        answer: "4"
    },
    {
        question: "Which animal says 'meow'?",
        options: ["Dog", "Cow", "Cat", "Bird"],
        answer: "Cat"
    },
    {
        question: "How many legs does a normal chair have?",
        options: ["2", "3", "4", "5"],
        answer: "4"
    },
    {
        question: "What is the opposite of 'up'?",
        options: ["Left", "Right", "Down", "Side"],
        answer: "Down"
    },
    {
        question: "Which month comes after June?",
        options: ["May", "July", "August", "September"],
        answer: "July"
    },
    {
        question: "What do you use to write on paper?",
        options: ["Spoon", "Pen", "Hammer", "Flower"],
        answer: "Pen"
    },
    {
        question: "Which shape has 3 sides?",
        options: ["Circle", "Square", "Triangle", "Rectangle"],
        answer: "Triangle"
    },
    {
        question: "What is the color of a banana?",
        options: ["Red", "Blue", "Yellow", "Green"],
        answer: "Yellow"
    },
    {
        question: "How many hours are in a day?",
        options: ["12", "24", "36", "48"],
        answer: "24"
    },
    {
        question: "Which is the largest: 1, 5, 3, 7?",
        options: ["1", "5", "3", "7"],
        answer: "7"
    },
    {
        question: "What is 10 - 5?",
        options: ["2", "5", "10", "15"],
        answer: "5"
    },
    {
        question: "Which is not a fruit: Apple, Banana, Car, Orange?",
        options: ["Apple", "Banana", "Car", "Orange"],
        answer: "Car"
    },
    {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        answer: "Paris"
    },
    {
        question: "Which comes first in the alphabet: B or C?",
        options: ["B", "C", "Same", "None"],
        answer: "B"
    },
    {
        question: "What is the next letter: A, B, C, __?",
        options: ["C", "D", "E", "F"],
        answer: "D"
    },
    {
        question: "Which is heavier: 1kg of feathers or 1kg of stones?",
        options: ["Feathers", "Stones", "Same", "None"],
        answer: "Same"
    },
    {
        question: "How many zeros are in one hundred?",
        options: ["0", "1", "2", "3"],
        answer: "2"
    },
    {
        question: "What is the plural of 'dog'?",
        options: ["Dog", "Dogs", "Doges", "Dogies"],
        answer: "Dogs"
    },

    // Section 2: Easy (21-40)
    {
        question: "What is 12 × 5?",
        options: ["50", "55", "60", "65"],
        answer: "60"
    },
    {
        question: "Which planet is closest to the sun?",
        options: ["Earth", "Mars", "Mercury", "Venus"],
        answer: "Mercury"
    },
    {
        question: "What is the next number: 2, 4, 8, 16, __?",
        options: ["20", "24", "32", "64"],
        answer: "32"
    },
    {
        question: "How many sides does a hexagon have?",
        options: ["4", "5", "6", "7"],
        answer: "6"
    },
    {
        question: "What is the square root of 64?",
        options: ["4", "6", "8", "10"],
        answer: "8"
    },
    {
        question: "Which is not a prime number: 2, 3, 4, 5?",
        options: ["2", "3", "4", "5"],
        answer: "4"
    },
    {
        question: "What is the chemical symbol for gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        answer: "Au"
    },
    {
        question: "How many continents are there?",
        options: ["5", "6", "7", "8"],
        answer: "7"
    },
    {
        question: "What is the next letter: A, D, G, J, __?",
        options: ["K", "L", "M", "N"],
        answer: "M"
    },
    {
        question: "What is 25% of 200?",
        options: ["25", "50", "75", "100"],
        answer: "50"
    },
    {
        question: "Which is the largest ocean?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        answer: "Pacific"
    },
    {
        question: "What is the next number: 1, 4, 9, 16, __?",
        options: ["20", "25", "30", "36"],
        answer: "25"
    },
    {
        question: "What is the capital of Japan?",
        options: ["Beijing", "Seoul", "Tokyo", "Bangkok"],
        answer: "Tokyo"
    },
    {
        question: "How many degrees are in a right angle?",
        options: ["45", "90", "180", "360"],
        answer: "90"
    },
    {
        question: "What is the next shape: ▲, ■, ●, ▲, ■, __?",
        options: ["▲", "■", "●", "◆"],
        answer: "●"
    },
    {
        question: "What is the freezing point of water in Celsius?",
        options: ["-10", "0", "10", "100"],
        answer: "0"
    },
    {
        question: "Which is not a vowel: A, E, I, T?",
        options: ["A", "E", "I", "T"],
        answer: "T"
    },
    {
        question: "What is the next number: 1, 1, 2, 3, 5, 8, __?",
        options: ["10", "11", "12", "13"],
        answer: "13"
    },
    {
        question: "How many bones are in the adult human body?",
        options: ["156", "206", "256", "306"],
        answer: "206"
    },
    {
        question: "What is the next letter: Z, X, V, T, __?",
        options: ["Q", "R", "S", "U"],
        answer: "R"
    },

    // Section 3: Medium (41-70)
    {
        question: "If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies?",
        options: ["Yes", "No", "Maybe", "Not enough information"],
        answer: "Yes"
    },
    {
        question: "What is the next number: 1, 3, 7, 15, 31, __?",
        options: ["45", "53", "63", "72"],
        answer: "63"
    },
    {
        question: "Which word is the odd one out: Happy, Sad, Angry, Chair?",
        options: ["Happy", "Sad", "Angry", "Chair"],
        answer: "Chair"
    },
    {
        question: "What is the next number: 1, 2, 6, 24, 120, __?",
        options: ["240", "480", "600", "720"],
        answer: "720"
    },
    {
        question: "If a train travels 60 km/h, how far will it travel in 3 hours?",
        options: ["120 km", "150 km", "180 km", "200 km"],
        answer: "180 km"
    },
    {
        question: "What is the next letter: A, C, F, J, __?",
        options: ["M", "N", "O", "P"],
        answer: "O"
    },
    {
        question: "What is the area of a rectangle with length 8 and width 5?",
        options: ["13", "20", "30", "40"],
        answer: "40"
    },
    {
        question: "What is the next number: 100, 95, 85, 70, __?",
        options: ["45", "50", "55", "60"],
        answer: "50"
    },
    {
        question: "What is the next shape: ⬟, ⬢, ⬡, ⬟, ⬢, __?",
        options: ["⬟", "⬢", "⬡", "⬠"],
        answer: "⬡"
    },
    {
        question: "What is the next number: 2, 5, 11, 23, __?",
        options: ["35", "41", "47", "53"],
        answer: "47"
    },
    {
        question: "What is the next letter: Q, W, E, R, T, __?",
        options: ["Y", "U", "I", "O"],
        answer: "Y"
    },
    {
        question: "What is the next number: 1, 4, 27, 256, __?",
        options: ["625", "1024", "3125", "4096"],
        answer: "3125"
    },
    {
        question: "What is the next shape: ◑, ◒, ◐, ◓, __?",
        options: ["◑", "◒", "◐", "◓"],
        answer: "◑"
    },
    {
        question: "What is the next number: 3, 6, 18, 72, __?",
        options: ["144", "216", "288", "360"],
        answer: "360"
    },
    {
        question: "What is the next letter: B, C, E, H, L, __?",
        options: ["O", "P", "Q", "R"],
        answer: "Q"
    },
    {
        question: "What is the next number: 1, 2, 4, 8, 16, __?",
        options: ["20", "24", "32", "64"],
        answer: "32"
    },
    {
        question: "What is the next shape: ◯, △, □, ⬟, ◯, △, __?",
        options: ["□", "⬟", "◯", "△"],
        answer: "□"
    },
    {
        question: "What is the next number: 1, 1, 2, 3, 5, 8, 13, __?",
        options: ["18", "20", "21", "24"],
        answer: "21"
    },
    {
        question: "What is the next letter: A, D, G, J, __?",
        options: ["K", "L", "M", "N"],
        answer: "M"
    },
    {
        question: "What is the next number: 1, 4, 9, 16, 25, __?",
        options: ["30", "36", "42", "49"],
        answer: "36"
    },

    // Section 4: Hard (71-90)
    {
        question: "If 3 workers can build 9 widgets in 6 hours, how many widgets can 5 workers build in 10 hours?",
        options: ["15", "20", "25", "30"],
        answer: "25"
    },
    {
        question: "What is the next number in the sequence: 1, 2, 5, 12, 27, 58, __?",
        options: ["112", "121", "123", "125"],
        answer: "121"
    },
    {
        question: "If all Zips are Zaps and some Zaps are Zops, then which statement must be true?",
        options: ["All Zips are Zops", "Some Zips are Zops", "No Zips are Zops", "None must be true"],
        answer: "None must be true"
    },
    {
        question: "What is the next number: 2, 3, 10, 15, 26, 35, __?",
        options: ["45", "50", "55", "60"],
        answer: "50"
    },
    {
        question: "If RED is coded as 1854, how is GREEN coded?",
        options: ["518554", "518555", "618554", "718554"],
        answer: "518554"
    },
    {
        question: "What is the next number: 1, 11, 21, 1211, 111221, __?",
        options: ["312211", "321122", "121122", "212211"],
        answer: "312211"
    },
    {
        question: "Which number is the odd one out: 6, 28, 496, 8128, 33550336?",
        options: ["6", "28", "496", "8128", "33550336"],
        answer: "33550336"
    },
    {
        question: "If 5 cats can catch 5 mice in 5 minutes, how many cats are needed to catch 100 mice in 100 minutes?",
        options: ["5", "10", "20", "100"],
        answer: "5"
    },
    {
        question: "What is the missing number in this grid:\n8 | 3 | 4\n1 | 5 | 9\n6 | 7 | ?",
        options: ["0", "2", "10", "12"],
        answer: "2"
    },
    {
        question: "If A is 1, B is 2, etc., what is the sum of the letters in the word 'KNOWLEDGE'?",
        options: ["76", "86", "96", "106"],
        answer: "96"
    },
    {
        question: "Which comes next: ♠, ♣, ♦, ♥, __?",
        options: ["♠", "♣", "♦", "♥"],
        answer: "♠"
    },
    {
        question: "If 3x + 7 = 22, what is x?",
        options: ["3", "5", "7", "9"],
        answer: "5"
    },
    {
        question: "What is the next number: 0, 1, 1, 2, 4, 7, 13, 24, __?",
        options: ["36", "40", "44", "48"],
        answer: "44"
    },
    {
        question: "If all Wips are Wops and no Wops are Waps, then:",
        options: ["No Wips are Waps", "Some Wips are Waps", "All Waps are Wips", "None of the above"],
        answer: "No Wips are Waps"
    },
    {
        question: "What is the next number: 1, 3, 12, 60, 360, __?",
        options: ["720", "1440", "2520", "5040"],
        answer: "2520"
    },
    {
        question: "If 1/2 of 5 is 3, then what is 1/3 of 10?",
        options: ["3", "4", "5", "6"],
        answer: "4"
    },
    {
        question: "What is the next number: 2, 4, 8, 16, 32, 64, __?",
        options: ["96", "128", "144", "256"],
        answer: "128"
    },
    {
        question: "Which is the odd one out: 132, 275, 396, 427, 528, 639",
        options: ["132", "275", "427", "639"],
        answer: "427"
    },
    {
        question: "If 3 painters can paint 3 rooms in 3 hours, how many painters are needed to paint 9 rooms in 9 hours?",
        options: ["3", "6", "9", "12"],
        answer: "3"
    },
    {
        question: "What is the next number: 1, 4, 5, 9, 14, 23, __?",
        options: ["27", "31", "37", "42"],
        answer: "37"
    },

    // Section 5: Very Hard (91-100)
    {
        question: "If the code for JUMP is 5478 and the code for RUN is 239, what is the code for JOG?",
        options: ["548", "549", "578", "579"],
        answer: "549"
    },
    {
        question: "What is the next number: 1, 2, 6, 30, 210, __?",
        options: ["420", "1050", "1470", "2310"],
        answer: "2310"
    },
    {
        question: "Which number comes next: 1, 9, 25, 49, 81, __?",
        options: ["100", "108", "121", "144"],
        answer: "121"
    },
    {
        question: "If 7 workers can build 7 houses in 7 days, how many days would it take 14 workers to build 14 houses?",
        options: ["3.5", "7", "14", "28"],
        answer: "7"
    },
    {
        question: "What is the next number: 1, 3, 6, 10, 15, 21, 28, __?",
        options: ["32", "34", "36", "38"],
        answer: "36"
    },
    {
        question: "If 5 machines can make 5 widgets in 5 minutes, how long would it take 100 machines to make 100 widgets?",
        options: ["1 minute", "5 minutes", "100 minutes", "500 minutes"],
        answer: "5 minutes"
    },
    {
        question: "What is the next number: 0, 1, 8, 27, 64, __?",
        options: ["81", "100", "125", "216"],
        answer: "125"
    },
    {
        question: "If 2 painters can paint 2 rooms in 2 hours, how many painters are needed to paint 18 rooms in 6 hours?",
        options: ["3", "6", "9", "12"],
        answer: "6"
    },
    {
        question: "What is the next number: 1, 4, 9, 61, 52, __?",
        options: ["63", "94", "121", "144"],
        answer: "63"
    },
    {
        question: "If 3 hens lay 3 eggs in 3 days, how many eggs will 300 hens lay in 300 days?",
        options: ["100", "300", "900", "30000"],
        answer: "30000"
    },
    {
        question: "If A = 1, B = 2, ..., Z = 26, what is the product of the letters in 'QUIZ'?",
        options: ["8820", "9240", "10080", "10560"],
        answer: "8820"
    },
    {
        question: "What is the next number in the sequence: 1, 4, 27, 256, 3125, __?",
        options: ["46656", "15625", "7776", "32768"],
        answer: "46656"
    },
    {
        question: "If 3↑3 = 27 and 4↑4 = 256, what is 2↑↑3? (Knuth's up-arrow notation)",
        options: ["4", "8", "16", "64"],
        answer: "16"
    },
    {
        question: "Which is the odd one out: 144, 169, 196, 225, 256, 289, 324, 350?",
        options: ["169", "225", "289", "350"],
        answer: "350"
    },
    {
        question: "If 1 = 5, 2 = 25, 3 = 325, 4 = 4325, then 5 = ?",
        options: ["54325", "54321", "54325", "54325"],
        answer: "54325"
    },
    {
        question: "What is the next number: 1, 2, 6, 42, 1806, __?",
        options: ["1806", "3263442", "81234", "123456"],
        answer: "3263442"
    },
    {
        question: "If PENCIL = 6 and ERASER = 6, what is MATHEMATICS?",
        options: ["8", "9", "10", "11"],
        answer: "11"
    },
    {
        question: "What is the next symbol: ⚀, ⚁, ⚂, ⚃, ⚄, ⚅, __?",
        options: ["⚀", "⚁", "⚂", "⚇"],
        answer: "⚀"
    },
    {
        question: "If 5 + 3 = 28, 9 + 1 = 810, 8 + 6 = 214, then 7 + 3 = ?",
        options: ["421", "310", "47", "1021"],
        answer: "310"
    },
    {
        question: "What is the next number: 2, 12, 1112, 3112, 132112, __?",
        options: ["1113122112", "123112", "231122", "312213"],
        answer: "1113122112"
    }
];

// Validate question count on startup
console.log("Total questions:", questions.length);
if (questions.length !== 100) {
    console.error("ERROR: Question count is not 100! Found:", questions.length);
}

// Quiz state
let currentQuestionIndex = 0;
let score = 0;
let selectedOption = null;
let userAnswers = Array(100).fill(null);

// Initialize quiz
function initQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    selectedOption = null;
    userAnswers.fill(null);
    
    showQuestion();
    updateProgressBar();
    updateQuestionCount();
    prevBtn.disabled = true;
    nextBtn.textContent = 'Next';
    nextBtn.disabled = true;
    resultContainer.classList.remove('show');
    document.getElementById('question-container').style.display = 'block';
    document.querySelector('.controls').style.display = 'flex'; // Add this line
    
    // Remove any existing confetti
    document.querySelectorAll('.confetti').forEach(el => el.remove());
}

// Show current question
function showQuestion() {
    const question = questions[currentQuestionIndex];
    questionElement.textContent = question.question;
    optionsContainer.innerHTML = '';
    
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('option-btn');
        button.textContent = option;
        
        if (userAnswers[currentQuestionIndex] === option) {
            button.classList.add('selected');
            selectedOption = option;
            nextBtn.disabled = false;
        }
        
        button.addEventListener('click', () => selectOption(button, option));
        optionsContainer.appendChild(button);
    });
}

// Select an option
function selectOption(button, option) {
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    button.classList.add('selected');
    selectedOption = option;
    userAnswers[currentQuestionIndex] = option;
    nextBtn.disabled = false;
}

// Next question
function nextQuestion() {
    // Save answer and check if correct
    if (selectedOption === questions[currentQuestionIndex].answer) {
        score++;
    }
    
    currentQuestionIndex++;
    
    if (currentQuestionIndex < questions.length) {
        showQuestion();
        updateProgressBar();
        updateQuestionCount();
        prevBtn.disabled = false;
        nextBtn.textContent = currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next';
        nextBtn.disabled = true;
        selectedOption = null;
    } else {
        showResult();
    }
}

// Previous question
function prevQuestion() {
    currentQuestionIndex--;
    showQuestion();
    updateProgressBar();
    updateQuestionCount();
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.textContent = 'Next';
    nextBtn.disabled = false;
}

// Update progress bar
function updateProgressBar() {
    progressBar.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
}

// Update question count
function updateQuestionCount() {
    questionCountElement.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
}

// Show results
function showResult() {
    const percentage = Math.round((score / questions.length) * 100);
    percentageElement.textContent = `${percentage}%`;
    scoreTextElement.textContent = `You scored ${score} out of ${questions.length}`;
    
    // Add IQ description based on score
    let description = "";
    if (percentage >= 90) {
        description = "Genius level! You're in the top 10% of test-takers.";
    } else if (percentage >= 75) {
        description = "Excellent score! Well above average intelligence.";
    } else if (percentage >= 50) {
        description = "Good score! Solid average performance.";
    } else {
        description = "Keep practicing! You can improve with more experience.";
    }
    iqDescriptionElement.textContent = description;
    
    // Hide question container and controls, show result container
    document.getElementById('question-container').style.display = 'none';
    document.querySelector('.controls').style.display = 'none'; // Add this line
    resultContainer.classList.add('show');
    
    // Create confetti effect
    createConfetti();
}

// Create confetti effect
function createConfetti() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
    const container = document.querySelector('.quiz-container');
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() + 's';
        container.appendChild(confetti);
    }
}

// Event listeners
startText.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    initQuiz();
});

nextBtn.addEventListener('click', nextQuestion);
prevBtn.addEventListener('click', prevQuestion);
restartBtn.addEventListener('click', initQuiz);

// Initialize quiz
initQuiz();
// Social Sharing Functions
function shareOnFacebook() {
    const percentage = Math.round((score / questions.length) * 100);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=I scored ${percentage}% on the IQ Challenge! Can you beat my score?`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
}

function shareOnWhatsApp() {
    const percentage = Math.round((score / questions.length) * 100);
    const shareText = `I scored ${percentage}% on the IQ Challenge! Can you beat my score? ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
}

function shareOnTwitter() {
    const percentage = Math.round((score / questions.length) * 100);
    const shareText = `I scored ${percentage}% on the IQ Challenge! Can you beat my score?`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400');
}
// Add these with your other event listeners
document.getElementById('share-facebook').addEventListener('click', shareOnFacebook);
document.getElementById('share-whatsapp').addEventListener('click', shareOnWhatsApp);
document.getElementById('share-twitter').addEventListener('click', shareOnTwitter);