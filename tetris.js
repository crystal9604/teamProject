const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let currentPiece;
let nextPiece;
let score = 0;
let combo = 0;
let gameInterval;
let speed = 1000;

const COLORS = ["red", "green", "blue", "yellow", "orange", "purple", "cyan"];
const SHAPES = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 1, 1], [1, 0, 0]],
  [[1, 1, 1], [0, 0, 1]]
];

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  board.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        ctx.fillStyle = cell;
        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    });
  });
}

function drawPiece(piece) {
  piece.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        ctx.fillStyle = piece.color;
        ctx.fillRect((piece.x + x) * BLOCK_SIZE, (piece.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeRect((piece.x + x) * BLOCK_SIZE, (piece.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    });
  });
}

function generatePiece() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return { shape, color, x: Math.floor(COLS / 2) - Math.ceil(shape[0].length / 2), y: 0 };
}

function movePiece(dx, dy) {
  currentPiece.x += dx;
  currentPiece.y += dy;
  if (checkCollision()) {
    currentPiece.x -= dx;
    currentPiece.y -= dy;
    return false;
  }
  return true;
}

function rotatePiece() {
  const originalShape = currentPiece.shape;
  currentPiece.shape = currentPiece.shape[0].map((_, i) => currentPiece.shape.map(row => row[i]).reverse());
  if (checkCollision()) {
    currentPiece.shape = originalShape;
  }
}

function checkCollision() {
  return currentPiece.shape.some((row, y) => {
    return row.some((cell, x) => {
      if (cell) {
        const newX = currentPiece.x + x;
        const newY = currentPiece.y + y;
        return (
          newX < 0 ||
          newX >= COLS ||
          newY >= ROWS ||
          (newY >= 0 && board[newY][newX])
        );
      }
      return false;
    });
  });
}

function placePiece() {
  currentPiece.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        const newX = currentPiece.x + x;
        const newY = currentPiece.y + y;
        if (newY >= 0) {
          board[newY][newX] = currentPiece.color;
        }
      }
    });
  });
  clearLines();
  currentPiece = nextPiece;
  nextPiece = generatePiece();
  if (checkCollision()) {
    endGame();
  }
}

function clearLines() {
  let linesCleared = 0;
  board = board.filter(row => {
    if (row.every(cell => cell)) {
      linesCleared++;
      return false;
    }
    return true;
  });
  while (board.length < ROWS) {
    board.unshift(Array(COLS).fill(0));
  }
  if (linesCleared > 0) {
    score += 100 * linesCleared + 10 * combo * linesCleared;
    combo++;
    scoreElement.textContent = `점수: ${score}`;
    if (score >= 1000) {
      speed = Math.max(200, speed / 1.5);
      clearInterval(gameInterval);
      gameInterval = setInterval(gameLoop, speed);
    }
  } else {
    combo = 0;
  }
}

function endGame() {
  clearInterval(gameInterval);
  alert(`게임 종료! 최종 점수: ${score}`);
  resetGame();
}

function resetGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  score = 0;
  combo = 0;
  speed = 1000;
  scoreElement.textContent = "점수: 0";
  startGame();
}

function gameLoop() {
  if (!movePiece(0, 1)) {
    placePiece();
  }
  drawBoard();
  drawPiece(currentPiece);
}

function startGame() {
  currentPiece = generatePiece();
  nextPiece = generatePiece();
  drawBoard();
  drawPiece(currentPiece);
  gameInterval = setInterval(gameLoop, speed);
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") movePiece(-1, 0);
  if (e.key === "ArrowRight") movePiece(1, 0);
  if (e.key === "ArrowDown") movePiece(0, 1);
  if (e.key === "ArrowUp") rotatePiece();
});

startGame();
