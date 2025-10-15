// Kleine Anzeige-Komponente, die den aktuellen Status der Partie beschreibt.
import React from "react";

type StatusBannerProps = {
  gameOver: boolean;
  outcomeMessage: string | null;
  currentPlayerLabel: string;
  statusSuffix: string;
  multiCaptureActive: boolean;
};

// Zeigt den aktuellen Status des Spiels an (wer ist am Zug? Ist die Partie beendet?).
// Durch die Auslagerung kann die Hauptkomponente übersichtlicher bleiben.
export function StatusBanner({
  gameOver,
  outcomeMessage,
  currentPlayerLabel,
  statusSuffix,
  multiCaptureActive,
}: StatusBannerProps) {
  // Sobald gameOver wahr ist, zeigen wir einen deutlich markierten Endtext.
  if (gameOver) {
    return (
      <div className="text-sm text-neutral-700">
        <span className="font-medium text-emerald-700">
          {outcomeMessage ?? "Partie beendet."}
        </span>
      </div>
    );
  }

  // Während der laufenden Partie informieren wir, wer am Zug ist und ob ein Schlagzwang besteht.
  return (
    <div className="text-sm text-neutral-700">
      Am Zug: <span className="font-medium">{currentPlayerLabel}</span>
      {statusSuffix}
      {multiCaptureActive ? " – Mehrfachschlag fortsetzen" : ""}
    </div>
  );
}
