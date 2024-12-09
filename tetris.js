const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ROWS = 20;
const COLUMNS = 10;
const BLOCK_SIZE = 30; // 각 블록 크기
let score = 0; // 점수

// 테트리스 게임판 배열
let board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));

// 테트리스 블록 모양들
const TETROMINOS = [
    [[1, 1, 1], [0, 1, 0]], // T 모양
    [[1, 1], [1, 1]],       // O 모양
    [[1, 1, 0], [0, 1, 1]], // S 모양
    [[0, 1, 1], [1, 1, 0]], // Z 모양
    [[1, 0, 0], [1, 1, 1]], // L 모양
    [[0, 0, 1], [1, 1, 1]], // J 모양
    [[1, 1, 1, 1]]          // I 모양
];

const COLORS = [
    "#ff6347", // T
    "#f39c12", // O
    "#2ecc71", // S
    "#e74c3c", // Z
    "#3498db", // L
    "#9b59b6", // J
    "#1abc9c"  // I
];

let currentPiece = getRandomPiece();
let pieceRow = 0;
let pieceCol = Math.floor(COLUMNS / 2) - Math.floor(currentPiece.shape[0].length / 2);

// 랜덤한 테트리스 블록을 반환
function getRandomPiece() {
    let index = Math.floor(Math.random() * TETROMINOS.length);
    return { shape: TETROMINOS[index], color: COLORS[index] };
}

// 블록이 게임판에 들어맞는지 확인
function isValidMove(piece, row, col) {
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c]) {
                if (row + r >= ROWS || col + c < 0 || col + c >= COLUMNS || board[row + r][col + c]) {
                    return false;
                }
            }
        }
    }
    return true;
}

// 블록을 게임판에 고정시키기
function placePiece() {
    for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
            if (currentPiece.shape[r][c]) {
                board[pieceRow + r][pieceCol + c] = 1;
            }
        }
    }
    checkLines();
    currentPiece = getRandomPiece();
    pieceRow = 0;
    pieceCol = Math.floor(COLUMNS / 2) - Math.floor(currentPiece.shape[0].length / 2);
}

// 한 줄이 꽉 차면 삭제하고 점수 증가
function checkLines() {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(cell => cell === 1)) {
            board.splice(r, 1);
            board.unshift(Array(COLUMNS).fill(0));
            score += 10; // 한 줄을 채우면 100점 증가
            document.getElementById("score").textContent = `점수: ${score}`;
        }
    }
}

// 블록을 그리기
function drawPiece() {
    ctx.fillStyle = currentPiece.color;
    for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
            if (currentPiece.shape[r][c]) {
                ctx.fillRect((pieceCol + c) * BLOCK_SIZE, (pieceRow + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

// 게임판을 그리기
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 화면을 지움
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLUMNS; c++) {
            if (board[r][c]) {
                ctx.fillStyle = "#fff";
                ctx.fillRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

// 키보드 입력 처리
document.addEventListener("keydown", function(event) {
    if (event.key === "ArrowLeft") {
        if (isValidMove(currentPiece, pieceRow, pieceCol - 1)) {
            pieceCol--;
        }
    } else if (event.key === "ArrowRight") {
        if (isValidMove(currentPiece, pieceRow, pieceCol + 1)) {
            pieceCol++;
        }
    } else if (event.key === "ArrowDown") {
        if (isValidMove(currentPiece, pieceRow + 1, pieceCol)) {
            pieceRow++;
        }
    } else if (event.key === "ArrowUp") {
        let rotatedPiece = rotatePiece(currentPiece.shape);
        if (isValidMove({ shape: rotatedPiece, color: currentPiece.color }, pieceRow, pieceCol)) {
            currentPiece.shape = rotatedPiece;
        }
    }
});

// 블록 회전 함수
function rotatePiece(piece) {
    return piece[0].map((_, index) => piece.map(row => row[index])).reverse();
}

// 게임 초기화
function resetGame() {
    board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));
    currentPiece = getRandomPiece();
    pieceRow = 0;
    pieceCol = Math.floor(COLUMNS / 2) - Math.floor(currentPiece.shape[0].length / 2);
    score = 0;
    document.getElementById("score").textContent = `점수: ${score}`;
}

// 게임 루프
function gameLoop() {
    if (isValidMove(currentPiece, pieceRow + 1, pieceCol)) {
        pieceRow++;
    } else {
        placePiece();
    }
    drawBoard();
    drawPiece();
    setTimeout(gameLoop, 500); // 0.5초마다 게임 루프 실행
}

gameLoop();