// ------------------------
// Chess Game - All in One
// ------------------------

// --- board.js ---
let selectedSquare = null; // track selected piece
let highlightedMoves = [];

function initialBoard() {
  return [
    ["r","n","b","q","k","b","n","r"],
    ["p","p","p","p","p","p","p","p"],
    [".",".",".",".",".",".",".","."],
    [".",".",".",".",".",".",".","."],
    [".",".",".",".",".",".",".","."],
    [".",".",".",".",".",".",".","."],
    ["P","P","P","P","P","P","P","P"],
    ["R","N","B","Q","K","B","N","R"]
  ];
}

function renderBoard(board) {
  const container = document.getElementById("chessboard");
  container.innerHTML = "";
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = document.createElement("div");
      sq.className = "square " + ((r + c) % 2 === 0 ? "light" : "dark");

      // highlight selected square
      if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
        sq.classList.add("selected");
      }

      // highlight moves
      if (highlightedMoves.some(m => m[0] === r && m[1] === c)) {
        if (board[r][c] === ".") {
          sq.classList.add("highlight-move");
        } else {
          sq.classList.add("highlight-capture");
        }
      }

      sq.onclick = () => handleClick(r, c);

      if (board[r][c] !== ".") {
        const img = document.createElement("img");
        img.src = pieceToImage(board[r][c]);
        img.className = "piece";
        sq.appendChild(img);
      }

      container.appendChild(sq);
    }
  }
}

function pieceToImage(piece) {
  const map = {
    "P": "images/pawn-w.svg",
    "R": "images/rook-w.svg",
    "N": "images/knight-w.svg",
    "B": "images/bishop-w.svg",
    "Q": "images/amazon-w.svg",
    "K": "images/king-w.svg",
    "p": "images/pawn-b.svg",
    "r": "images/rook-b.svg",
    "n": "images/knight-b.svg",
    "b": "images/bishop-b.svg",
    "q": "images/amazon-b.svg",
    "k": "images/king-b.svg"
  };
  return map[piece] || "";
}

function isWhite(piece) {
  return piece === piece.toUpperCase();
}

function movePiece(board, r1, c1, r2, c2) {
  board[r2][c2] = board[r1][c1];
  board[r1][c1] = ".";
}

// ------------------------
// moves.js
// ------------------------
function getLegalMoves(board, r, c) {
  const piece = board[r][c];
  if (!piece || piece === ".") return [];
  const moves = [];
  const isW = isWhite(piece);

  function addMove(rr, cc) {
    if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) {
      if (board[rr][cc] === "." || isWhite(board[rr][cc]) !== isW) {
        moves.push([rr, cc]);
      }
    }
  }

  switch (piece.toLowerCase()) {
    case "p":
      const dir = isW ? -1 : 1;
      const startRow = isW ? 6 : 1;

      // 1-square move
      if (board[r+dir] && board[r+dir][c] === ".") {
        moves.push([r+dir, c]);
        // 2-square move
        if (r === startRow && board[r+2*dir][c] === ".") {
          moves.push([r+2*dir, c]);
        }
      }

      // captures
      [-1,1].forEach(dc => {
        if (board[r+dir] && board[r+dir][c+dc] && board[r+dir][c+dc] !== "." && isWhite(board[r+dir][c+dc]) !== isW) {
          moves.push([r+dir, c+dc]);
        }
      });
      break;

    case "r":
      moves.push(...slideMoves(board, r, c, [[1,0],[-1,0],[0,1],[0,-1]], isW));
      break;
    case "b":
      moves.push(...slideMoves(board, r, c, [[1,1],[1,-1],[-1,1],[-1,-1]], isW));
      break;
    case "q":
      moves.push(...slideMoves(board, r, c, [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]], isW));
      break;
    case "n":
      [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]].forEach(([dr,dc])=>{
        addMove(r+dr,c+dc);
      });
      break;
    case "k":
      [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc])=>{
        addMove(r+dr,c+dc);
      });
      break;
  }
  return moves;
}

function slideMoves(board, r, c, dirs, isW) {
  const res = [];
  for (const [dr, dc] of dirs) {
    let rr = r + dr, cc = c + dc;
    while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) {
      if (board[rr][cc] === ".") {
        res.push([rr,cc]);
      } else {
        if (isWhite(board[rr][cc]) !== isW) res.push([rr,cc]);
        break;
      }
      rr += dr;
      cc += dc;
    }
  }
  return res;
}

// ------------------------
// ai.js
// ------------------------
function evaluate(board) {
  const values = { p: -1, n: -3, b: -3, r: -5, q: -9, k: -1000,
                   P: 1, N: 3, B: 3, R: 5, Q: 9, K: 1000 };
  let score = 0;
  for (let r=0; r<8; r++) {
    for (let c=0; c<8; c++) {
      if (board[r][c] !== ".") score += values[board[r][c]] || 0;
    }
  }
  return score;
}

function cloneBoard(board) {
  return board.map(row => row.slice());
}

function findAllMoves(board, isWhiteTurn) {
  const moves = [];
  for (let r=0; r<8; r++) {
    for (let c=0; c<8; c++) {
      if (board[r][c] !== "." && isWhite(board[r][c]) === isWhiteTurn) {
        const legal = getLegalMoves(board, r, c);
        legal.forEach(([rr,cc]) => {
          moves.push({from:[r,c], to:[rr,cc]});
        });
      }
    }
  }
  return moves;
}

function minimax(board, depth, alpha, beta, maximizing) {
  if (depth === 0) return { score: evaluate(board) };

  const moves = findAllMoves(board, maximizing);
  if (moves.length === 0) return { score: evaluate(board) };

  let bestMove = null;

  if (maximizing) {
    let maxEval = -Infinity;
    for (const m of moves) {
      const b2 = cloneBoard(board);
      movePiece(b2, m.from[0], m.from[1], m.to[0], m.to[1]);
      const evalObj = minimax(b2, depth-1, alpha, beta, false);
      if (evalObj.score > maxEval) {
        maxEval = evalObj.score;
        bestMove = m;
      }
      alpha = Math.max(alpha, evalObj.score);
      if (beta <= alpha) break;
    }
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    for (const m of moves) {
      const b2 = cloneBoard(board);
      movePiece(b2, m.from[0], m.from[1], m.to[0], m.to[1]);
      const evalObj = minimax(b2, depth-1, alpha, beta, true);
      if (evalObj.score < minEval) {
        minEval = evalObj.score;
        bestMove = m;
      }
      beta = Math.min(beta, evalObj.score);
      if (beta <= alpha) break;
    }
    return { score: minEval, move: bestMove };
  }
}

function findBestMove(board, depth) {
  return minimax(board, depth, -Infinity, Infinity, false).move;
}
