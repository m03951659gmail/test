// Enhanced asset preloader with guaranteed progress
document.addEventListener('DOMContentLoaded', function() {
    const assets = {
        images: [
            'assets/logo.png',
            'assets/countries.png',
            'assets/food.png',
            'assets/fruits.png',
            'assets/hobbies.png',
            'assets/music.png',
            'assets/professions.png',
            'assets/school.png',
            'assets/sports.png',
            'assets/superheroes.png',
            'assets/tiger.png'
        ],
        sounds: [
            'audio/music.wav',
            'audio/click.wav',
            'audio/cheer.ogg',
            'audio/lose.ogg',
            'audio/no.wav',
            'audio/win.ogg',
            'audio/wrong.mp3',
            'audio/yes.wav'
        ]
    };

    // DOM elements
    const progressFill = document.querySelector('.progress-fill');
    const percentage = document.querySelector('.percentage');
    const progressText = document.querySelector('.progress-text');
    const tipsElement = document.querySelector('.loading-tips p');
    const preloader = document.getElementById('preloader');
    const gameContainer = document.getElementById('game-container');

    // Loading state
    let loadedCount = 0;
    const totalAssets = assets.images.length + assets.sounds.length;
    let loadingComplete = false;

    // Start with 1% progress to ensure visibility
    updateProgress(1);

    // Start loading all assets
    loadAssets();

    function loadAssets() {
        // Load images
        assets.images.forEach(src => {
            const img = new Image();
            img.onload = assetLoaded;
            img.onerror = assetLoaded;
            img.src = src;
        });

        // Load sounds
        assets.sounds.forEach(src => {
            const audio = new Audio();
            audio.addEventListener('canplaythrough', assetLoaded);
            audio.addEventListener('error', assetLoaded);
            audio.src = src;
            audio.load(); // Force load
        });
    }

    function assetLoaded() {
        if (loadingComplete) return;
        
        loadedCount++;
        const percent = Math.min(100, Math.round((loadedCount / totalAssets) * 100));
        updateProgress(percent);

        // Complete when all assets are loaded or after timeout
        if (loadedCount >= totalAssets) {
            completeLoading();
        }
    }

    function updateProgress(percent) {
        if (!progressFill || !percentage || !progressText) return;
        
        progressFill.style.width = `${percent}%`;
        percentage.textContent = `${percent}%`;
        progressText.textContent = getLoadingMessage(percent);
    }

    function completeLoading() {
        if (loadingComplete) return;
        loadingComplete = true;

        // Ensure we show 100% before hiding
        updateProgress(100);

        setTimeout(() => {
            if (preloader) {
                preloader.classList.add('fade-out');
                setTimeout(() => {
                    preloader.style.display = 'none';
                    if (gameContainer) gameContainer.style.display = 'block';
                    initGame();
                }, 500);
            }
        }, 500);
    }

    // Fallback timeout in case some assets fail to load
    setTimeout(() => {
        if (!loadingComplete && loadedCount < totalAssets) {
            console.warn('Loading timeout reached, proceeding with loaded assets');
            completeLoading();
        }
    }, 10000); // 10 second timeout

    function getLoadingMessage(percent) {
        const messages = [
            { range: [0, 20], text: "Initializing game..." },
            { range: [21, 40], text: "Loading word database..." },
            { range: [41, 60], text: "Preparing sounds..." },
            { range: [61, 80], text: "Almost there..." },
            { range: [81, 99], text: "Finalizing..." },
            { range: [100, 100], text: "Ready!" }
        ];
        
        const message = messages.find(m => percent >= m.range[0] && percent <= m.range[1]);
        return message ? message.text : "Loading...";
    }

    function initGame() {
        // Initialize sound manager
        const soundManager = {
            playSound: function(soundName) {
                // Simple sound implementation for now
                try {
                    new Audio(`audio/${soundName}.wav`).play().catch(e => {});
                } catch (e) {}
            }
        };

        // Set up start button
        const startButton = document.getElementById('start-button');
        if (startButton) {
            startButton.addEventListener('click', function() {
                soundManager.playSound('click');
                this.classList.add('animate__animated', 'animate__pulse');
                setTimeout(() => {
                    window.location.href = 'categories.html';
                }, 500);
            });
        }

        // Create floating letters background
        const container = document.getElementById('floatingLetters');
        if (container) {
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            for (let i = 0; i < 30; i++) {
                const letter = document.createElement('div');
                letter.className = 'letter';
                letter.textContent = letters.charAt(Math.floor(Math.random() * letters.length));
                letter.style.left = `${Math.random() * 100}%`;
                letter.style.fontSize = `${Math.random() * 1 + 0.5}rem`;
                letter.style.animationDuration = `${10 + Math.random() * 10}s`;
                letter.style.animationDelay = `${Math.random() * 5}s`;
                container.appendChild(letter);
            }
        }
    }
});
// [Keep all the existing game configuration and logic here]
// Game configuration with all categories and words
const config = {
    initialGuesses: 6,
    timeLimit: 60,
    levelUpThreshold: 3,
    scoreCorrectGuess: 10,
    scoreBonusTime: 5,
    scoreLevelComplete: 50,
    wordsByLevel: {
        1: {
            fruits: ['apple', 'banana', 'orange', 'grape', 'mango', 'pear', 'peach', 'kiwi', 'melon', 'berry',
                    'lemon', 'lime', 'cherry', 'plum', 'fig', 'date', 'papaya', 'guava', 'lychee', 'dragonfruit',
                    'apricot', 'coconut', 'pineapple', 'pomegranate', 'avocado', 'blackberry', 'raspberry', 'blueberry', 'strawberry', 'watermelon'],
            countries: ['france', 'canada', 'brazil', 'japan', 'egypt', 'india', 'italy', 'spain', 'china', 'mexico',
                       'germany', 'russia', 'australia', 'argentina', 'sweden', 'norway', 'finland', 'denmark', 'greece', 'turkey',
                       'thailand', 'vietnam', 'singapore', 'malaysia', 'indonesia', 'philippines', 'southafrica', 'nigeria', 'kenya', 'morocco'],
            animals: ['lion', 'tiger', 'elephant', 'giraffe', 'zebra', 'monkey', 'kangaroo', 'koala', 'panda', 'rhino',
                     'hippo', 'crocodile', 'alligator', 'cheetah', 'leopard', 'wolf', 'fox', 'bear', 'deer', 'rabbit',
                     'squirrel', 'raccoon', 'otter', 'beaver', 'dolphin', 'whale', 'shark', 'octopus', 'penguin', 'ostrich'],
            sports: ['soccer', 'basketball', 'tennis', 'swimming', 'volleyball', 'golf', 'boxing', 'hockey', 'cricket', 'rugby',
                    'badminton', 'tabletennis', 'baseball', 'softball', 'cycling', 'running', 'marathon', 'triathlon', 'wrestling', 'judo',
                    'karate', 'taekwondo', 'gymnastics', 'diving', 'surfing', 'skateboarding', 'snowboarding', 'skiing', 'archery', 'fencing'],
            music: ['guitar', 'piano', 'violin', 'drums', 'flute', 'trumpet', 'saxophone', 'clarinet', 'trombone', 'tuba',
                   'harp', 'cello', 'viola', 'doublebass', 'oboe', 'bassoon', 'frenchhorn', 'xylophone', 'marimba', 'harmonica',
                   'accordion', 'banjo', 'mandolin', 'ukulele', 'sitar', 'bagpipes', 'didgeridoo', 'kalimba', 'theremin', 'keytar'],
            hobbies: ['reading', 'painting', 'cooking', 'gardening', 'photography', 'fishing', 'cycling', 'knitting', 'sewing', 'drawing',
                     'writing', 'singing', 'dancing', 'hiking', 'camping', 'traveling', 'collecting', 'gaming', 'chess', 'puzzles',
                     'pottery', 'sculpting', 'woodworking', 'calligraphy', 'origami', 'birdwatching', 'astronomy', 'baking', 'brewing', 'yoga'],
            superheroes: ['superman', 'batman', 'spiderman', 'wonderwoman', 'ironman', 'hulk', 'thor', 'captainamerica', 'blackpanther', 'doctorstrange',
                         'blackwidow', 'hawkeye', 'flash', 'aquaman', 'greenlantern', 'wolverine', 'deadpool', 'storm', 'cyclops', 'jeangrey',
                         'antman', 'wasp', 'vision', 'scarletwitch', 'falcon', 'wintersoldier', 'starlord', 'gamora', 'groot', 'rocketraccoon'],
            school: ['math', 'science', 'history', 'english', 'geography', 'art', 'music', 'biology', 'chemistry', 'physics',
                    'algebra', 'geometry', 'calculus', 'literature', 'grammar', 'spelling', 'writing', 'reading', 'socialstudies', 'economics',
                    'psychology', 'philosophy', 'sociology', 'computerscience', 'programming', 'engineering', 'architecture', 'medicine', 'law', 'business'],
            professions: ['doctor', 'teacher', 'engineer', 'chef', 'artist', 'pilot', 'lawyer', 'nurse', 'dentist', 'architect',
                         'scientist', 'programmer', 'designer', 'musician', 'actor', 'writer', 'journalist', 'photographer', 'athlete', 'police',
                         'firefighter', 'soldier', 'astronaut', 'veterinarian', 'psychologist', 'accountant', 'manager', 'farmer', 'fisherman', 'mechanic'],
            food: ['pizza', 'burger', 'sushi', 'pasta', 'salad', 'icecream', 'smoothie', 'sandwich', 'steak', 'chicken',
                  'fish', 'rice', 'noodles', 'soup', 'curry', 'taco', 'burrito', 'quesadilla', 'ramen', 'dumplings',
                  'pancakes', 'waffles', 'omelette', 'croissant', 'bagel', 'donut', 'cake', 'pie', 'cookie', 'brownie']
        },
        2: {
            fruits: ['persimmon', 'starfruit', 'passionfruit', 'boysenberry', 'elderberry', 'gooseberry', 'loganberry', 'mulberry', 'quince', 'plantain',
                    'breadfruit', 'jackfruit', 'durian', 'soursop', 'kiwano', 'tamarind', 'ugli', 'ackee', 'feijoa', 'sapodilla',
                    'mangosteen', 'salak', 'rambutan', 'longan', 'carambola', 'cherimoya', 'santol', 'cupuacu', 'jabuticaba', 'pawpaw'],
            countries: ['belgium', 'switzerland', 'austria', 'netherlands', 'portugal', 'poland', 'ireland', 'iceland', 'hungary', 'czechia',
                       'slovakia', 'romania', 'bulgaria', 'serbia', 'croatia', 'slovenia', 'montenegro', 'albania', 'macedonia', 'bosnia',
                       'lithuania', 'latvia', 'estonia', 'belarus', 'ukraine', 'moldova', 'georgia', 'armenia', 'azerbaijan', 'kazakhstan'],
            animals: ['armadillo', 'anteater', 'porcupine', 'hedgehog', 'platypus', 'echidna', 'wombat', 'wallaby', 'lemur', 'meerkat',
                     'aardvark', 'okapi', 'tapir', 'bison', 'buffalo', 'yak', 'llama', 'alpaca', 'camel', 'gazelle',
                     'impala', 'wildebeest', 'bongo', 'eland', 'oryx', 'addax', 'kudu', 'springbok', 'dugong', 'manatee'],
            sports: ['biathlon', 'curling', 'lacrosse', 'rowing', 'sailing', 'canoeing', 'kayaking', 'weightlifting', 'powerlifting', 'bodybuilding',
                    'crossfit', 'parkour', 'freerunning', 'orienteering', 'pentathlon', 'decathlon', 'heptathlon', 'polo', 'racquetball', 'squash',
                    'handball', 'waterpolo', 'netball', 'rounders', 'kabaddi', 'hurling', 'shinty', 'bandy', 'floorball', 'ultimate'],
            music: ['harpsichord', 'clavichord', 'virginal', 'lute', 'theorbo', 'oud', 'bouzouki', 'balalaika', 'koto', 'shamisen',
                   'erhu', 'guqin', 'pipa', 'dulcimer', 'zither', 'hurdygurdy', 'nyckelharpa', 'panpipes', 'recorder', 'ocarina',
                   'didgeridoo', 'vuvuzela', 'kazoo', 'jawharp', 'steeldrum', 'hangdrum', 'glassharmonica', 'cristalbaschet', 'ondesmartenot', 'moog'],
            hobbies: ['genealogy', 'philately', 'numismatics', 'scrapbooking', 'quilting', 'embroidery', 'calligraphy', 'leatherworking', 'metalsmithing', 'jewelrymaking',
                     'pottery', 'sculpting', 'woodcarving', 'pyrography', 'stainedglass', 'mosaics', 'candlemaking', 'soapmaking', 'fermenting', 'pickling',
                     'foraging', 'mushroomhunting', 'beekeeping', 'falconry', 'archery', 'fencing', 'marksmanship', 'geocaching', 'ghosthunting', 'urbanexploration'],
            superheroes: ['batgirl', 'robin', 'nightwing', 'redhood', 'catwoman', 'harleyquinn', 'poisonivy', 'supergirl', 'powergirl', 'zatanna',
                         'constantine', 'swampthing', 'animalman', 'shazam', 'bluebeetle', 'boostergold', 'greenarrow', 'blackcanary', 'martianmanhunter', 'zatara',
                         'raven', 'starfire', 'beastboy', 'cyborg', 'doompatrol', 'titans', 'legion', 'static', 'gear', 'icon'],
            school: ['anthropology', 'archaeology', 'linguistics', 'semiotics', 'epistemology', 'metaphysics', 'ethics', 'aesthetics', 'rhetoric', 'logic',
                    'trigonometry', 'statistics', 'probability', 'topology', 'numbertheory', 'cryptography', 'astrophysics', 'quantummechanics', 'thermodynamics', 'nanotechnology',
                    'biochemistry', 'biophysics', 'genetics', 'microbiology', 'virology', 'neuroscience', 'cognitive', 'artificial', 'robotics', 'cybersecurity'],
            professions: ['biologist', 'chemist', 'physicist', 'geologist', 'meteorologist', 'oceanographer', 'seismologist', 'volcanologist', 'astronomer', 'cosmologist',
                         'archivist', 'curator', 'librarian', 'translator', 'interpreter', 'lexicographer', 'etymologist', 'genealogist', 'criminologist', 'cryptographer',
                         'cartographer', 'surveyor', 'urbanplanner', 'landscape', 'interior', 'industrial', 'fashion', 'graphic', 'web', 'game'],
            food: ['bruschetta', 'antipasto', 'caprese', 'risotto', 'gnocchi', 'ravioli', 'cannoli', 'tiramisu', 'gelato', 'sorbet',
                  'paella', 'gazpacho', 'tapas', 'churros', 'empanada', 'ceviche', 'guacamole', 'enchilada', 'fajita', 'nachos',
                  'hummus', 'falafel', 'shawarma', 'dolma', 'baklava', 'kebab', 'gyro', 'tzatziki', 'moussaka', 'spanakopita']
        },
        3: {
            fruits: ['akebia', 'bilimbi', 'cempedak', 'cupuacu', 'durian', 'elephantapple', 'fingerlime', 'gac', 'hala', 'icecreambean',
                    'jaboticaba', 'kabosu', 'lucuma', 'mameysapote', 'nance', 'oilpalm', 'pejibaye', 'quandong', 'rollinia', 'sapote',
                    'tamarillo', 'ugni', 'voavanga', 'waterapple', 'ximenia', 'yangmei', 'zapote', 'ambarella', 'bacuri', 'camucamu'],
            countries: ['andorra', 'liechtenstein', 'monaco', 'sanmarino', 'vatican', 'malta', 'cyprus', 'luxembourg', 'faroe', 'greenland',
                       'bhutan', 'maldives', 'brunei', 'easttimor', 'palau', 'nauru', 'tuvalu', 'kiribati', 'marshallislands', 'micronesia',
                       'vanuatu', 'samoa', 'tonga', 'fiji', 'solomon', 'seychelles', 'mauritius', 'comoros', 'saotome', 'capeverde'],
            animals: ['axolotl', 'ayeaye', 'babirusa', 'binturong', 'cassowary', 'colugo', 'dhole', 'fossa', 'gavial', 'gerenuk',
                     'hagfish', 'ibex', 'jabiru', 'kakapo', 'loris', 'marmoset', 'numbat', 'ocelot', 'pangolin', 'quokka',
                     'rafflesia', 'saiga', 'tarsier', 'uakari', 'viscacha', 'wolverine', 'xerus', 'yapok', 'zebu', 'axolotl'],
            sports: ['aikido', 'jujitsu', 'kendo', 'sumo', 'kravmaga', 'muaythai', 'sambo', 'savate', 'silat', 'taichi',
                    'wushu', 'capoeira', 'glima', 'kalaripayattu', 'limalama', 'pankration', 'savika', 'ssireum', 'varzesh', 'zurkaneh',
                    'bossaball', 'chessboxing', 'footgolf', 'korfball', 'netball', 'petanque', 'quidditch', 'rollerderby', 'sepaktakraw', 'ultimate'],
            music: ['alphorn', 'bandura', 'cimbalom', 'daxophone', 'euphonium', 'flugelhorn', 'glasschord', 'hydraulophone', 'ippon', 'jewsharp',
                   'kantele', 'lur', 'musicalbow', 'nyckelharpa', 'organetto', 'psaltery', 'quena', 'rebab', 'santur', 'tromboon',
                   'udu', 'vibraphone', 'wagner', 'xylorimba', 'yueqin', 'zampona', 'angklung', 'bansuri', 'cajon', 'dhol'],
            hobbies: ['aquascaping', 'bonsai', 'butterfly', 'candle', 'cosplay', 'diorama', 'escape', 'flower', 'graffiti', 'homebrew',
                     'illusion', 'juggling', 'knotting', 'lockpicking', 'macrame', 'needlepoint', 'origami', 'puppetry', 'quilling', 'rock',
                     'sand', 'taxidermy', 'upcycling', 'vlogging', 'whittling', 'xylography', 'yoyoing', 'zoetrope', 'airbrushing', 'beatboxing'],
            superheroes: ['adamstrange', 'bluebeetle', 'captainmarvel', 'doctorfate', 'etrigan', 'firestorm', 'greenlantern', 'hawkman', 'ion', 'johnconstantin',
                         'katana', 'ladyblackhawk', 'martianmanhunter', 'nightwing', 'orion', 'plasticman', 'question', 'raven', 'spectre', 'tempest',
                         'ultraboy', 'vixen', 'wildcat', 'xombi', 'yellowjacket', 'zatanna', 'amazo', 'brainiac', 'cheetah', 'darksied'],
            school: ['algebra', 'calculus', 'differential', 'euler', 'fourier', 'galois', 'hilbert', 'integral', 'jacobian', 'klein',
                    'laplace', 'manifold', 'noether', 'operator', 'polynomial', 'quantum', 'riemann', 'stokes', 'tensor', 'uniform',
                    'variational', 'weierstrass', 'xenon', 'yangmills', 'zeta', 'abelian', 'banach', 'chern', 'dirac', 'euclid'],
            professions: ['actuary', 'arborist', 'biotechnologist', 'criminologist', 'dermatologist', 'epidemiologist', 'forensic', 'geophysicist', 'hydrologist', 'ichthyologist',
                         'jeweler', 'kinesiologist', 'limnologist', 'metallurgist', 'nanotechnologist', 'oceanographer', 'paleontologist', 'quantum', 'radiologist', 'seismologist',
                         'toxicologist', 'urologist', 'virologist', 'welder', 'xenobiologist', 'yacht', 'zoologist', 'acoustician', 'biochemist', 'cytogeneticist'],
            food: ['affogato', 'biscotti', 'cannelloni', 'dolmades', 'eggnog', 'frittata', 'gnocchi', 'haggis', 'injera', 'jambalaya',
                  'kugel', 'latke', 'moussaka', 'naan', 'ossobuco', 'pho', 'quiche', 'ratatouille', 'souvlaki', 'tortellini',
                  'ugali', 'vindaloo', 'wonton', 'xacuti', 'yakisoba', 'ziti', 'arancini', 'bruschetta', 'carpaccio', 'dacquoise']
        }
    },
    wordHints: {
        fruits: {
            apple: "Common red or green fruit",
            banana: "Yellow curved fruit",
            orange: "Citrus fruit with same name as color",
            grape: "Small round fruits that grow in clusters",
            mango: "Tropical stone fruit with sweet orange flesh",
            pear: "Bell-shaped fruit",
            peach: "Fuzzy fruit with a pit",
            kiwi: "Brown fuzzy skin with green flesh",
            melon: "Large juicy fruit with thick rind",
            berry: "Small pulpy fruit",
            lemon: "Sour yellow citrus fruit",
            lime: "Small green citrus fruit",
            cherry: "Small red fruit with pit",
            plum: "Purple stone fruit",
            fig: "Sweet fruit with many tiny seeds",
            date: "Sweet brown fruit from palm trees",
            papaya: "Tropical fruit with orange flesh",
            guava: "Tropical fruit with pink flesh",
            lychee: "Small fruit with rough red skin",
            dragonfruit: "Vibrant pink fruit with black seeds",
            apricot: "Similar to peach but smaller",
            coconut: "Hard-shelled tropical fruit",
            pineapple: "Spiky tropical fruit",
            pomegranate: "Contains many juicy red arils",
            avocado: "Green fruit with large pit",
            blackberry: "Dark purple aggregate fruit",
            raspberry: "Red aggregate fruit",
            blueberry: "Small blue antioxidant-rich berries",
            strawberry: "Red heart-shaped berry",
            watermelon: "Large green fruit with red juicy flesh"
        },
        countries: {
            france: "Home of the Eiffel Tower",
            canada: "Known for maple syrup",
            brazil: "Hosts the Amazon rainforest",
            japan: "Land of the rising sun",
            egypt: "Home of the ancient pyramids",
            india: "Known for Bollywood and Taj Mahal",
            italy: "Shaped like a boot",
            spain: "Famous for paella and flamenco",
            china: "Most populous country",
            mexico: "Known for tacos and sombreros",
            germany: "Famous for Oktoberfest",
            russia: "Largest country by area",
            australia: "Home to kangaroos and koalas",
            argentina: "Known for tango and beef",
            sweden: "Home of IKEA and ABBA",
            norway: "Land of fjords and Vikings",
            finland: "Country of a thousand lakes",
            denmark: "Home of LEGO and Vikings",
            greece: "Birthplace of democracy",
            turkey: "Connects Europe and Asia",
            thailand: "Known as the Land of Smiles",
            vietnam: "Famous for pho and ao dai",
            singapore: "City-state with Merlion",
            malaysia: "Home of Petronas Towers",
            indonesia: "Largest archipelago",
            philippines: "Known for jeepneys",
            southafrica: "Home of Nelson Mandela",
            nigeria: "Most populous African country",
            kenya: "Famous for safari and marathon",
            morocco: "Known for colorful souks"
        },
        animals: {
            lion: "King of the jungle",
            tiger: "Largest cat species",
            elephant: "Has a long trunk",
            giraffe: "Tallest land animal",
            zebra: "Black and white stripes",
            monkey: "Likes bananas and climbing",
            kangaroo: "Hops and has a pouch",
            koala: "Sleepy eucalyptus eater",
            panda: "Black and white bamboo lover",
            rhino: "Has a horn on its nose",
            hippo: "Large semi-aquatic mammal",
            crocodile: "Dangerous reptile with strong jaws",
            alligator: "Similar to crocodile but shorter snout",
            cheetah: "Fastest land animal",
            leopard: "Spotted big cat that climbs trees",
            wolf: "Lives in packs and howls",
            fox: "Clever orange canine",
            bear: "Large furry mammal that hibernates",
            deer: "Has antlers (males only)",
            rabbit: "Likes carrots and hops",
            squirrel: "Collects nuts for winter",
            raccoon: "Masked nocturnal animal",
            otter: "Playful water mammal",
            beaver: "Builds dams with wood",
            dolphin: "Intelligent sea mammal",
            whale: "Largest animal on Earth",
            shark: "Ocean predator with sharp teeth",
            octopus: "Eight-armed sea creature",
            penguin: "Flightless bird that swims",
            ostrich: "Largest and fastest bird"
        },
        sports: {
            soccer: "Played with a round ball and feet",
            basketball: "Played with orange ball and hoop",
            tennis: "Played with racket and yellow ball",
            swimming: "Moving through water using limbs",
            volleyball: "Played over a high net",
            golf: "Played with clubs and small ball",
            boxing: "Fighting with fists in gloves",
            hockey: "Played on ice with sticks",
            cricket: "Popular in England and India",
            rugby: "Similar to American football",
            badminton: "Played with shuttlecock",
            tabletennis: "Miniature version of tennis",
            baseball: "American pastime with bat and ball",
            softball: "Similar to baseball but larger ball",
            cycling: "Riding bicycles competitively",
            running: "Moving fast on foot",
            marathon: "Long-distance running race",
            triathlon: "Swim, bike, and run event",
            wrestling: "Grappling sport",
            judo: "Japanese martial art",
            karate: "Martial art with strikes",
            taekwondo: "Korean martial art",
            gymnastics: "Artistic body movements",
            diving: "Jumping into water gracefully",
            surfing: "Riding waves on a board",
            skateboarding: "Riding and doing tricks on a board",
            snowboarding: "Like surfing but on snow",
            skiing: "Sliding on snow with skis",
            archery: "Shooting arrows with a bow",
            fencing: "Fight with swords"
        },
        music: {
            guitar: "Six-stringed instrument",
            piano: "Keyboard with black and white keys",
            violin: "Four-stringed bowed instrument",
            drums: "Percussion instrument set",
            flute: "Woodwind instrument held sideways",
            trumpet: "Brass instrument with valves",
            saxophone: "Brass woodwind hybrid",
            clarinet: "Single-reed woodwind",
            trombone: "Brass instrument with slide",
            tuba: "Largest brass instrument",
            harp: "Large stringed instrument plucked",
            cello: "Large violin played sitting down",
            viola: "Between violin and cello in size",
            doublebass: "Largest string instrument",
            oboe: "Double reed woodwind",
            bassoon: "Large double reed instrument",
            frenchhorn: "Brass instrument coiled in circle",
            xylophone: "Percussion with wooden bars",
            marimba: "Large xylophone with resonators",
            harmonica: "Small handheld wind instrument",
            accordion: "Squeezebox with bellows",
            banjo: "String instrument with round body",
            mandolin: "Small lute-like instrument",
            ukulele: "Small four-stringed guitar",
            sitar: "Indian stringed instrument",
            bagpipes: "Scottish wind instrument",
            didgeridoo: "Australian drone pipe",
            kalimba: "African thumb piano",
            theremin: "Played without touching",
            keytar: "Keyboard worn like a guitar"
        },
        hobbies: {
            reading: "Enjoying books and stories",
            painting: "Creating art with colors",
            cooking: "Preparing food creatively",
            gardening: "Growing plants and flowers",
            photography: "Capturing moments with camera",
            fishing: "Catching fish with rod",
            cycling: "Riding bicycles for fun",
            knitting: "Creating fabric with yarn",
            sewing: "Joining fabric with needle",
            drawing: "Creating art with pencils",
            writing: "Expressing thoughts on paper",
            singing: "Musical expression with voice",
            dancing: "Moving rhythmically to music",
            hiking: "Walking in nature trails",
            camping: "Staying outdoors overnight",
            traveling: "Visiting new places",
            collecting: "Gathering items of interest",
            gaming: "Playing video games",
            chess: "Strategic board game",
            puzzles: "Solving problems or jigsaws",
            pottery: "Shaping clay into objects",
            sculpting: "Creating 3D art forms",
            woodworking: "Crafting with wood",
            calligraphy: "Artistic handwriting",
            origami: "Japanese paper folding",
            birdwatching: "Observing wild birds",
            astronomy: "Studying celestial objects",
            baking: "Making breads and pastries",
            brewing: "Making beer or coffee",
            yoga: "Physical and mental exercises"
        },
        superheroes: {
            superman: "Man of Steel from Krypton",
            batman: "Dark Knight of Gotham",
            spiderman: "Web-slinging teen hero",
            wonderwoman: "Amazonian warrior princess",
            ironman: "Genius billionaire in armor",
            hulk: "Big green rage monster",
            thor: "Norse god with hammer",
            captainamerica: "Super-soldier with shield",
            blackpanther: "King of Wakanda",
            doctorstrange: "Sorcerer Supreme",
            blackwidow: "Expert spy and assassin",
            hawkeye: "Master archer",
            flash: "Fastest man alive",
            aquaman: "King of Atlantis",
            greenlantern: "Power ring wielder",
            wolverine: "Adamantium-clawed mutant",
            deadpool: "Merc with a mouth",
            storm: "Weather-controlling mutant",
            cyclops: "Optic blast mutant",
            jeangrey: "Powerful psychic mutant",
            antman: "Size-changing hero",
            wasp: "Flying insect-themed heroine",
            vision: "Synthezoid with Mind Stone",
            scarletwitch: "Reality-warping mutant",
            falcon: "Hero with mechanical wings",
            wintersoldier: "Former brainwashed assassin",
            starlord: "Leader of Guardians",
            gamora: "Deadliest woman in galaxy",
            groot: "Tree-like alien",
            rocketraccoon: "Talking raccoon mercenary"
        },
        school: {
            math: "Numbers and calculations",
            science: "Study of natural world",
            history: "Study of past events",
            english: "Language and literature",
            geography: "Study of Earth's features",
            art: "Creative expression",
            music: "Study of sound and rhythm",
            biology: "Study of living organisms",
            chemistry: "Study of substances",
            physics: "Study of matter and energy",
            algebra: "Mathematics with variables",
            geometry: "Mathematics of shapes",
            calculus: "Mathematics of change",
            literature: "Study of written works",
            grammar: "Rules of language",
            spelling: "Correct letter arrangement",
            writing: "Creating written content",
            reading: "Interpreting written words",
            socialstudies: "Study of human society",
            economics: "Study of goods and services",
            psychology: "Study of mind and behavior",
            philosophy: "Study of fundamental questions",
            sociology: "Study of human society",
            computerscience: "Study of computation",
            programming: "Writing code for computers",
            engineering: "Applying scientific principles",
            architecture: "Designing buildings",
            medicine: "Study of health and healing",
            law: "Study of legal systems",
            business: "Study of commerce"
        },
        professions: {
            doctor: "Treats illnesses and injuries",
            teacher: "Educates students",
            engineer: "Designs and builds things",
            chef: "Prepares food professionally",
            artist: "Creates art",
            pilot: "Flies aircraft",
            lawyer: "Practices law",
            nurse: "Provides medical care",
            dentist: "Treats teeth and gums",
            architect: "Designs buildings",
            scientist: "Conducts research",
            programmer: "Writes software",
            designer: "Creates visual concepts",
            musician: "Plays or composes music",
            actor: "Performs in plays/films",
            writer: "Creates written works",
            journalist: "Reports news",
            photographer: "Takes photographs",
            athlete: "Competes in sports",
            police: "Enforces laws",
            firefighter: "Fights fires",
            soldier: "Serves in military",
            astronaut: "Travels to space",
            veterinarian: "Treats animals",
            psychologist: "Studies human mind",
            accountant: "Manages finances",
            manager: "Oversees operations",
            farmer: "Grows crops/livestock",
            fisherman: "Catches fish",
            mechanic: "Repairs machines"
        },
        food: {
            pizza: "Round with toppings and cheese",
            burger: "Patty between buns",
            sushi: "Japanese rice and fish dish",
            pasta: "Italian noodle dishes",
            salad: "Mixed raw vegetables",
            icecream: "Frozen sweet dairy dessert",
            smoothie: "Blended fruit drink",
            sandwich: "Fillings between bread",
            steak: "Grilled beef slice",
            chicken: "Popular poultry meat",
            fish: "Aquatic animal food",
            rice: "Staple grain food",
            noodles: "Long thin pasta",
            soup: "Liquid food",
            curry: "Spiced sauce dish",
            taco: "Mexican folded tortilla",
            burrito: "Large wrapped tortilla",
            quesadilla: "Grilled cheese tortilla",
            ramen: "Japanese noodle soup",
            dumplings: "Dough-wrapped filling",
            pancakes: "Flat round cakes",
            waffles: "Grid-patterned cakes",
            omelette: "Beaten eggs cooked flat",
            croissant: "Flaky French pastry",
            bagel: "Doughnut-shaped bread",
            donut: "Sweet fried dough ring",
            cake: "Sweet baked dessert",
            pie: "Baked dish with pastry",
            cookie: "Small sweet baked good",
            brownie: "Dense chocolate square"
        }
    }
};

// Game state
let state = {
    selectedWord: '',
    guessedLetters: [],
    remainingGuesses: config.initialGuesses,
    gameOver: false,
    hintUsed: false,
    timeLeft: config.timeLimit,
    timer: null,
    score: 0,
    level: 1,
    wordsCompleted: 0,
    startTime: 0,
    usedWords: [],
    selectedCategory: 'fruits'
};

// DOM elements
const elements = {
    wordDisplay: document.getElementById('word-display'),
    guessedLetters: document.getElementById('guessed-letters'),
    remainingGuesses: document.getElementById('remaining-guesses'),
    letterInput: document.getElementById('letter-input'),
    guessButton: document.getElementById('guess-button'),
    restartButton: document.getElementById('restart-button'),
    message: document.getElementById('message'),
    hintButton: document.getElementById('hint-button'),
    hintText: document.getElementById('hint-text'),
    timer: document.getElementById('timer'),
    score: document.getElementById('score'),
    level: document.getElementById('level'),
    hearts: document.querySelector('.hearts'),
    quitButton: document.getElementById('quit-button'),
    timerItem: document.querySelector('.timer-item')
};

// Sound Manager
// Sound Manager - Fixed Implementation
const soundManager = {
    sounds: {
        background: document.getElementById('background-audio'),
        click: document.getElementById('click-sound'),
        wrong: document.getElementById('wrong-sound'),
        correct: document.getElementById('correct-sound'),
        lose: document.getElementById('lose-sound'),
        win: document.getElementById('win-sound'),
        levelComplete: document.getElementById('level-complete-sound')
    },
    muted: false,
    audioContext: null,
    
    init() {
        // Setup audio unlock on first user interaction
        const unlockAudio = () => {
            // Create Web Audio Context if needed
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('Audio context created');
            } catch (e) {
                console.error('Web Audio API not supported', e);
            }
            
            // Try to play background music
            this.playBackground();
            
            // Remove event listeners after first interaction
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('keydown', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };
        
        // Listen for various user interactions
        document.addEventListener('click', unlockAudio);
        document.addEventListener('keydown', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);
        
        // Set initial volumes
        this.sounds.background.volume = 0.2;
        this.setSoundEffectsVolume(0.7);
        
        // Setup mute button
        const muteButton = document.getElementById('mute-button');
        if (muteButton) {
            muteButton.addEventListener('click', () => this.toggleMute());
        }
    },
    
    setSoundEffectsVolume(volume) {
        Object.keys(this.sounds).forEach(key => {
            if (key !== 'background' && this.sounds[key]) {
                this.sounds[key].volume = volume;
            }
        });
    },
    
    playBackground() {
        if (this.muted || !this.sounds.background) return;
        
        const playAttempt = () => {
            this.sounds.background.play()
                .then(() => {
                    console.log('Background music started');
                    this.sounds.background.loop = true;
                })
                .catch(error => {
                    console.log('Background play failed:', error);
                });
        };
        
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(playAttempt);
        } else {
            playAttempt();
        }
    },
    
    playSound(soundName) {
        if (this.muted || !this.sounds[soundName]) return;
        
        try {
            // Clone the audio element to allow overlapping sounds
            const sound = this.sounds[soundName].cloneNode();
            sound.volume = this.sounds[soundName].volume;
            
            sound.play().catch(e => {
                console.log(`Sound ${soundName} play error:`, e);
                // Try one more time after a small delay
                setTimeout(() => {
                    sound.play().catch(e => console.log(`Retry failed for ${soundName}:`, e));
                }, 300);
            });
            
            // Clean up after sound finishes
            sound.addEventListener('ended', () => {
                sound.remove();
            });
            
        } catch (e) {
            console.error(`Error playing sound ${soundName}:`, e);
        }
    },
    
    toggleMute() {
        this.muted = !this.muted;
        const muteButton = document.getElementById('mute-button');
        
        if (!muteButton) return;
        
        if (this.muted) {
            muteButton.classList.add('muted');
            muteButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
            Object.values(this.sounds).forEach(sound => {
                if (sound) {
                    sound.pause();
                    sound.currentTime = 0;
                }
            });
        } else {
            muteButton.classList.remove('muted');
            muteButton.innerHTML = '<i class="fas fa-volume-up"></i>';
            this.playBackground();
        }
    }
};

// Initialize the game
function initGame() {
    state.selectedCategory = localStorage.getItem('selectedCategory') || 'fruits';
    state.guessedLetters = [];
    state.remainingGuesses = config.initialGuesses;
    state.gameOver = false;
    state.hintUsed = false;
    state.timeLeft = config.timeLimit;
    state.startTime = Date.now();
    
    let levelWords = config.wordsByLevel[state.level][state.selectedCategory];
    if (!levelWords) {
        levelWords = config.wordsByLevel[1][state.selectedCategory];
        if (!levelWords) {
            levelWords = config.wordsByLevel[1]['fruits'];
        }
    }

    const availableWords = levelWords.filter(word => !state.usedWords.includes(word));
    
    if (availableWords.length === 0) {
        state.usedWords = [];
        state.selectedWord = levelWords[Math.floor(Math.random() * levelWords.length)];
    } else {
        state.selectedWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    }
    
    state.usedWords.push(state.selectedWord);
    
    updateWordDisplay();
    updateGuessedLetters();
    elements.remainingGuesses.textContent = state.remainingGuesses;
    elements.message.textContent = '';
    elements.message.style.display = 'none';
    elements.letterInput.value = '';
    elements.letterInput.disabled = false;
    elements.guessButton.disabled = false;
    elements.hintButton.disabled = false;
    elements.hintText.textContent = '';
    updateHearts();
    
    clearInterval(state.timer);
    state.timer = setInterval(updateTimer, 1000);
    
    elements.timerItem.style.backgroundColor = '';
    elements.timerItem.classList.remove('warning');
    elements.letterInput.focus();
}

function updateWordDisplay() {
    const display = state.selectedWord.split('').map(letter => 
        state.guessedLetters.includes(letter) ? letter : '_'
    ).join(' ');
    
    elements.wordDisplay.textContent = display;
    
    if (!display.includes('_')) {
        handleWin();
    }
}

function updateGuessedLetters() {
    elements.guessedLetters.innerHTML = '';
    state.guessedLetters.forEach(letter => {
        const span = document.createElement('span');
        span.textContent = letter.toUpperCase();
        elements.guessedLetters.appendChild(span);
    });
}

function updateHearts() {
    const hearts = elements.hearts.querySelectorAll('span');
    hearts.forEach((heart, index) => {
        heart.style.visibility = index < state.remainingGuesses ? 'visible' : 'hidden';
    });
}

function updateTimer() {
    if (state.gameOver) return;
    
    state.timeLeft--;
    elements.timer.textContent = state.timeLeft;
    
    if (state.timeLeft <= 10) {
        elements.timerItem.classList.add('warning');
    }
    
    if (state.timeLeft <= 0) {
        clearInterval(state.timer);
        handleLoss();
    }
}

function makeGuess() {
    if (state.gameOver) return;
    
    const guess = elements.letterInput.value.toLowerCase();
    elements.letterInput.value = '';
    
    if (!guess || !guess.match(/^[a-z]$/)) {
        showMessage('Please enter a single letter', 'error');
        return;
    }
    
    if (state.guessedLetters.includes(guess)) {
        showMessage(`You already guessed "${guess}"`, 'error');
        return;
    }
    
    state.guessedLetters.push(guess);
    updateGuessedLetters();
    
    if (state.selectedWord.includes(guess)) {
        soundManager.playSound('correct');
        showMessage('Correct!', 'success');
        updateWordDisplay();
    } else {
        soundManager.playSound('wrong');
        state.remainingGuesses--;
        elements.remainingGuesses.textContent = state.remainingGuesses;
        updateHearts();
        showMessage('Incorrect!', 'error');
        
        if (state.remainingGuesses <= 0) {
            handleLoss();
        }
    }
}

function handleWin() {
    state.gameOver = true;
    clearInterval(state.timer);
    
    const timeUsed = Math.floor((Date.now() - state.startTime) / 1000);
    const timeBonus = Math.max(0, config.timeLimit - timeUsed) * config.scoreBonusTime;
    const wordScore = config.scoreCorrectGuess * state.selectedWord.length;
    state.score += wordScore + timeBonus;
    state.wordsCompleted++;
    
    elements.wordDisplay.textContent = state.selectedWord.toUpperCase().split('').join(' ');
    
    if (state.wordsCompleted >= config.levelUpThreshold) {
        const currentLevel = state.level;
        state.level++;
        state.wordsCompleted = 0;
        state.score += config.scoreLevelComplete;
        
        if (state.level > 3) {
            soundManager.playSound('levelComplete');
            showFinalResults();
        } else {
            soundManager.playSound('win');
            showLevelComplete(currentLevel);
        }
    } else {
        soundManager.playSound('win');
        showMiniPopup(true, () => {
            initGame();
        });
    }
    
    updateStats();
    disableInputs();
}

function handleLoss() {
    state.gameOver = true;
    clearInterval(state.timer);
    disableInputs();
    soundManager.playSound('lose');
    
    elements.wordDisplay.textContent = state.selectedWord.toUpperCase().split('').join(' ');
    
    showMiniPopup(false, () => {
        showLoseResults();
    });
}

function disableInputs() {
    elements.letterInput.disabled = true;
    elements.guessButton.disabled = true;
    elements.hintButton.disabled = true;
}

function showMiniPopup(isWin, callback) {
    const miniPopup = document.createElement('div');
    miniPopup.className = 'mini-popup animate__animated animate__fadeIn';
    miniPopup.innerHTML = `
        <div class="mini-popup-content">
            <p class="mini-message">${isWin ? getRandomWinMessage() : getRandomLoseMessage()}</p>
            <p class="mini-score">Score: ${state.score}</p>
        </div>
    `;
    
    document.body.appendChild(miniPopup);
    
    setTimeout(() => {
        miniPopup.classList.add('animate__fadeOut');
        setTimeout(() => {
            miniPopup.remove();
            if (callback) callback();
        }, 1000);
    }, 2000);
}

function getRandomWinMessage() {
    const messages = [
        "Great job!",
        "Well done!",
        "Excellent!",
        "You got it!",
        "Perfect!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

function getRandomLoseMessage() {
    const messages = [
        "Try again!",
        "Next time!",
        "Almost!",
        "Keep trying!",
        "You'll get it!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

function showLevelComplete(completedLevel) {
    const modal = document.getElementById('results-modal');
    const levelCompleteScreen = document.getElementById('level-complete-screen');
    
    // Hide all other screens
    document.getElementById('win-screen').style.display = 'none';
    document.getElementById('lose-screen').style.display = 'none';
    document.getElementById('final-results-screen').style.display = 'none';
    
    // Set the message
    document.getElementById('level-complete-message').textContent = 
        `Great job! You completed Level ${completedLevel}`;
    
    // Show the screen
    modal.style.display = 'flex';
    levelCompleteScreen.style.display = 'block';
    
    // Remove any existing animations first
    levelCompleteScreen.classList.remove('animate__animated', 'animate__zoomIn');
    
    // Force reflow to restart animation
    void levelCompleteScreen.offsetWidth;
    
    // Add fresh animation
    levelCompleteScreen.classList.add('animate__animated', 'animate__zoomIn');
    
    // Auto-hide after 2 seconds
    setTimeout(() => {
        modal.style.display = 'none';
        levelCompleteScreen.style.display = 'none';
        initGame(); // Start next level
    }, 2000);
}

function showFinalResults() {
    const modal = document.getElementById('results-modal');
    const winScreen = document.getElementById('win-screen');
    const loseScreen = document.getElementById('lose-screen');
    const levelCompleteScreen = document.getElementById('level-complete-screen');
    const finalResultsScreen = document.getElementById('final-results-screen');
    
    // Hide all other screens
    winScreen.style.display = 'none';
    loseScreen.style.display = 'none';
    levelCompleteScreen.style.display = 'none';
    
    // Show final results
    document.getElementById('final-score-display').textContent = state.score;
    
    modal.style.display = 'flex';
    finalResultsScreen.style.display = 'block';
    
    // Configure the "Play Again" button to fully reset the game
    document.getElementById('play-final-again-btn').onclick = function() {
        modal.style.display = 'none';
        // Complete reset
        state.score = 0;
        state.level = 1;
        state.wordsCompleted = 0;
        state.usedWords = [];
        initGame();
        updateStats();
    };
    
    // Special celebration for completing all levels
    finalResultsScreen.classList.add('animate__animated', 'animate__tada');
    setTimeout(() => {
        finalResultsScreen.classList.remove('animate__animated', 'animate__tada');
    }, 1000);
}

function showWinResults() {
    const modal = document.getElementById('results-modal');
    const winScreen = document.getElementById('win-screen');
    const loseScreen = document.getElementById('lose-screen');
    const finalScore = document.getElementById('final-score');
    
    const messages = [
        "Amazing performance! 🌟",
        "You're a word-guessing wizard! 🎩",
        "Brilliant! You've got skills! 💪",
        "Fantastic job! Keep it up! 🚀",
        "You're on fire! 🔥"
    ];
    
    finalScore.textContent = state.score;
    document.getElementById('win-message').textContent = messages[Math.floor(Math.random() * messages.length)];
    
    // Explicitly hide lose screen before showing win screen
    loseScreen.style.display = 'none';
    winScreen.style.display = 'block';
    modal.style.display = 'flex';
    
    setupShareButtons();
}

function showLoseResults() {
    const modal = document.getElementById('results-modal');
    const winScreen = document.getElementById('win-screen');
    const loseScreen = document.getElementById('lose-screen');
    const levelCompleteScreen = document.getElementById('level-complete-screen');
    const finalResultsScreen = document.getElementById('final-results-screen');
    
    // Hide all other screens
    winScreen.style.display = 'none';
    levelCompleteScreen.style.display = 'none';
    finalResultsScreen.style.display = 'none';
    
    // Set lose screen content - SHOW CURRENT SCORE FIRST
    const messages = [
        "Don't give up! You'll get it next time! 💪",
        "Every expert was once a beginner! 🌟",
        "Practice makes perfect! Try again! 🔄",
        "You're getting better with each try! 🚀",
        "The word was tricky! Ready for another round? 🎯"
    ];
    
    // Display current score before any reset
    document.getElementById('lose-final-score').textContent = state.score;
    document.getElementById('lose-message').textContent = 
        messages[Math.floor(Math.random() * messages.length)];
    
    // Configure the "Play Again" button
    const playAgainBtn = document.querySelector('#lose-screen .play-again-btn');
    playAgainBtn.textContent = "Play Again";
    playAgainBtn.onclick = function() {
        modal.style.display = 'none';
        // Reset game state AFTER displaying the final score
        state.score = 0;
        state.level = 1;
        state.wordsCompleted = 0;
        state.usedWords = [];
        initGame();
        updateStats();
    };
    
    // Show the lose screen
    modal.style.display = 'flex';
    loseScreen.style.display = 'block';
    
    setupShareButtons();
}

function setupShareButtons() {
    // Use the current score before any reset
    const shareText = `I scored ${state.score} points in Word Guess Game! Can you beat me?`;
    const shareUrl = window.location.href;
    
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.onclick = function() {
            if (this.classList.contains('whatsapp')) {
                window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
            } else if (this.classList.contains('facebook')) {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
            } else if (this.classList.contains('twitter')) {
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
            }
        };
    });
    
    document.querySelectorAll('.play-again-btn').forEach(btn => {
        btn.onclick = function() {
            document.getElementById('results-modal').style.display = 'none';
            // Reset game state when actually playing again
            state.score = 0;
            state.level = 1;
            state.wordsCompleted = 0;
            state.usedWords = [];
            initGame();
            updateStats();
        };
    });
}

function showHint() {
    if (state.hintUsed || state.gameOver) return;
    
    state.hintUsed = true;
    const categoryHints = config.wordHints[state.selectedCategory];
    const hint = categoryHints ? categoryHints[state.selectedWord] : 'No hint available';
    elements.hintText.textContent = hint || 'No hint available for this word';
    elements.hintButton.disabled = true;
    soundManager.playSound('click');
}

function showMessage(text, type) {
    elements.message.textContent = text;
    elements.message.className = 'message animate__animated animate__bounceIn';
    elements.message.style.display = 'block';
    
    switch (type) {
        case 'success':
            elements.message.style.color = '#4cc9f0';
            elements.message.style.backgroundColor = 'rgba(76, 201, 240, 0.2)';
            break;
        case 'error':
            elements.message.style.color = '#ef233c';
            elements.message.style.backgroundColor = 'rgba(239, 35, 60, 0.2)';
            break;
        default:
            elements.message.style.color = 'white';
            elements.message.style.backgroundColor = 'transparent';
    }
    
    setTimeout(() => {
        elements.message.style.display = 'none';
    }, 3000);
}

function updateStats() {
    elements.score.textContent = state.score;
    elements.level.textContent = state.level;
}

function handleBackToCategories() {
    clearInterval(state.timer);
    localStorage.setItem('gameState', JSON.stringify(state));
    window.location.href = 'categories.html';
}

// Event listeners
elements.guessButton.addEventListener('click', () => {
    soundManager.playSound('click');
    makeGuess();
});

elements.restartButton.addEventListener('click', () => {
    soundManager.playSound('click');
    state.score = 0;
    state.level = 1;
    state.wordsCompleted = 0;
    state.usedWords = [];
    initGame();
    updateStats();
});

elements.hintButton.addEventListener('click', () => {
    soundManager.playSound('click');
    showHint();
});

elements.quitButton.addEventListener('click', () => {
    soundManager.playSound('click');
    handleBackToCategories();
});

elements.letterInput.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
        makeGuess();
    }
});

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    soundManager.init();
    initGame();
});