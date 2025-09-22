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
      sq.onclick = () => handleClick(r, c);
      if (board[r][c] !== ".") {
        sq.textContent = pieceToChar(board[r][c]);
      }
      container.appendChild(sq);
    }
  }
}

function pieceToChar(piece) {
  const map = {
    "P": "♙", "R": "♖", "N": "♘", "B": "♗", "Q": "♕", "K": "♔",
    "p": "♟️", "r": "♜", "n": "♞", "b": "♝", "q": "♛", "k": "♚"
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
