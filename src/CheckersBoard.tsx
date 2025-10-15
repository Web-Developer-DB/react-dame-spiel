import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameMenu } from "./components/checkers/GameMenu";
import { CheckersGrid } from "./components/checkers/CheckersGrid";
import { StatusBanner } from "./components/checkers/StatusBanner";
import {
  applyMove,
  chooseContinuationMove,
  chooseMoveByPriority,
  collectMovesForPlayer,
  createInitialBoard,
  evaluateGameState,
  findForcedCapturePositions,
  getPlayerLabel,
  getMoves,
  positionsEqual,
  BOARD_SIZE,
} from "./game/checkersLogic";
import { Board, Move, Player, Position } from "./game/checkersTypes";

// Die CheckersBoard-Komponente verwaltet den gesamten Spielfluss.
// Sie orchestriert State, KI-Züge und Darstellung, delegiert aber Render-Details
// an kleinere Komponenten (GameMenu, CheckersGrid, StatusBanner).
export default function CheckersBoard() {
  const rows = BOARD_SIZE;
  const cols = BOARD_SIZE;

  // Layout-bezogene Daten wie Feldbeschriftungen lassen sich aus der Brettgröße ableiten.
  const files = useMemo(() => Array.from({ length: cols }, (_, i) => String.fromCharCode(65 + i)), [cols]);
  const ranks = useMemo(() => Array.from({ length: rows }, (_, i) => `${rows - i}`), [rows]);

  // Zustand des Spiels
  const [cellSize, setCellSize] = useState(72);
  const [board, setBoard] = useState<Board>(() => createInitialBoard(rows, cols));
  const [currentPlayer, setCurrentPlayer] = useState<Player>("human");
  const [selected, setSelected] = useState<Position | null>(null);
  const [availableMoves, setAvailableMoves] = useState<Move[]>([]);
  const [multiCaptureActive, setMultiCaptureActive] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [outcomeMessage, setOutcomeMessage] = useState<string | null>(null);
  const [showOutcomeDialog, setShowOutcomeDialog] = useState(false);

  const boardContainerRef = useRef<HTMLDivElement | null>(null);

  const updateCellSize = useCallback(() => {
    const containerWidth = boardContainerRef.current?.clientWidth ?? window.innerWidth;
    if (!containerWidth) {
      return;
    }

    const gapBetweenLabelsAndBoard = 8; // entspricht Tailwind gap-2
    const effectiveWidth = Math.max(containerWidth - gapBetweenLabelsAndBoard, 0);
    const maxAllowedCellSize = Math.floor(effectiveWidth / (cols + 1));
    if (maxAllowedCellSize <= 0) {
      return;
    }

    const minCellSize = 48;
    const maxCellSize = 96;
    const preferredSize = Math.min(maxAllowedCellSize, maxCellSize);
    const nextSize = Math.min(maxAllowedCellSize, Math.max(preferredSize, minCellSize));

    setCellSize((prev) => (prev !== nextSize ? nextSize : prev));
  }, [cols]);

  useEffect(() => {
    updateCellSize();
  }, [updateCellSize]);

  useEffect(() => {
    const handleResize = () => updateCellSize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateCellSize]);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => updateCellSize());
    const element = boardContainerRef.current;
    if (!element) {
      return;
    }

    observer.observe(element);
    return () => observer.disconnect();
  }, [updateCellSize]);

  useEffect(() => {
    if (gameOver) {
      setShowOutcomeDialog(true);
    }
  }, [gameOver]);

  // Schlagzwang und mögliche Züge werden aus dem aktuellen Brett abgeleitet.
  const forcedCapturePositions = useMemo(
    () => findForcedCapturePositions(board, currentPlayer),
    [board, currentPlayer]
  );
  const hasForcedCaptures = forcedCapturePositions.length > 0;
  const shouldHighlightHints = showHints && !gameOver;
  const isHumansTurn = currentPlayer === "human" && !gameOver;

  // Stellt den Ausgangszustand wieder her, damit mehrere Partien nacheinander möglich sind.
  const handleNewGame = () => {
    setBoard(createInitialBoard(rows, cols));
    setCurrentPlayer("human");
    setSelected(null);
    setAvailableMoves([]);
    setMultiCaptureActive(false);
    setGameOver(false);
    setOutcomeMessage(null);
    setShowOutcomeDialog(false);
  };

  const handleToggleHints = () => {
    setShowHints((prev) => !prev);
  };

  // Einfache KI, die alle erlaubten Züge des Computers berechnet und einen auswählt.
  // Der kleine Timeout simuliert "Nachdenken" und verhindert, dass sich die UI blockierend anfühlt.
  useEffect(() => {
    if (currentPlayer !== "ai" || multiCaptureActive || gameOver) {
      return;
    }

    const aiThinkingDelay = window.setTimeout(() => {
      const aiCandidates = collectMovesForPlayer(board, "ai");
      if (aiCandidates.length === 0) {
        endGameFor("human", `Sieg für ${getPlayerLabel("human")} – ${getPlayerLabel("ai")} hat keine Züge mehr.`);
        return;
      }

      const chosen = chooseMoveByPriority(aiCandidates);
      if (!chosen) {
        endGameFor("human", `Sieg für ${getPlayerLabel("human")} – ${getPlayerLabel("ai")} hat keinen gültigen Zug gefunden.`);
        return;
      }

      let result = applyMove(board, chosen.from, chosen.move, rows);
      if (!result.movedPiece) {
        endGameFor("human", `Sieg für ${getPlayerLabel("human")} – ${getPlayerLabel("ai")} konnte den Zug nicht ausführen.`);
        return;
      }

      let workingBoard = result.board;
      let currentPosition = result.to;

      while (result.continuation.length > 0) {
        const continuationMove = chooseContinuationMove(result.continuation);
        result = applyMove(workingBoard, currentPosition, continuationMove, rows);
        if (!result.movedPiece) {
          break;
        }
        workingBoard = result.board;
        currentPosition = result.to;
      }

      setBoard(workingBoard);
      setSelected(null);
      setAvailableMoves([]);
      setMultiCaptureActive(false);

      const evaluation = evaluateGameState(workingBoard, "human");
      if (evaluation) {
        endGameFor(evaluation.winner, evaluation.message);
        return;
      }

      setCurrentPlayer("human");
    }, 450);

    return () => window.clearTimeout(aiThinkingDelay);
  }, [board, currentPlayer, gameOver, multiCaptureActive, rows]);

  // Klick-Handler für das UI: entscheidet je nach Situation,
  // ob ein Stein ausgewählt oder ein Zug ausgeführt werden soll.
  const handleCellClick = (row: number, col: number) => {
    if (!isHumansTurn) {
      return;
    }

    const targetPosition: Position = { row, col };

    if (
      multiCaptureActive &&
      selected &&
      !availableMoves.some((move) => positionsEqual(move.to, targetPosition))
    ) {
      // Während eines Mehrfachschlags bleibt der gerade bewegte Stein ausgewählt.
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

      const result = applyMove(board, selected, chosenMove, rows);
      if (!result.movedPiece) {
        setSelected(null);
        setAvailableMoves([]);
        setMultiCaptureActive(false);
        return;
      }

      setBoard(result.board);

      if (result.continuation.length > 0) {
        setSelected(result.to);
        setAvailableMoves(result.continuation);
        setMultiCaptureActive(true);
        return;
      }

      setSelected(null);
      setAvailableMoves([]);
      setMultiCaptureActive(false);

      const evaluation = evaluateGameState(result.board, "ai");
      if (evaluation) {
        endGameFor(evaluation.winner, evaluation.message);
        return;
      }

      setCurrentPlayer("ai");
    }
  };

  const currentPlayerLabel = currentPlayer === "human" ? "Mensch (hell)" : "KI (schwarz)";
  const statusSuffix = !gameOver && hasForcedCaptures ? " – Schlagzwang" : "";

  return (
    <div className="w-full flex flex-col items-center gap-4 p-6">
      <div className="w-full max-w-4xl">
        <GameMenu
          onNewGame={handleNewGame}
          showHints={showHints}
          onToggleHints={handleToggleHints}
        />
      </div>

      <h1 className="text-xl font-semibold">Dame – Spielbrett</h1>

      <div ref={boardContainerRef} className="w-full max-w-4xl">
        <CheckersGrid
          board={board}
          files={files}
          ranks={ranks}
          cellSize={cellSize}
          selected={selected}
          availableMoves={availableMoves}
          forcedCapturePositions={shouldHighlightHints ? forcedCapturePositions : []}
          showHints={shouldHighlightHints}
          isHumansTurn={isHumansTurn}
          onCellClick={handleCellClick}
        />
      </div>

      <div className="text-sm text-neutral-600">
        Tipp: Die Zellgröße passt sich automatisch an den verfügbaren Platz an.
      </div>

      <StatusBanner
        gameOver={gameOver}
        outcomeMessage={outcomeMessage}
        currentPlayerLabel={currentPlayerLabel}
        statusSuffix={statusSuffix}
        multiCaptureActive={multiCaptureActive}
      />

      {showOutcomeDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 px-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-live="assertive"
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-neutral-800 shadow-xl"
          >
            <h2 className="text-lg font-semibold">Spiel beendet</h2>
            <p className="mt-2 text-sm">
              {outcomeMessage ?? "Partie abgeschlossen."}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowOutcomeDialog(false)}
                className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Schließen
              </button>
              <button
                type="button"
                onClick={handleNewGame}
                className="rounded-full bg-indigo-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Neues Spiel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  // Bündelt wiederkehrende Aufgaben, wenn eine Partie endet
  // (z. B. nach Sieg, Patt oder wenn die KI keine Züge mehr hat).
  function endGameFor(winner: Player, message: string) {
    setOutcomeMessage(message);
    setGameOver(true);
    setCurrentPlayer(winner);
    setSelected(null);
    setAvailableMoves([]);
    setMultiCaptureActive(false);
    setShowOutcomeDialog(true);
  }
}
