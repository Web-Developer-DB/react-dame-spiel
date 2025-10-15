import { Board, CandidateMove, GameEvaluation, Move, Piece, Player, Position } from "./checkersTypes";

// Konstante Brettgröße. 8x8 ist der Standard für Dame,
// wir lassen sie aber exportiert, falls später Varianten angelegt werden sollen.
export const BOARD_SIZE = 8;

// Erstellt das Brett zum Spielbeginn. Nur dunkle Felder erhalten Steine.
export function createInitialBoard(rows = BOARD_SIZE, cols = BOARD_SIZE): Board {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const isDark = (r + c) % 2 === 1;
      if (!isDark) return null;
      if (r < 3) return { color: "dark", king: false, owner: "ai" };
      if (r >= rows - 3) return { color: "light", king: false, owner: "human" };
      return null;
    })
  );
}

// Das Board ist komplex (2D Matrix). React erkennt Änderungen nur,
// wenn wir neue Referenzen erzeugen. cloneBoard erledigt das zentral.
export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

// Liefert alle legalen Ziele für einen Stein.
// Es werden einfache Züge und Sprünge (mit capture) berechnet.
export function getMoves(board: Board, row: number, col: number, piece: Piece): Move[] {
  const moves: Move[] = [];
  const verticalDirections = piece.king ? [1, -1] : [piece.color === "dark" ? 1 : -1];
  const horizontalSteps = [-1, 1];

  for (const vDirection of verticalDirections) {
    for (const hStep of horizontalSteps) {
      const nextRow = row + vDirection;
      const nextCol = col + hStep;
      if (!isWithinBoard(board, nextRow, nextCol)) continue;

      const directTarget = board[nextRow][nextCol];
      if (!directTarget) {
        moves.push({ to: { row: nextRow, col: nextCol }, captures: [] });
        continue;
      }
      if (directTarget.color === piece.color) continue;

      const jumpRow = nextRow + vDirection;
      const jumpCol = nextCol + hStep;
      if (!isWithinBoard(board, jumpRow, jumpCol)) continue;
      if (board[jumpRow][jumpCol]) continue;

      moves.push({
        to: { row: jumpRow, col: jumpCol },
        captures: [{ row: nextRow, col: nextCol }],
      });
    }
  }

  return moves;
}

// Schlagzwang: Wenn ein eigener Stein schlagen kann, muss er es tun.
export function findForcedCapturePositions(board: Board, player: Player): Position[] {
  const forced: Position[] = [];
  board.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell?.owner !== player) return;
      const moves = getMoves(board, r, c, cell);
      if (moves.some((move) => move.captures.length > 0)) {
        forced.push({ row: r, col: c });
      }
    });
  });
  return forced;
}

// Hilfsfunktion, um alle möglichen Züge eines Spielers zu sammeln.
export function collectMovesForPlayer(board: Board, player: Player): CandidateMove[] {
  const moves: CandidateMove[] = [];
  board.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell?.owner !== player) {
        return;
      }
      const pieceMoves = getMoves(board, r, c, cell);
      pieceMoves.forEach((move) => {
        moves.push({ from: { row: r, col: c }, move });
      });
    });
  });
  const captureMoves = moves.filter((candidate) => candidate.move.captures.length > 0);
  return captureMoves.length > 0 ? captureMoves : moves;
}

// Die KI bevorzugt Züge mit der höchsten Schlaganzahl und entscheidet erst danach zufällig.
export function chooseMoveByPriority(candidates: CandidateMove[]): CandidateMove | null {
  if (candidates.length === 0) {
    return null;
  }
  const maxCaptures = candidates.reduce(
    (max, candidate) => Math.max(max, candidate.move.captures.length),
    0
  );
  const bestCandidates = candidates.filter(
    (candidate) => candidate.move.captures.length === maxCaptures
  );
  return bestCandidates[Math.floor(Math.random() * bestCandidates.length)];
}

// Für Mehrfachschläge gelten dieselben Prioritätsregeln wie beim ersten Zug.
export function chooseContinuationMove(moves: Move[]): Move {
  if (moves.length === 0) {
    throw new Error("No moves available for continuation");
  }
  const maxCaptures = moves.reduce((max, move) => Math.max(max, move.captures.length), 0);
  const best = moves.filter((move) => move.captures.length === maxCaptures);
  return best[Math.floor(Math.random() * best.length)];
}

// Überträgt einen Zug auf ein neues Board und berechnet Folgezüge für Mehrfachschläge.
export function applyMove(
  prevBoard: Board,
  from: Position,
  move: Move,
  rows: number
): { board: Board; movedPiece: Piece | null; to: Position; continuation: Move[] } {
  const next = cloneBoard(prevBoard);
  const fromPiece = next[from.row]?.[from.col];
  if (!fromPiece) {
    return { board: prevBoard, movedPiece: null, to: from, continuation: [] };
  }

  next[from.row][from.col] = null;
  const movedPiece: Piece = { ...fromPiece };

  if (!movedPiece.king) {
    const reachesEnd =
      (movedPiece.color === "dark" && move.to.row === rows - 1) ||
      (movedPiece.color === "light" && move.to.row === 0);
    if (reachesEnd) {
      movedPiece.king = true;
    }
  }

  next[move.to.row][move.to.col] = movedPiece;
  move.captures.forEach((capture) => {
    next[capture.row][capture.col] = null;
  });

  const continuation =
    move.captures.length > 0
      ? getMoves(next, move.to.row, move.to.col, movedPiece).filter(
          (followUp) => followUp.captures.length > 0
        )
      : [];

  return { board: next, movedPiece, to: move.to, continuation };
}

// Prüft, ob eine Partei verloren hat (keine Steine oder keine Züge).
export function evaluateGameState(board: Board, playerToMove: Player): GameEvaluation | null {
  const opponent = playerToMove === "human" ? "ai" : "human";
  const remainingPieces = countPieces(board, playerToMove);
  if (remainingPieces === 0) {
    return {
      winner: opponent,
      message: `Sieg für ${getPlayerLabel(opponent)} – ${getPlayerLabel(playerToMove)} hat keine Steine mehr.`,
    };
  }

  const availableMoves = collectMovesForPlayer(board, playerToMove);
  if (availableMoves.length === 0) {
    return {
      winner: opponent,
      message: `Sieg für ${getPlayerLabel(opponent)} – ${getPlayerLabel(playerToMove)} hat keine Züge mehr.`,
    };
  }

  return null;
}

export function positionsEqual(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

export function getPlayerLabel(player: Player): string {
  return player === "human" ? "den Menschen" : "die KI";
}

function isWithinBoard(board: Board, row: number, col: number): boolean {
  return row >= 0 && row < board.length && col >= 0 && col < board[0].length;
}

function countPieces(board: Board, player: Player): number {
  let count = 0;
  board.forEach((row) => {
    row.forEach((cell) => {
      if (cell?.owner === player) {
        count += 1;
      }
    });
  });
  return count;
}
