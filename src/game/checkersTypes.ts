// Zentrale Typdefinitionen für das Dame-Spiel.
// Die Datei trennt Domänenwissen von React-Komponenten,
// damit Junior-Entwickler die Datenmodelle isoliert nachschlagen können.

export type PieceColor = "dark" | "light";
export type Player = "human" | "ai";

// Ein einzelner Stein auf dem Brett. color beschreibt die Oberflächengestaltung,
// king markiert, ob der Stein bereits bis zum Ende durchgelaufen ist.
export type Piece = {
  color: PieceColor;
  king: boolean;
  owner: Player;
};

// Ein Feld kann leer sein (null) oder einen Stein enthalten.
export type Cell = Piece | null;
// Das Spielbrett besteht aus einer zweidimensionalen Matrix von Zellen.
export type Board = Cell[][];

// Praktische Struktur, um eine Position über Zeile und Spalte zu adressieren.
export type Position = { row: number; col: number };

// Ein möglicher Zug: to beschreibt das Ziel, captures listet übersprungene Steine.
export type Move = {
  to: Position;
  captures: Position[];
};

// Hilfstyp für die KI: from + move bilden zusammen einen vollständigen Zug.
export type CandidateMove = {
  from: Position;
  move: Move;
};

// evaluateGameState liefert diesen Typ zurück, um Siegertext und Gewinner zu nennen.
export type GameEvaluation = {
  winner: Player;
  message: string;
};
