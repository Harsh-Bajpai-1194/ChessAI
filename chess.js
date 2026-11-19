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
  if (!container) return;
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
  if (!piece || piece === ".") return false;
  return piece === piece.toUpperCase();
}

function movePiece(board, r1, c1, r2, c2) {
  board[r2][c2] = board[r1][c1];
  board[r1][c1] = ".";
}

// ------------------------
// King Safety & Check Detection
// ------------------------
function findKing(board, isWhiteKing) {
  const target = isWhiteKing ? "K" : "k";
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === target) {
        return [r, c];
      }
    }
  }
  return null;
}

function isSquareAttacked(board, r, c, byWhite) {
  // 1. Pawns:
  // If attacking player is White, pawns move up (row - 1), so they attack (r, c) from (r + 1, c ± 1).
  // If attacking player is Black, pawns move down (row + 1), so they attack (r, c) from (r - 1, c ± 1).
  const pawnDir = byWhite ? 1 : -1;
  const pawnChar = byWhite ? "P" : "p";
  const pr = r + pawnDir;
  if (pr >= 0 && pr < 8) {
    if (c - 1 >= 0 && board[pr][c - 1] === pawnChar) return true;
    if (c + 1 < 8 && board[pr][c + 1] === pawnChar) return true;
  }

  // 2. Knights
  const knightChar = byWhite ? "N" : "n";
  const knightOffsets = [
    [2, 1], [2, -1], [-2, 1], [-2, -1],
    [1, 2], [1, -2], [-1, 2], [-1, -2]
  ];
  for (const [dr, dc] of knightOffsets) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      if (board[nr][nc] === knightChar) return true;
    }
  }

  // 3. King (adjacent squares)
  const kingChar = byWhite ? "K" : "k";
  const kingOffsets = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ];
  for (const [dr, dc] of kingOffsets) {
    const kr = r + dr;
    const kc = c + dc;
    if (kr >= 0 && kr < 8 && kc >= 0 && kc < 8) {
      if (board[kr][kc] === kingChar) return true;
    }
  }

  // 4. Straight line sliders: Rooks & Queens
  const straightDirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const rookChar = byWhite ? "R" : "r";
  const queenChar = byWhite ? "Q" : "q";
  for (const [dr, dc] of straightDirs) {
    let rr = r + dr;
    let cc = c + dc;
    while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) {
      const piece = board[rr][cc];
      if (piece !== ".") {
        if (piece === rookChar || piece === queenChar) return true;
        break; // blocked by any piece
      }
      rr += dr;
      cc += dc;
    }
  }

  // 5. Diagonal sliders: Bishops & Queens
  const diagDirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  const bishopChar = byWhite ? "B" : "b";
  for (const [dr, dc] of diagDirs) {
    let rr = r + dr;
    let cc = c + dc;
    while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) {
      const piece = board[rr][cc];
      if (piece !== ".") {
        if (piece === bishopChar || piece === queenChar) return true;
        break; // blocked by any piece
      }
      rr += dr;
      cc += dc;
    }
  }

  return false;
}

function isKingInCheck(board, isWhiteKing) {
  const kingPos = findKing(board, isWhiteKing);
  if (!kingPos) return false;
  return isSquareAttacked(board, kingPos[0], kingPos[1], !isWhiteKing);
}

// ------------------------
// moves.js
// ------------------------
function getPseudoLegalMoves(board, r, c) {
  if (r < 0 || r >= 8 || c < 0 || c >= 8) return [];
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
      if (board[r + dir] && board[r + dir][c] === ".") {
        moves.push([r + dir, c]);
        // 2-square move
        if (r === startRow && board[r + 2 * dir] && board[r + 2 * dir][c] === ".") {
          moves.push([r + 2 * dir, c]);
        }
      }

      // captures
      [-1, 1].forEach(dc => {
        if (board[r + dir] && board[r + dir][c + dc] && board[r + dir][c + dc] !== "." && isWhite(board[r + dir][c + dc]) !== isW) {
          moves.push([r + dir, c + dc]);
        }
      });
      break;

    case "r":
      moves.push(...slideMoves(board, r, c, [[1, 0], [-1, 0], [0, 1], [0, -1]], isW));
      break;
    case "b":
      moves.push(...slideMoves(board, r, c, [[1, 1], [1, -1], [-1, 1], [-1, -1]], isW));
      break;
    case "q":
      moves.push(...slideMoves(board, r, c, [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]], isW));
      break;
    case "n":
      [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]].forEach(([dr, dc]) => {
        addMove(r + dr, c + dc);
      });
      break;
    case "k":
      [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
        addMove(r + dr, c + dc);
      });
      break;
  }
  return moves;
}

function getLegalMoves(board, r, c) {
  if (r < 0 || r >= 8 || c < 0 || c >= 8) return [];
  const piece = board[r][c];
  if (!piece || piece === ".") return [];
  const isW = isWhite(piece);
  const pseudoMoves = getPseudoLegalMoves(board, r, c);

  // Filter moves to ensure player's king is not left or placed in check
  return pseudoMoves.filter(([toR, toC]) => {
    const simBoard = cloneBoard(board);
    movePiece(simBoard, r, c, toR, toC);
    return !isKingInCheck(simBoard, isW);
  });
}

function slideMoves(board, r, c, dirs, isW) {
  const res = [];
  for (const [dr, dc] of dirs) {
    let rr = r + dr, cc = c + dc;
    while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) {
      if (board[rr][cc] === ".") {
        res.push([rr, cc]);
      } else {
        if (isWhite(board[rr][cc]) !== isW) res.push([rr, cc]);
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
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
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
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] !== "." && isWhite(board[r][c]) === isWhiteTurn) {
        const legal = getLegalMoves(board, r, c);
        legal.forEach(([rr, cc]) => {
          moves.push({ from: [r, c], to: [rr, cc] });
        });
      }
    }
  }
  return moves;
}

function minimax(board, depth, alpha, beta, maximizing) {
  if (depth === 0) return { score: evaluate(board) };

  const moves = findAllMoves(board, maximizing);
  if (moves.length === 0) {
    if (isKingInCheck(board, maximizing)) {
      return { score: maximizing ? -99999 : 99999 };
    }
    return { score: 0 }; // stalemate
  }

  let bestMove = null;

  if (maximizing) {
    let maxEval = -Infinity;
    for (const m of moves) {
      const b2 = cloneBoard(board);
      movePiece(b2, m.from[0], m.from[1], m.to[0], m.to[1]);
      const evalObj = minimax(b2, depth - 1, alpha, beta, false);
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
      const evalObj = minimax(b2, depth - 1, alpha, beta, true);
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

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initialBoard,
    renderBoard,
    pieceToImage,
    isWhite,
    movePiece,
    findKing,
    isSquareAttacked,
    isKingInCheck,
    getPseudoLegalMoves,
    getLegalMoves,
    slideMoves,
    evaluate,
    cloneBoard,
    findAllMoves,
    minimax,
    findBestMove
  };
}
