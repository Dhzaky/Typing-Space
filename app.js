const bgm = new Audio('bgm.mp3');
bgm.loop = true;
bgm.volume = 0.3;

const sfxCorrect = new Audio('correct.mp3');
sfxCorrect.volume = 0.5;

const sfxWrong = new Audio('wrong.mp3');
sfxWrong.volume = 0.6;

const sfxFinish = new Audio('finish.mp3');
sfxFinish.volume = 0.8;

function playSound(audioElement) {
    if (!audioElement) return;
    audioElement.currentTime = 0;
    audioElement.play().catch(e => console.log("Audio play blocked by browser:", e));
}

function createStars() {
    const container = document.getElementById('starfield');
    for(let i = 0; i < 50; i++) {
        let star = document.createElement('div');
        star.className = 'star';
        let size = Math.random() * 3 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.left = Math.random() * 100 + 'vw';
        star.style.top = Math.random() * 100 + 'vh';
        star.style.animationDuration = (Math.random() * 3 + 2) + 's';
        star.style.animationDelay = (Math.random() * 2) + 's';
        container.appendChild(star);
    }
}
createStars();

const kataIndo = [
    "saya", "kamu", "kita", "mereka", "pesawat", "luar", "angkasa", "bintang", "galaksi", 
    "roket", "cepat", "kilat", "meteor", "planet", "bulan", "matahari", "bumi", "orbit", 
    "komet", "astronot", "kosmos", "terbang", "balapan", "menang", "kalah", "juara", "waktu", 
    "mengetik", "jari", "belajar", "fokus", "tepat", "akurat", "langit", "hitam", "gelap", 
    "cahaya", "batu", "debu", "udara", "api", "mesin", "kecepatan", "super", "galaktik", 
    "nebula", "alien", "ufo", "laser", "radar", "sistem", "tata", "surya", "bima", "sakti", 
    "gravitasi", "vakum", "dimensi", "ruang", "kapsul", "stasiun", "satelit", "komunikasi", 
    "sinyal", "kontrol", "misi", "kapten", "pilot", "baju", "helm", "oksigen", "bahan", 
    "bakar", "kristal", "energi", "daya", "dorong", "lompat", "hiper", "navigasi", "koordinat", 
    "tujuan", "selamat", "bahaya", "sistem", "rusak", "perbaikan", "berhasil", "menuju"
];

let timer = 60;
let interval = null;
let isPlaying = false;
let charIndex = 0; 
let wordIndex = 0;
let correctChars = 0;
let totalKeystrokes = 0;

const wordsDiv = document.getElementById('words');
const input = document.getElementById('hidden-input');
const timeDisplay = document.getElementById('time');
const wpmDisplay = document.getElementById('wpm-live');
const playerShip = document.getElementById('player-ship');
const botShip = document.getElementById('bot-ship');
const modal = document.getElementById('result-modal');
const typingBox = document.getElementById('typing-box');
const restartBtn = document.getElementById('btn-restart');

restartBtn.addEventListener('click', initGame);

function initGame() {
    timer = 60;
    isPlaying = false;
    clearInterval(interval);
    correctChars = 0;
    totalKeystrokes = 0;
    wordIndex = 0;
    charIndex = 0;
    
    timeDisplay.innerText = timer;
    wpmDisplay.innerText = 0;
    playerShip.style.left = '0%';
    botShip.style.left = '0%';
    modal.classList.add('hidden');
    
    input.disabled = false;
    input.value = '';
    input.focus();
    
    sfxFinish.pause();
    sfxFinish.currentTime = 0;
    bgm.pause();
    bgm.currentTime = 0;
    
    generateWords();
}

function generateWords() {
    wordsDiv.innerHTML = '';
    let shuffled = [...kataIndo].sort(() => 0.5 - Math.random());
    let wordPool = [];
    while(wordPool.length < 150) {
        wordPool = wordPool.concat(shuffled.sort(() => 0.5 - Math.random()));
    }
    
    wordPool.slice(0, 150).forEach((word) => {
        let wordSpan = document.createElement('div');
        wordSpan.classList.add('word');
        word.split('').forEach(char => {
            let charSpan = document.createElement('span');
            charSpan.classList.add('char');
            charSpan.innerText = char;
            wordSpan.appendChild(charSpan);
        });
        wordsDiv.appendChild(wordSpan);
    });
    
    wordsDiv.childNodes[0].classList.add('active');
}

typingBox.addEventListener('click', () => {
    input.focus();
});

typingBox.addEventListener('touchstart', () => {
    input.focus();
});

document.addEventListener('keydown', () => {
    input.focus();
});

input.addEventListener('input', (e) => {
    if(!isPlaying) {
        startTimer();
    }
    
    const currentWord = wordsDiv.childNodes[wordIndex];
    const chars = currentWord.childNodes;
    const typedVal = input.value;
    const typedChar = typedVal[typedVal.length - 1];
    
    if(typedVal.length < charIndex) {
        charIndex--;
        if(charIndex < 0) charIndex = 0;
        chars[charIndex].classList.remove('correct', 'incorrect');
        return;
    }

    if(typedChar === ' ') {
        if(charIndex > 0) {
            currentWord.classList.remove('active');
            
            for(let i = charIndex; i < chars.length; i++) {
                chars[i].classList.add('incorrect');
            }
            
            wordIndex++;
            charIndex = 0;
            wordsDiv.childNodes[wordIndex].classList.add('active');
            input.value = '';
            
            scrollWords();
        } else {
            input.value = '';
        }
        return;
    }

    if(charIndex < chars.length) {
        totalKeystrokes++;
        const expectedChar = chars[charIndex].innerText;
        
        if(typedChar === expectedChar) {
            chars[charIndex].classList.add('correct');
            correctChars++;
            playSound(sfxCorrect);
        } else {
            chars[charIndex].classList.add('incorrect');
            playSound(sfxWrong);
        }
        
        charIndex++;
        updateStats();
    } else {
        input.value = input.value.slice(0, -1);
    }
});

function scrollWords() {
    const activeWord = wordsDiv.childNodes[wordIndex];
    const activeTop = activeWord.offsetTop;
    
    let wordsToHide = [];
    
    for (let i = 0; i < wordIndex; i++) {
        let word = wordsDiv.childNodes[i];
        if (word.offsetTop < activeTop && word.style.display !== 'none') {
            wordsToHide.push(word);
        }
    }
    
    wordsToHide.forEach(word => {
        word.style.display = 'none';
    });
}

function startTimer() {
    isPlaying = true;
    
    bgm.play().catch(e => console.log("BGM play blocked:", e));
    
    interval = setInterval(() => {
        timer--;
        timeDisplay.innerText = timer;
        
        let timeElapsed = 60 - timer;
        let maxTrackWPM = 100;
        let botPercent = (timeElapsed / 60) * (40 / maxTrackWPM) * 100;
        botShip.style.left = Math.min(botPercent, 90) + '%';
        
        if(timer <= 0) {
            endGame();
        }
    }, 1000);
}

function updateStats() {
    let timeElapsed = 60 - timer;
    let currentWPM = 0;
    if(timeElapsed > 0) {
        currentWPM = Math.round((correctChars / 5) / (timeElapsed / 60));
    }
    wpmDisplay.innerText = currentWPM;
    
    let maxTrackWPM = 100;
    let wpmEquiv = (correctChars / 5);
    let playerPercent = (wpmEquiv / maxTrackWPM) * 100;
    
    playerShip.style.left = Math.min(playerPercent, 90) + '%';
}

function endGame() {
    clearInterval(interval);
    isPlaying = false;
    input.disabled = true;
    
    bgm.pause();
    playSound(sfxFinish);
    
    let finalWpm = Math.round(correctChars / 5);
    let accuracy = totalKeystrokes > 0 ? Math.round((correctChars / totalKeystrokes) * 100) : 0;
    
    document.getElementById('final-wpm').innerText = finalWpm;
    document.getElementById('final-accuracy').innerText = accuracy + '%';
    document.getElementById('correct-chars-count').innerText = correctChars;
    
    modal.classList.remove('hidden');
}

window.onload = initGame;