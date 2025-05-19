let secretNumber;
let remainingGuesses;
let highScore = { easy: 0, normal: 0, hard: 0 };
let gameOver = false;
let currentDifficulty = 'easy';
let timerInterval = null;
let timeLeft = 30;

const guessInput = document.getElementById("guessInput");
const checkBtn = document.getElementById("checkBtn");
const resetBtn = document.getElementById("resetBtn");
const message = document.getElementById("message");
const remainingDisplay = document.getElementById("remaining");
const highScoreDisplay = document.getElementById("highScore");
const difficultyDropdown = document.getElementById("difficultyDropdown");
const dropdownTrigger = difficultyDropdown.querySelector(".dropdown-trigger");
const dropdownOptions = difficultyDropdown.querySelector(".dropdown-options");
const container = document.querySelector(".container");
const timerDisplay = document.getElementById("timerDisplay");
const timeLeftDisplay = document.getElementById("timeLeft");
const modeDetails = document.getElementById("modeDetails");

const winPopup = document.getElementById("winPopup");
const losePopup = document.getElementById("losePopup");

// Custom dropdown handling
let isDropdownOpen = false;

function toggleDropdown() {
    isDropdownOpen = !isDropdownOpen;
    dropdownOptions.classList.toggle("active", isDropdownOpen);
    difficultyDropdown.setAttribute("aria-expanded", isDropdownOpen);
}

function closeDropdown() {
    isDropdownOpen = false;
    dropdownOptions.classList.remove("active");
    difficultyDropdown.setAttribute("aria-expanded", "false");
}

difficultyDropdown.addEventListener("click", (e) => {
    if (e.target.classList.contains("dropdown-trigger") || e.target === difficultyDropdown) {
        toggleDropdown();
    } else if (e.target.tagName === "LI") {
        currentDifficulty = e.target.getAttribute("data-value");
        dropdownTrigger.textContent = e.target.textContent;
        updateModeDetails();
        initGame();
        closeDropdown();
    }
});

difficultyDropdown.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleDropdown();
    } else if (e.key === "Escape") {
        closeDropdown();
    }
});

document.addEventListener("click", (e) => {
    if (!difficultyDropdown.contains(e.target)) {
        closeDropdown();
    }
});

// Difficulty settings
const difficultySettings = {
    easy: { maxNumber: 100, guesses: 10, timer: false },
    normal: { maxNumber: 150, guesses: 8, timer: false },
    hard: { maxNumber: 200, guesses: 6, timer: true, timeLimit: 30 }
};

// Update mode details
function updateModeDetails() {
    const settings = difficultySettings[currentDifficulty];
    let details = `Range: 1–${settings.maxNumber}, Guesses: ${settings.guesses}`;
    if (settings.timer) {
        details += `, Timer: ${settings.timeLimit}s`;
    }
    modeDetails.textContent = details;
}

// Timer functions
function startTimer() {
    if (!difficultySettings[currentDifficulty].timer) {
        timerDisplay.style.display = 'none';
        return;
    }
    timerDisplay.style.display = 'block';
    timeLeft = difficultySettings[currentDifficulty].timeLimit;
    timeLeftDisplay.textContent = timeLeft;
    timerDisplay.classList.remove('low');

    timerInterval = setInterval(() => {
        timeLeft--;
        timeLeftDisplay.textContent = timeLeft;

        if (timeLeft <= 10) {
            timerDisplay.classList.add('low');
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (!gameOver) {
                gameOver = true;
                showMessage(`⏰ Time's up! The number was ${secretNumber}`, "#c026d3");
                disableInput();
                showLoseAnimation();
            }
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timerDisplay.style.display = 'none';
}

// Initialize game
function initGame() {
    stopTimer();
    secretNumber = Math.floor(Math.random() * difficultySettings[currentDifficulty].maxNumber) + 1;
    console.log(secretNumber);
    remainingGuesses = difficultySettings[currentDifficulty].guesses;
    remainingDisplay.textContent = remainingGuesses;
    highScoreDisplay.textContent = highScore[currentDifficulty];
    showMessage(`Guess a number between 1 and ${difficultySettings[currentDifficulty].maxNumber}`, "#ffffff");
    enableInput();
    gameOver = false;
    updateModeDetails();
    startTimer();
}

// Utility functions
function showMessage(msg, color = "#ffffff") {
    message.textContent = msg;
    message.style.color = color;
}

function disableInput() {
    guessInput.disabled = true;
    checkBtn.disabled = true;
    resetBtn.disabled = false;
}

function enableInput() {
    guessInput.disabled = false;
    checkBtn.disabled = false;
    resetBtn.disabled = true;
    guessInput.value = "";
    guessInput.focus();
}

// Show Lottie popups
function showWinAnimation() {
    stopTimer();
    winPopup.classList.add("active");
    container.classList.add("blur");
}

function showLoseAnimation() {
    stopTimer();
    losePopup.classList.add("active");
    container.classList.add("blur");
}

// Hide on click
winPopup.addEventListener("click", () => {
    winPopup.classList.remove("active");
    container.classList.remove("blur");
});

losePopup.addEventListener("click", () => {
    losePopup.classList.remove("active");
    container.classList.remove("blur");
});

// Handle Guess
checkBtn.addEventListener("click", () => {
    if (gameOver) return;

    const guess = Number(guessInput.value.trim());

    // Validation
    if (!guessInput.value.trim()) {
        showMessage("Please enter a number!", "#06b6d4");
        return;
    }

    if (isNaN(guess)) {
        showMessage("That's not a number!", "#06b6d4");
        return;
    }

    if (guess < 1 || guess > difficultySettings[currentDifficulty].maxNumber) {
        showMessage(`Enter a number between 1 and ${difficultySettings[currentDifficulty].maxNumber}!`, "#06b6d4");
        return;
    }

    remainingGuesses--;
    remainingDisplay.textContent = remainingGuesses;

    if (guess === secretNumber) {
        showMessage(`🎉 Correct! The number was ${secretNumber}`, "#c026d3");
        if (remainingGuesses > highScore[currentDifficulty]) {
            highScore[currentDifficulty] = remainingGuesses;
            highScoreDisplay.textContent = highScore[currentDifficulty];
        }
        disableInput();
        showWinAnimation();
        gameOver = true;
    } else if (remainingGuesses === 0) {
        showMessage(`💀 Game Over! The number was ${secretNumber}`, "#c026d3");
        disableInput();
        showLoseAnimation();
        gameOver = true;
    } else {
        const maxNumber = difficultySettings[currentDifficulty].maxNumber;
        const diff = Math.abs(guess - secretNumber);
        const closeThreshold = maxNumber * 0.1; // 10% of maxNumber
        const moderateThreshold = maxNumber * 0.25; // 25% of maxNumber

        if (guess > secretNumber) {
            if (diff <= closeThreshold) {
                showMessage("📉 Just a tad too high!", "#06b6d4");
            } else if (diff <= moderateThreshold) {
                showMessage("📉 A bit too high!", "#06b6d4");
            } else {
                showMessage("📉 Way too high!", "#06b6d4");
            }
        } else {
            if (diff <= closeThreshold) {
                showMessage("📈 Just a tad too low!", "#06b6d4");
            } else if (diff <= moderateThreshold) {
                showMessage("📈 A bit too low!", "#06b6d4");
            } else {
                showMessage("📈 Way too low!", "#06b6d4");
            }
        }
    }
});

// Reset Game
resetBtn.addEventListener("click", () => {
    initGame();
    // Hide popups and remove blur on reset
    winPopup.classList.remove("active");
    losePopup.classList.remove("active");
    container.classList.remove("blur");
});

// Start game
initGame();