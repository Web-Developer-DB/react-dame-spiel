// Minimaler Menü-Button, der nur noch den Neustart der Partie anbietet.
import React from "react";

type GameMenuProps = {
  onNewGame: () => void;
};

export function GameMenu({ onNewGame }: GameMenuProps) {
  return (
    <div className="flex justify-end">
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
