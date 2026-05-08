let b = [...Array(9).fill("")];

let p = "X";

let on = true;

let mode = "multi";

/* تحميل النتائج المحفوظة */
let sc = JSON.parse(localStorage.getItem("scores")) || {
  X: 0,
  O: 0,
  D: 0
};

const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];
// test
/* AI */

function minimax(board, isMax){

  const w = getWinner(board);

  if(w === "O") return 10;

  if(w === "X") return -10;

  if(!board.includes("")) return 0;

  let best = isMax ? -Infinity : Infinity;

  board.forEach((_, i) => {

    if(board[i] === ""){

      board[i] = isMax ? "O" : "X";

      const value = minimax(board, !isMax);

      board[i] = "";

      best = isMax
        ? Math.max(best, value)
        : Math.min(best, value);
    }
  });

  return best;
}

function bestMove(){

  let best = -Infinity;

  let idx = 0;

  b.forEach((_, i) => {

    if(b[i] === ""){

      b[i] = "O";

      const value = minimax(b, false);

      b[i] = "";

      if(value > best){

        best = value;

        idx = i;
      }
    }
  });

  return idx;
}

/* تحديد الفائز */

function getWinner(board){

  for(const [a,c,e] of wins){

    if(
      board[a] &&
      board[a] === board[c] &&
      board[a] === board[e]
    ){
      return board[a];
    }
  }

  return null;
}

/* رسم البورد */

function render(){

  const el = document.getElementById("board");

  el.innerHTML = "";

  b.forEach((v, i) => {

    const d = document.createElement("div");

    d.className = "cell";

    if(v){
      d.classList.add(v.toLowerCase());
    }

    d.textContent = v;

    d.onclick = () => move(i);

    el.appendChild(d);
  });

  highlightWinner();
}

/* تلوين الفوز */

function highlightWinner(){

  const el = document.getElementById("board");

  wins.forEach(([a,c,e]) => {

    if(
      b[a] &&
      b[a] === b[c] &&
      b[a] === b[e]
    ){

      [a,c,e].forEach(i => {
        el.children[i].classList.add("win");
      });
    }
  });
}

/* حركة اللاعب */

function move(i){

  if(!on || b[i]) return;

  b[i] = p;

  render();

  if(checkEnd()) return;

  p = p === "X" ? "O" : "X";

  updateStatus();

  if(mode === "ai" && p === "O"){

    setTimeout(aiTurn, 400);
  }
}

/* حركة الذكاء الاصطناعي */

function aiTurn(){

  if(!on) return;

  b[bestMove()] = "O";

  render();

  if(checkEnd()) return;

  p = "X";

  updateStatus();
}

/* التحقق من النهاية */

function checkEnd(){

  const w = getWinner(b);

  if(w){

    on = false;

    sc[w]++;

    saveScores();

    updateScores();

    document.getElementById("status")
      .textContent = `Player ${w} wins!`;

    return true;
  }

  if(!b.includes("")){

    on = false;

    sc.D++;

    saveScores();

    updateScores();

    document.getElementById("status")
      .textContent = "It's a draw!";

    return true;
  }

  return false;
}

/* تحديث النص */

function updateStatus(){

  document.getElementById("status")
    .textContent = `Player ${p}'s turn`;
}

/* تحديث النتائج */

function updateScores(){

  document.getElementById("sx").textContent = sc.X;

  document.getElementById("so").textContent = sc.O;

  document.getElementById("sd").textContent = sc.D;
}

/* حفظ النتائج */

function saveScores(){

  localStorage.setItem("scores", JSON.stringify(sc));
}

/* إعادة اللعبة */

function restart(){

  b = [...Array(9).fill("")];

  p = "X";

  on = true;

  updateStatus();

  render();
}

/* تصفير النتائج */

function resetScores(){

  sc = {
    X:0,
    O:0,
    D:0
  };

  saveScores();

  updateScores();
}

/* تغيير نوع اللعب */

function setMode(m){

  mode = m;

  document.getElementById("m2")
    .classList.toggle("active", m === "multi");

  document.getElementById("mai")
    .classList.toggle("active", m === "ai");

  restart();
}

/* تشغيل أولي */

updateScores();

restart();