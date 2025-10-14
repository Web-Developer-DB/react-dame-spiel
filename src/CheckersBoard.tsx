import React, { useMemo, useState } from "react";

type Props = { cell?: number };

type PieceColor = "dark" | "light";
type Player = "human" | "ai";
type Piece = { color: PieceColor; king: boolean; owner: Player };
type Cell = Piece | null;
type Board = Cell[][];
type Position = { row: number; col: number };
type Move = { to: Position; captures: Position[] };

const BOARD_SIZE = 8;

export default function CheckersBoard({ cell = 72 }: Props) {
  const rows = BOARD_SIZE;
  const cols = BOARD_SIZE;
  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
    gridTemplateRows: `repeat(${rows}, ${cell}px)`,
  };
  const files = Array.from({ length: cols }, (_, i) => String.fromCharCode(65 + i));
  const ranks = Array.from({ length: rows }, (_, i) => `${rows - i}`);
  const [board, setBoard] = useState<Board>(() => createInitialBoard(rows, cols));
  const [currentPlayer, setCurrentPlayer] = useState<Player>("human");
  const [selected, setSelected] = useState<Position | null>(null);
  const [availableMoves, setAvailableMoves] = useState<Move[]>([]);
  const [multiCaptureActive, setMultiCaptureActive] = useState(false);

  const forcedCapturePositions = useMemo(
    () => findForcedCapturePositions(board, currentPlayer),
    [board, currentPlayer]
  );
  const hasForcedCaptures = forcedCapturePositions.length > 0;

  const handleCellClick = (row: number, col: number) => {
    const targetPosition: Position = { row, col };

    if (
      multiCaptureActive &&
      selected &&
      !availableMoves.some((move) => positionsEqual(move.to, targetPosition))
    ) {
      // während einer Mehrfachschlag-Sequenz nur erlaubte Ziele anklicken
      return;
    }

    const cellPiece = board[row][col];

    if (cellPiece && cellPiece.owner === currentPlayer) {
      if (selected && positionsEqual(selected, targetPosition)) {
        if (!multiCaptureActive) {
          setSelected(null);
          setAvailableMoves([]);
        }
        return;
      }

      const moves = getMoves(board, row, col, cellPiece);
      const captureMoves = moves.filter((move) => move.captures.length > 0);
      const allowedMoves = hasForcedCaptures ? captureMoves : moves;

      if (allowedMoves.length === 0) {
        return;
      }

      setSelected(targetPosition);
      setAvailableMoves(allowedMoves);
      setMultiCaptureActive(false);
      return;
    }

    if (selected) {
      const chosenMove = availableMoves.find((move) => positionsEqual(move.to, targetPosition));
      if (!chosenMove) {
        return;
      }

      setBoard((prev) => {
        const next = cloneBoard(prev);
        const fromPiece = next[selected.row][selected.col];
        if (!fromPiece) {
          return prev;
        }

        next[selected.row][selected.col] = null;
        const movedPiece: Piece = { ...fromPiece };

        if (!movedPiece.king) {
          const reachesEnd =
            (movedPiece.color === "dark" && chosenMove.to.row === rows - 1) ||
            (movedPiece.color === "light" && chosenMove.to.row === 0);
          if (reachesEnd) {
            movedPiece.king = true;
          }
        }

        next[chosenMove.to.row][chosenMove.to.col] = movedPiece;
        chosenMove.captures.forEach((capture) => {
          next[capture.row][capture.col] = null;
        });

        const captureContinuation =
          chosenMove.captures.length > 0
            ? getMoves(next, chosenMove.to.row, chosenMove.to.col, movedPiece).filter(
                (move) => move.captures.length > 0
              )
            : [];

        if (chosenMove.captures.length > 0 && captureContinuation.length > 0) {
          setSelected({ row: chosenMove.to.row, col: chosenMove.to.col });
          setAvailableMoves(captureContinuation);
          setMultiCaptureActive(true);
          return next;
        }

        setSelected(null);
        setAvailableMoves([]);
        setMultiCaptureActive(false);
        setCurrentPlayer((prevPlayer) => (prevPlayer === "human" ? "ai" : "human"));
        return next;
      });
    }
  };

  const currentPlayerLabel = currentPlayer === "human" ? "Mensch (hell)" : "KI (schwarz)";
  const statusSuffix = hasForcedCaptures ? " – Schlagzwang" : "";

  return (
    <div className="w-full flex flex-col items-center gap-4 p-6">
      <h1 className="text-xl font-semibold">Dame – Spielbrett</h1>

      <div className="flex items-start gap-2">
        <div className="flex flex-col-reverse select-none pr-1 mt-[2px]" style={{ height: rows * cell }}>
          {ranks.map((r) => (
            <div key={r} className="h-[--cell] flex items-center justify-end text-xs text-neutral-600" style={{ height: cell }}>{r}</div>
          ))}
        </div>

        <div
          role="grid"
          aria-label="Damebrett 8 mal 8"
          className="grid rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-neutral-300"
          style={gridStyle}
        >
          {board.map((boardRow, r) =>
            boardRow.map((cellPiece, c) => {
              const isDark = (r + c) % 2 === 1;
              const position: Position = { row: r, col: c };
              const isSelected = selected ? positionsEqual(selected, position) : false;
              const isMoveTarget = availableMoves.some((move) => positionsEqual(move.to, position));
              const isForcedPiece = forcedCapturePositions.some((pos) => positionsEqual(pos, position));

              const pieceDescription =
                cellPiece?.color === "dark"
                  ? cellPiece.king
                    ? " mit schwarzer Dame der KI"
                    : " mit schwarzem KI-Spielstein"
                  : cellPiece?.color === "light"
                    ? cellPiece.king
                      ? " mit heller Dame des Menschen"
                      : " mit hellem Spielstein des Menschen"
                    : "";
              const moveDescription = isMoveTarget ? " – mögliches Ziel" : "";
              const key = `${r}-${c}`;
              return (
                <div
                  key={key}
                  role="gridcell"
                  aria-label={`Feld ${files[c]}${rows - r}${pieceDescription}${moveDescription}`}
                  data-row={r}
                  data-col={c}
                  className={[
                    "relative flex items-center justify-center select-none transition-colors",
                    isDark ? "bg-emerald-700" : "bg-emerald-200",
                    (cellPiece && cellPiece.owner === currentPlayer) || isMoveTarget ? "cursor-pointer" : "",
                    isSelected ? "ring-4 ring-indigo-400 ring-offset-2 ring-offset-neutral-100" : "",
                    !isSelected && isForcedPiece ? "ring-2 ring-amber-500/70 ring-offset-2 ring-offset-neutral-100" : "",
                    isMoveTarget ? "ring-2 ring-amber-300 ring-offset-2 ring-offset-neutral-100" : "",
                  ].join(" ")}
                  style={{ width: cell, height: cell }}
                  onClick={() => handleCellClick(r, c)}
                >
                  {cellPiece && (
                    <span
                      className={
                        "relative w-3/4 h-3/4 rounded-full border-[3px] border-neutral-900/40 shadow-[inset_0_2px_6px_rgba(255,255,255,0.35),0_2px_6px_rgba(0,0,0,0.35)] " +
                        (cellPiece.color === "dark" ? "bg-neutral-800" : "bg-amber-200")
                      }
                      aria-hidden="true"
                    >
                      {cellPiece.king && (
                        <span className="absolute inset-[18%] rounded-full border-2 border-amber-400/90 shadow-[0_0_4px_rgba(0,0,0,0.25)] pointer-events-none" />
                      )}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="grid select-none" style={{ gridTemplateColumns: `repeat(${cols}, ${cell}px)` }}>
        {files.map((f) => (
          <div key={f} className="text-center text-xs text-neutral-600" style={{ width: cell }}>{f}</div>
        ))}
      </div>

      <div className="text-sm text-neutral-600">Tipp: Passe die Zellgröße über Prop <code>cell</code> an.</div>

      <div className="text-sm text-neutral-700">
        Am Zug: <span className="font-medium">{currentPlayerLabel}</span>
        {statusSuffix}
        {multiCaptureActive ? " – Mehrfachschlag fortsetzen" : ""}
      </div>
    </div>
  );
}

function createInitialBoard(rows: number, cols: number): Board {
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

function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

function getMoves(board: Board, row: number, col: number, piece: Piece): Move[] {
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
      moves.push({ to: { row: jumpRow, col: jumpCol }, captures: [{ row: nextRow, col: nextCol }] });
    }
  }
  return moves;
}

function findForcedCapturePositions(board: Board, player: Player): Position[] {
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

function isWithinBoard(board: Board, row: number, col: number): boolean {
  return row >= 0 && row < board.length && col >= 0 && col < board[0].length;
}

function positionsEqual(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}
