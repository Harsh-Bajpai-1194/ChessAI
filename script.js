let board = initialBoard();
renderBoard(board);

let selected = null;
let isWhiteTurn = true;

function handleClick(row, col) {
  if (!selected) {
    if (board[row][col] && isWhite(board[row][col]) === isWhiteTurn) {
      selected = { row, col };
      highlightedMoves = getLegalMoves(board, row, col);
    }
  } else {
    const moves = getLegalMoves(board, selected.row, selected.col);
    const found = moves.find(m => m[0] === row && m[1] === col);
    if (found) {
      movePiece(board, selected.row, selected.col, row, col);
      isWhiteTurn = !isWhiteTurn;
      selected = null;
      highlightedMoves = [];
      renderBoard(board);

      if (!isWhiteTurn) {
        setTimeout(() => {
          const aiMove = findBestMove(board, 3); // depth 3 minimax
          if (aiMove) {
            movePiece(board, aiMove.from[0], aiMove.from[1], aiMove.to[0], aiMove.to[1]);
            isWhiteTurn = !isWhiteTurn;
            renderBoard(board);
          }
        }, 300);
      }
      return;
    }
    // if clicked invalid square → reset selection
    selected = null;
    highlightedMoves = [];
  }
  renderBoard(board);
}