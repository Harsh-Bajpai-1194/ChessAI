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

    // 2-square move from starting row
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
