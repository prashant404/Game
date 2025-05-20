const board = document.getElementById("board");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("reset");
const modeRadios = document.querySelectorAll("input[name='mode']");
const gameOverModal = new bootstrap.Modal(document.getElementById("gameOverModal"));
const resultText = document.getElementById("resultText");
const playAgainBtn = document.getElementById("playAgain");
const chooseModal = new bootstrap.Modal(document.getElementById("chooseSymbolModal"));
const chooseButtons = document.querySelectorAll(".choose-symbol");

let cells;
let currentPlayer = "X";
let playerSymbol = "X";
let aiSymbol = "O";
let gameActive = true;
let vsAI = false;

const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

function createBoard() {
    board.innerHTML = "";
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell", "border", "d-flex", "align-items-center", "justify-content-center");
        cell.dataset.index = i;
        board.appendChild(cell);
    }
    cells = document.querySelectorAll(".cell");
    cells.forEach(cell => cell.addEventListener("click", handleClick));
    updateStatus();
}

function updateStatus() {
    statusText.textContent = gameActive ? `Player ${currentPlayer}'s Turn` : "";
}

function handleClick(e) {
    const cell = e.target;
    if (!gameActive || cell.textContent !== "") return;

    cell.textContent = currentPlayer;
    cell.style.opacity = "0";
    cell.style.transform = "scale(0.5)";
    setTimeout(() => {
        cell.style.opacity = "1";
        cell.style.transform = "scale(1)";
    }, 100);

    if (checkWinner(cells, currentPlayer)) {
        endGame(`Player ${currentPlayer} Wins!`);
        return;
    }

    if (isDraw(cells)) {
        endGame("It's a Draw!");
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateStatus();

    if (vsAI && currentPlayer === aiSymbol) {
        setTimeout(() => aiMove(), 500);
    }
}

function checkWinner(boardCells, player) {
    return winPatterns.some(pattern => pattern.every(index => boardCells[index].textContent === player));
}

function isDraw(boardCells) {
    return [...boardCells].every(cell => cell.textContent !== "");
}

function endGame(message) {
    gameActive = false;
    resultText.textContent = message;
    gameOverModal.show();
}

function aiMove() {
    const boardState = [...cells].map(cell => cell.textContent);
    let move = getBestMove(boardState);

    if (move !== null) {
        cells[move].textContent = aiSymbol;
        cells[-move].style.opacity = "0";
        cells[move].style.transform = "scale(0.5)";
        setTimeout(() => {
            cells[move].style.opacity = "1";
            cells[move].style.transform = "scale(1)";
        }, 100);

        if (checkWinner(cells, aiSymbol)) {
            endGame(`Player ${aiSymbol} Wins!`);
            return;
        }

        if (isDraw(cells)) {
            endGame("It's a Draw!");
            return;
        }

        currentPlayer = playerSymbol;
        updateStatus();
    }
}

function getBestMove(boardState) {
    let bestScore = -Infinity;
    let move = null;

    for (let i = 0; i < boardState.length; i++) {
        if (boardState[i] === "") {
            boardState[i] = aiSymbol;
            let score = minimax(boardState, 0, false);
            boardState[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(boardState, depth, isMaximizing) {
    if (checkWinnerForBoard(boardState, aiSymbol)) return 10 - depth;
    if (checkWinnerForBoard(boardState, playerSymbol)) return depth - 10;
    if (boardState.every(cell => cell !== "")) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < boardState.length; i++) {
            if (boardState[i] === "") {
                boardState[i] = aiSymbol;
                let score = minimax(boardState, depth + 1, false);
                boardState[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < boardState.length; i++) {
            if (boardState[i] === "") {
                boardState[i] = playerSymbol;
                let score = minimax(boardState, depth + 1, true);
                boardState[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinnerForBoard(boardState, player) {
    return winPatterns.some(pattern => pattern.every(index => boardState[index] === player));
}

function resetGame() {
    gameActive = true;
    currentPlayer = playerSymbol;
    createBoard();
}

modeRadios.forEach(radio => {
    radio.addEventListener("change", () => {
        vsAI = document.querySelector("input[name='mode']:checked").value === "ai";
        chooseModal.show();
    });
});

chooseButtons.forEach(button => {
    button.addEventListener("click", () => {
        playerSymbol = button.dataset.symbol;
        aiSymbol = playerSymbol === "X" ? "O" : "X";
        currentPlayer = playerSymbol;
        chooseModal.hide();
        resetGame();
    });
});

resetBtn.addEventListener("click", resetGame);
playAgainBtn.addEventListener("click", () => {
    gameOverModal.hide();
    resetGame();
});

window.addEventListener("DOMContentLoaded", () => {
    createBoard();
    chooseModal.show();
});