// Zentrale Typdefinitionen für das Dame-Spiel.
// Die Datei trennt Domänenwissen von React-Komponenten,
// damit Junior-Entwickler die Datenmodelle isoliert nachschlagen können.

export type PieceColor = "dark" | "light";
export type Player = "human" | "ai";

export type Piece = {
  color: PieceColor;
  king: boolean;
  owner: Player;
};

export type Cell = Piece | null;
export type Board = Cell[][];

export type Position = { row: number; col: number };

export type Move = {
  to: Position;
  captures: Position[];
};

export type CandidateMove = {
  from: Position;
  move: Move;
};

export type GameEvaluation = {
  winner: Player;
  message: string;
};
