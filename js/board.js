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
