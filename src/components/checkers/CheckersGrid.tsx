import React, { useMemo } from "react";
import { Board, Move, Position } from "../../game/checkersTypes";
import { positionsEqual } from "../../game/checkersLogic";

// Eine mögliche Darstellung eines Brettfeldes.
type CheckersGridProps = {
  board: Board;
  files: string[];
  ranks: string[];
  cellSize: number;
  selected: Position | null;
  availableMoves: Move[];
  forcedCapturePositions: Position[];
  showHints: boolean;
  isHumansTurn: boolean;
  onCellClick: (row: number, col: number) => void;
};

// Diese Komponente fokussiert sich ausschließlich auf das Rendern des Bretts.
// Die dazugehörige Geschäftslogik verbleibt im Eltern-Container.
export function CheckersGrid({
  board,
  files,
  ranks,
  cellSize,
  selected,
  availableMoves,
  forcedCapturePositions,
  showHints,
  isHumansTurn,
  onCellClick,
}: CheckersGridProps) {
  // Wir berechnen die möglichen Ziele nur einmal pro Render und speichern sie,
  // um nicht in jeder Zelle erneut über das Array zu iterieren.
  const moveTargets = useMemo(() => availableMoves.map((move) => move.to), [availableMoves]);

  return (
    <>
      <div className="flex items-start gap-2">
        <div className="mt-[2px] flex flex-col-reverse select-none pr-1" style={{ height: ranks.length * cellSize }}>
          {ranks.map((rank) => (
            <div key={rank} className="flex items-center justify-end text-xs text-neutral-600" style={{ height: cellSize }}>
              {rank}
            </div>
          ))}
        </div>

        <div
          role="grid"
          aria-label={`Damebrett ${ranks.length} mal ${files.length}`}
          className="grid overflow-hidden rounded-2xl border border-neutral-300 shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
          style={{
            gridTemplateColumns: `repeat(${files.length}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${ranks.length}, ${cellSize}px)`,
          }}
        >
          {board.map((boardRow, r) =>
            boardRow.map((cellPiece, c) => {
              const isDark = (r + c) % 2 === 1;
              const position: Position = { row: r, col: c };
              const isSelected = selected ? positionsEqual(selected, position) : false;
              const isPotentialMoveTarget = moveTargets.some((target) => positionsEqual(target, position));
              const isMoveTarget = showHints && isPotentialMoveTarget;
              const isForcedPiece = showHints && forcedCapturePositions.some((pos) => positionsEqual(pos, position));
              const rankLabel = ranks[ranks.length - 1 - r];

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
                  aria-label={`Feld ${files[c]}${rankLabel}${pieceDescription}${moveDescription}`}
                  data-row={r}
                  data-col={c}
                  className={[
                    "relative flex items-center justify-center select-none transition-colors",
                    isDark ? "bg-emerald-700" : "bg-emerald-200",
                    isHumansTurn && ((cellPiece && cellPiece.owner === "human") || isPotentialMoveTarget)
                      ? "cursor-pointer"
                      : "",
                    isSelected ? "ring-4 ring-indigo-400 ring-offset-2 ring-offset-neutral-100" : "",
                    !isSelected && isForcedPiece ? "ring-2 ring-amber-500/70 ring-offset-2 ring-offset-neutral-100" : "",
                    isMoveTarget ? "ring-2 ring-amber-300 ring-offset-2 ring-offset-neutral-100" : "",
                  ].join(" ")}
                  style={{ width: cellSize, height: cellSize }}
                  onClick={() => onCellClick(r, c)}
                >
                  {cellPiece && (
                    <span
                      className={
                        "relative h-3/4 w-3/4 rounded-full border-[3px] border-neutral-900/40 shadow-[inset_0_2px_6px_rgba(255,255,255,0.35),0_2px_6px_rgba(0,0,0,0.35)] " +
                        (cellPiece.color === "dark" ? "bg-neutral-800" : "bg-amber-200")
                      }
                      aria-hidden="true"
                    >
                      {cellPiece.king && (
                        <span className="pointer-events-none absolute inset-[18%] rounded-full border-2 border-amber-400/90 shadow-[0_0_4px_rgba(0,0,0,0.25)]" />
                      )}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="grid select-none" style={{ gridTemplateColumns: `repeat(${files.length}, ${cellSize}px)` }}>
        {files.map((file) => (
          <div key={file} className="text-center text-xs text-neutral-600" style={{ width: cellSize }}>
            {file}
          </div>
        ))}
      </div>
    </>
  );
}
