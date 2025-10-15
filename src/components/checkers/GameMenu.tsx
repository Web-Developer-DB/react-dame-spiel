// Menükomponente mit Zusatzaktionen rund um das Spielbrett.
// Sie zeigt Anfängern kontrollierte Formelemente (Checkboxen und Buttons) in React.
import React from "react";

type GameMenuProps = {
  onNewGame: () => void;
  showHints: boolean;
  onToggleHints: () => void;
};

export function GameMenu({
  onNewGame,
  showHints,
  onToggleHints,
}: GameMenuProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/80 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Spielmenü</p>
            <p className="text-sm text-neutral-700">
              Starte neu oder passe die Darstellung an, ohne das Spielbrett direkt zu berühren.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onNewGame}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              Neues Spiel
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-neutral-700">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 accent-indigo-500"
              // checked und onChange machen aus der Checkbox ein kontrolliertes Eingabefeld.
              checked={showHints}
              onChange={onToggleHints}
            />
            Tipps hervorheben
          </label>
          {/* Hinweistext erklärt, dass keine manuelle Größenanpassung nötig ist */}
          <p className="text-xs text-neutral-500">
            Die Feldgröße passt sich automatisch an die Bildschirmbreite an.
          </p>
        </div>
      </div>
    </div>
  );
}
