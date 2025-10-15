// Minimaler Kopfbereich: bietet nur den Neustart und die Schwierigkeitsstufe an.
import React from "react";

type GameMenuProps = {
  onNewGame: () => void;
  difficulty: number;
  onDifficultyChange: (nextLevel: number) => void;
};

export function GameMenu({ onNewGame, difficulty, onDifficultyChange }: GameMenuProps) {
  const handleCycleDifficulty = () => {
    const nextLevel = difficulty >= 5 ? 1 : difficulty + 1;
    onDifficultyChange(nextLevel);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={handleCycleDifficulty}
        className="inline-flex items-center gap-1 rounded-full border border-indigo-400/40 bg-indigo-500/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-indigo-100 transition hover:bg-indigo-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        aria-label={`Schwierigkeitsstufe ändern (aktuell Stufe ${difficulty})`}
      >
        Stufe {difficulty}
      </button>
      <button
        type="button"
        onClick={onNewGame}
        className="inline-flex items-center gap-1 rounded-full bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        aria-label="Neues Spiel starten"
      >
        Neues Spiel
      </button>
    </div>
  );
}
