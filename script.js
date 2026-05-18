// حالهت اللعبة والمتغيرات
let board = [...Array(9).fill("")];      
let currentPlayer = "X";                 
let isGameActive = true;                
let gameMode = "multi";                 

// Scores stored in localStorage: { X: wins, O: wins, D: draws }
let scores = JSON.parse(localStorage.getItem("scores")) || {
  X: 0,
  O: 0,
  D: 0
};

// حلات الفوز الممكنة
const winningCombinations = [
  [0,1,2],[3,4,5],[6,7,8],   
  [0,3,6],[1,4,7],[2,5,8],   
  [0,4,8],[2,4,6]            
];

// الصوت 
const sounds = {
  click: new Audio("assets/sounds/dog-clicker_IygBqAk.mp3"),
  win:   new Audio("assets/sounds/winner-price-is-right.mp3"),
  loss:  new Audio("assets/sounds/points-loss.mp3")
};

function playSound(type) {
  if (sounds[type]) {
    sounds[type].currentTime = 0;
    sounds[type].play();
  }
}

// AI Minimax Algorithm
function minimax(boardState, isMaximizing) {           
  const winner = getWinner(boardState);

  if (winner === "O") return  10;
  if (winner === "X") return -10;
  if (!boardState.includes("")) return 0;

  let bestScore = isMaximizing ? -Infinity : Infinity;  

  boardState.forEach((_, cellIndex) => {              
    if (boardState[cellIndex] === "") {
      boardState[cellIndex] = isMaximizing ? "O" : "X";
      const score = minimax(boardState, !isMaximizing);
      boardState[cellIndex] = "";

      bestScore = isMaximizing
        ? Math.max(bestScore, score)
        : Math.min(bestScore, score);
    }
  });

  return bestScore;
}

function getBestAIMove() {  
 // 30% نسبة الخطأ 
const emptyCells = board
  .map((cellValue, cellIndex) => cellValue === "" ? cellIndex : null)
  .filter(cell => cell !== null);
  
if (Math.random() < 0.3) {
  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  return emptyCells[randomIndex];
}
// افضل حركة باستخدام Minimax 70%                          
  let bestScore = -Infinity;
  let bestCellIndex = 0;                              

  board.forEach((_, cellIndex) => {
    if (board[cellIndex] === "") {
      board[cellIndex] = "O";
      const score = minimax(board, false);
      board[cellIndex] = "";

      if (score > bestScore) {
        bestScore = score;
        bestCellIndex = cellIndex;
      }
    }
  });

  return bestCellIndex;
}

// التحقق من الفائز
function getWinner(boardState) {
  for (const [a, b, c] of winningCombinations) {       
    if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
      return boardState[a];
    }
  }
  return null;
}

// رسم اللوحه
function render() {
  const boardElement = document.getElementById("board"); 
  boardElement.innerHTML = "";

  board.forEach((cellValue, cellIndex) => {              
    const cell = document.createElement("div");          
    cell.className = "cell";

    if (cellValue) cell.classList.add(cellValue.toLowerCase());

    cell.textContent = cellValue;
    cell.onclick = () => handleCellClick(cellIndex);     

    boardElement.appendChild(cell);
  });

  highlightWinningCells();                               
}

// تلوين الخلايا الفائزة
function highlightWinningCells() {
  const boardElement = document.getElementById("board");

  winningCombinations.forEach(([a, b, c]) => {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      [a, b, c].forEach(cellIndex => {
        boardElement.children[cellIndex].classList.add("win");
      });
    }
  });
}

//الضغط على الخلية
function handleCellClick(cellIndex) {                   
  if (!isGameActive || board[cellIndex]) return;

  playSound("click");

  board[cellIndex] = currentPlayer;
  render();

  if (checkGameEnd()) return;                           

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateStatusDisplay();                                 

  if (gameMode === "ai" && currentPlayer === "O") {
    setTimeout(playAITurn, 400);                         
  }
}

// دور AI
function playAITurn() {
  if (!isGameActive) return;

  board[getBestAIMove()] = "O";
  playSound("click");

  render();

  if (checkGameEnd()) return;

  currentPlayer = "X";
  updateStatusDisplay();
}

// التحقق من نهاية اللعبة
function checkGameEnd() {
  const winner = getWinner(board);

  if (winner) {
    isGameActive = false;
    scores[winner]++;
    saveScores();
    updateScoresDisplay();                               

    document.getElementById("status").textContent = `Player ${winner} wins!`;
    playSound("win");
    return true;
  }

  if (!board.includes("")) {
    isGameActive = false;
    scores.D++;
    saveScores();
    updateScoresDisplay();

    document.getElementById("status").textContent = "It's a draw!";
    playSound("loss");
    return true;
  }

  return false;
}

// تحديث عرض الحالة والنتائج
function updateStatusDisplay() {
  document.getElementById("status").textContent = `Player ${currentPlayer}'s turn`;
}

function updateScoresDisplay() {
  document.getElementById("sx").textContent = scores.X;
  document.getElementById("so").textContent = scores.O;
  document.getElementById("sd").textContent = scores.D;
}

function saveScores() {
  localStorage.setItem("scores", JSON.stringify(scores));
}

// إعادة تشغيل اللعبة
function restart() {
  board = [...Array(9).fill("")];
  currentPlayer = "X";
  isGameActive = true;
  updateStatusDisplay();
  render();
}
// إعادة تعيين النتائج
function resetScores() {
  scores = { X: 0, O: 0, D: 0 };
  saveScores();
  updateScoresDisplay();
}

function setMode(selectedMode) {                         
  gameMode = selectedMode;

  document.getElementById("m2").classList.toggle("active", selectedMode === "multi");
  document.getElementById("mai").classList.toggle("active", selectedMode === "ai");

  restart();
}


updateScoresDisplay();
restart();