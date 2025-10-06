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
