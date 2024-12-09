const gameBoard = document.getElementById('game');
const nextCanvas = document.getElementById('next');
const scoreDisplay = document.getElementById('score');
const comboDisplay = document.getElementById('combo');
const nextCtx = nextCanvas.getContext('2d');
const overlay = document.getElementById('overlay');

const ROWS = 20;
const COLS = 10;
const CELL_SIZE = 30;

let gameMatrix = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let activeShape;
let activeColor;
let nextShape;
let nextColor;
let activePosition = { x: 0, y: 0 };
let score = 0;
let combo = 0;
let gameSpeed = 1000;
let interval;

const COLORS = ['#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff', '#fff'];
const SHAPES = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]]
];

function rotateShape(shape) {
    return shape[0].map((_, index) => shape.map(row => row[index]).reverse());
}

function drawBoard() {
    gameBoard.innerHTML = '';
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (typeof gameMatrix[row][col] === 'string') {
                cell.style.background = gameMatrix[row][col];
                cell.classList.add('active');
            }
            gameBoard.appendChild(cell);
        }
    }
}

function drawShape() {
    activeShape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                const posY = activePosition.y + y;
                const posX = activePosition.x + x;
                if (posY >= 0 && posY < ROWS && posX >= 0 && posX < COLS) {
                    gameMatrix[posY][posX] = activeColor;
                }
            }
        });
    });
}

function clearShape() {
    activeShape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                const posY = activePosition.y + y;
                const posX = activePosition.x + x;
                if (posY >= 0 && posY < ROWS && posX >= 0 && posX < COLS) {
                    gameMatrix[posY][posX] = 0;
                }
            }
        });
    });
}

function drawNextShape() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    nextShape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                nextCtx.fillStyle = nextColor;
                nextCtx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                nextCtx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        });
    });
}

function spawnShape() {
    activeShape = nextShape || SHAPES[Math.floor(Math.random() * SHAPES.length)];
    activeColor = nextColor || COLORS[Math.floor(Math.random() * COLORS.length)];
    nextShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    activePosition = { x: Math.floor(COLS / 2) - Math.floor(activeShape[0].length / 2), y: 0 };
    drawNextShape();
    if (checkCollision()) {
        gameOver();
    }
}

function moveDown() {
    clearShape();
    activePosition.y++;
    if (checkCollision()) {
        activePosition.y--;
        placeShape();
        checkLineClear();
        spawnShape();
    }
    drawShape();
    drawBoard();
}

function moveLeft() {
    clearShape();
    activePosition.x--;
    if (checkCollision()) {
        activePosition.x++;
    }
    drawShape();
    drawBoard();
}

function moveRight() {
    clearShape();
    activePosition.x++;
    if (checkCollision()) {
        activePosition.x--;
    }
    drawShape();
    drawBoard();
}

function rotateCurrentShape() {
    clearShape();
    const rotatedShape = rotateShape(activeShape);
    const originalShape = activeShape;
    activeShape = rotatedShape;
    if (checkCollision()) {
        activeShape = originalShape;
    }
    drawShape();
    drawBoard();
}

function dropToBottom() {
    clearShape();
    while (!checkCollision()) {
        activePosition.y++;
    }
    activePosition.y--;
    drawShape();
    drawBoard();
    placeShape();
    checkLineClear();
    spawnShape();
}

function checkCollision() {
    return activeShape.some((row, y) => {
        return row.some((cell, x) => {
            if (cell) {
                const posY = activePosition.y + y;
                const posX = activePosition.x + x;
                if (posY >= ROWS || posX < 0 || posX >= COLS || (gameMatrix[posY] && typeof gameMatrix[posY][posX] === 'string')) {
                    return true;
                }
            }
            return false;
        });
    });
}

function placeShape() {
    activeShape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                const posY = activePosition.y + y;
                const posX = activePosition.x + x;
                if (posY >= 0 && posY < ROWS && posX >= 0 && posX < COLS) {
                    gameMatrix[posY][posX] = activeColor;
                }
            }
        });
    });
}

function checkLineClear() {
    let linesCleared = 0;
    for (let row = 0; row < ROWS; row++) {
        if (gameMatrix[row].every(cell => typeof cell === 'string')) {
            gameMatrix.splice(row, 1);
            gameMatrix.unshift(Array(COLS).fill(0));
            linesCleared++;
        }
    }
    if (linesCleared > 0) {
        score += 10 * linesCleared + 10 * linesCleared * combo;
        combo++;
    } else {
        combo = 0;
    }
    scoreDisplay.textContent = score;
    comboDisplay.textContent = combo;
    if (score >= 200 && score % 200 === 0 && gameSpeed > 200) {
        gameSpeed = Math.max(200, gameSpeed / 1.2);
        clearInterval(interval);
        interval = setInterval(moveDown, gameSpeed);
    }
}

function gameOver() {
    clearInterval(interval);
    overlay.classList.add('visible');
}

function restartGame() {
    gameMatrix = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    score = 0;
    combo = 0;
    scoreDisplay.textContent = score;
    comboDisplay.textContent = combo;
    overlay.classList.remove('visible');
    gameSpeed = 1000;
    startGame();
}

function startGame() {
    spawnShape();
    drawBoard();
    interval = setInterval(moveDown, gameSpeed);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
        moveDown();
    } else if (e.key === 'ArrowLeft') {
        moveLeft();
    } else if (e.key === 'ArrowRight') {
        moveRight();
    } else if (e.key === 'ArrowUp') {
        rotateCurrentShape();
    } else if (e.key === ' ') {
        dropToBottom();
    }
});

startGame();
