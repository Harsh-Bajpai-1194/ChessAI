const assert = require("node:assert");
const test = require("node:test");
const {
  initialBoard,
  isWhite,
  movePiece,
  findKing,
  isSquareAttacked,
  isKingInCheck,
  getPseudoLegalMoves,
  getLegalMoves,
  findAllMoves,
  minimax,
  findBestMove
} = require("./chess.js");

function createEmptyBoard() {
  return Array.from({ length: 8 }, () => Array(8).fill("."));
}

test("initial board move counts and king safety", () => {
  const board = initialBoard();

  // White King & Black King positions
  assert.deepStrictEqual(findKing(board, true), [7, 4]);
  assert.deepStrictEqual(findKing(board, false), [0, 4]);

  // Neither King is in check
  assert.strictEqual(isKingInCheck(board, true), false);
  assert.strictEqual(isKingInCheck(board, false), false);

  // Initial legal moves count: 16 pawn moves (8 single, 8 double) + 4 knight moves = 20
  const whiteMoves = findAllMoves(board, true);
  assert.strictEqual(whiteMoves.length, 20);

  const blackMoves = findAllMoves(board, false);
  assert.strictEqual(blackMoves.length, 20);
});

test("isSquareAttacked checks pawn, knight, king, and sliding pieces correctly", () => {
  const board = createEmptyBoard();

  // White pawn on e2 (6, 4) attacks d3 (5, 3) and f3 (5, 5)
  board[6][4] = "P";
  assert.strictEqual(isSquareAttacked(board, 5, 3, true), true);
  assert.strictEqual(isSquareAttacked(board, 5, 5, true), true);
  assert.strictEqual(isSquareAttacked(board, 5, 4, true), false);

  // Board boundary pawn attacks (a2 pawn at 6, 0 attacks b3 at 5, 1)
  board[6][0] = "P";
  assert.strictEqual(isSquareAttacked(board, 5, 1, true), true);
  // h2 pawn at 6, 7 attacks g3 at 5, 6
  board[6][7] = "P";
  assert.strictEqual(isSquareAttacked(board, 5, 6, true), true);

  // Black pawn on e7 (1, 4) attacks d6 (2, 3) and f6 (2, 5)
  board[1][4] = "p";
  assert.strictEqual(isSquareAttacked(board, 2, 3, false), true);
  assert.strictEqual(isSquareAttacked(board, 2, 5, false), true);
  assert.strictEqual(isSquareAttacked(board, 2, 4, false), false);

  // Knight attacks
  board[4][4] = "N"; // White knight at e4 (4, 4)
  assert.strictEqual(isSquareAttacked(board, 2, 3, true), true); // c6
  assert.strictEqual(isSquareAttacked(board, 3, 4, true), false);

  // Rooks raycasting and obstruction
  board[7][0] = "R"; // a1
  assert.strictEqual(isSquareAttacked(board, 7, 5, true), true);
  board[7][3] = "p"; // black pawn blocks file 7
  assert.strictEqual(isSquareAttacked(board, 7, 5, true), false);
  assert.strictEqual(isSquareAttacked(board, 7, 3, true), true); // blocked piece itself is attacked
});

test("King cannot move into check", () => {
  const board = createEmptyBoard();
  board[4][4] = "K"; // White King on e4
  board[0][3] = "r"; // Black Rook on d8 (attacks entire column 3 / d-file)
  board[0][7] = "k"; // Black King in corner

  const kingMoves = getLegalMoves(board, 4, 4);
  // King pseudo moves would include [3,3], [4,3], [5,3] (d-file)
  const attacksDFile = kingMoves.some(([r, c]) => c === 3);
  assert.strictEqual(attacksDFile, false, "King should not be allowed to step onto d-file attacked by rook");

  // King should still have legal moves to other adjacent safe squares
  assert.ok(kingMoves.some(([r, c]) => r === 4 && c === 5)); // e4 to f4
});

test("King cannot step adjacent to enemy King", () => {
  const board = createEmptyBoard();
  board[4][4] = "K"; // White King
  board[4][6] = "k"; // Black King

  const whiteMoves = getLegalMoves(board, 4, 4);
  // Square (4, 5) is adjacent to Black King at (4, 6)
  const stepsAdjacent = whiteMoves.some(([r, c]) => r === 4 && c === 5);
  assert.strictEqual(stepsAdjacent, false, "White King cannot step adjacent to Black King");
});

test("King cannot capture a defended piece", () => {
  const board = createEmptyBoard();
  board[7][4] = "K"; // White King at e1
  board[6][4] = "r"; // Black Rook at e2 (attacks King, undefended would be capturable)
  board[1][4] = "q"; // Black Queen at e7 (defends Rook at e2)
  board[0][0] = "k"; // Black King

  const kingMoves = getLegalMoves(board, 7, 4);
  const capturesRook = kingMoves.some(([r, c]) => r === 6 && c === 4);
  assert.strictEqual(capturesRook, false, "King cannot capture defended piece");

  // Remove the defending queen
  board[1][4] = ".";
  const kingMovesUndefended = getLegalMoves(board, 7, 4);
  const capturesUndefendedRook = kingMovesUndefended.some(([r, c]) => r === 6 && c === 4);
  assert.strictEqual(capturesUndefendedRook, true, "King can capture undefended piece");
});

test("Pinned piece cannot move off pin line", () => {
  const board = createEmptyBoard();
  board[7][4] = "K"; // White King at e1
  board[5][4] = "B"; // White Bishop at e3 (pinned by black rook on e8)
  board[1][4] = "r"; // Black Rook at e7
  board[0][0] = "k"; // Black King

  // Bishop can only move diagonally, which would leave e-file open -> King exposed!
  const bishopMoves = getLegalMoves(board, 5, 4);
  assert.strictEqual(bishopMoves.length, 0, "Pinned bishop should have zero legal moves");

  // Now test pinned rook along same file
  board[5][4] = "R"; // White Rook at e3
  const rookMoves = getLegalMoves(board, 5, 4);
  // White Rook can move along e-file (including capturing black rook at e7), but cannot leave e-file
  assert.ok(rookMoves.length > 0);
  assert.ok(rookMoves.every(([r, c]) => c === 4), "Pinned rook can only move along pin file");
  assert.ok(rookMoves.some(([r, c]) => r === 1 && c === 4), "Pinned rook can capture pinning piece");
});

test("When in check, player can only make moves that resolve check", () => {
  const board = createEmptyBoard();
  board[7][4] = "K"; // White King at e1 (7, 4)
  board[2][4] = "r"; // Black Rook at e6 (2, 4) - gives check!
  board[7][0] = "R"; // White Rook at a1 (7, 0)
  board[7][1] = "N"; // White Knight at b1 (7, 1)
  board[0][0] = "k"; // Black King

  assert.strictEqual(isKingInCheck(board, true), true);

  // 1. White Knight at b1 cannot make arbitrary moves (e.g., to a3 or c3)
  const knightMoves = getLegalMoves(board, 7, 1);
  assert.strictEqual(knightMoves.length, 0, "Knight cannot make move that ignores check");

  // 2. White Rook at a1 cannot move without resolving check
  const a1RookMoves = getLegalMoves(board, 7, 0);
  assert.strictEqual(a1RookMoves.length, 0);

  // 3. Put a bishop on c3 (5, 2) that CAN block at e5 (3, 4)
  board[5][2] = "B"; // Bishop at c3 can move to (3, 4) [e5]
  const bishopMoves = getLegalMoves(board, 5, 2);
  assert.deepStrictEqual(bishopMoves, [[3, 4]], "Bishop can only interpose to block check");

  // 4. King has legal moves to escape the check
  const kingMoves = getLegalMoves(board, 7, 4);
  assert.ok(kingMoves.length > 0, "King should have escape moves");
  assert.ok(kingMoves.every(([r, c]) => c !== 4), "King escape moves must leave the checking file");
});

test("Double check forces King to move", () => {
  const board = createEmptyBoard();
  board[7][4] = "K"; // White King at e1 (7, 4)
  board[2][4] = "r"; // Black Rook at e6 giving check along file 4
  board[5][3] = "n"; // Black Knight at d3 giving check from (5, 3)
  board[7][0] = "R"; // White Rook at a1
  board[6][2] = "B"; // White Bishop at c2 (can reach d3 to capture knight, but rook check still stands)
  board[0][0] = "k";

  assert.strictEqual(isKingInCheck(board, true), true);

  // Bishop capturing knight at (5, 3) still leaves King in check from rook
  const bishopMoves = getLegalMoves(board, 6, 2);
  assert.strictEqual(bishopMoves.length, 0, "Interposing or single capture does not resolve double check");

  // Only king moves can resolve double check
  const kingMoves = getLegalMoves(board, 7, 4);
  assert.ok(kingMoves.length > 0, "King can move to unattacked escape squares");
  for (const [kr, kc] of kingMoves) {
    const simBoard = board.map(row => row.slice());
    movePiece(simBoard, 7, 4, kr, kc);
    assert.strictEqual(isKingInCheck(simBoard, true), false, "All king moves must be safe");
  }
});

test("AI move generation uses only legal moves", () => {
  const board = createEmptyBoard();
  board[7][4] = "K"; // White King
  board[0][4] = "k"; // Black King
  board[1][4] = "Q"; // White Queen checks Black King on e7 (1, 4)

  assert.strictEqual(isKingInCheck(board, false), true);

  const blackMoves = findAllMoves(board, false);
  // All moves generated for Black must leave Black King not in check
  for (const m of blackMoves) {
    const simBoard = board.map(row => row.slice());
    movePiece(simBoard, m.from[0], m.from[1], m.to[0], m.to[1]);
    assert.strictEqual(isKingInCheck(simBoard, false), false, "AI move must be legal and resolve check");
  }

  // Minimax returns a legal move
  const bestMove = findBestMove(board, 2);
  assert.ok(bestMove !== null);
  const sim = board.map(row => row.slice());
  movePiece(sim, bestMove.from[0], bestMove.from[1], bestMove.to[0], bestMove.to[1]);
  assert.strictEqual(isKingInCheck(sim, false), false);
});
