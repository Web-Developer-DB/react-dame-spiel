# React Checkers (Dame)

Eine kleine Dame-Umsetzung mit React, TypeScript und Tailwind CSS.  
Das Projekt richtet sich an Einsteigerinnen und Einsteiger, die sehen möchten, wie man Spiellogik, einfache KI-Züge und ein modernes UI strukturieren kann.

## Inhalt

- [Features](#features)
- [Voraussetzungen](#voraussetzungen)
- [Projekt lokal starten](#projekt-lokal-starten)
- [Wichtige npm-Skripte](#wichtige-npm-skripte)
- [Architekturüberblick](#architekturüberblick)
- [Spielregeln & Gameplay](#spielregeln--gameplay)
- [Ideen für Erweiterungen](#ideen-für-erweiterungen)
- [Lizenz](#lizenz)

## Features

- Interaktives 8x8-Damebrett mit Schlagzwang und Mehrfachschlägen.
- KI mit fünf Schwierigkeitsstufen – von reinen Zufallszügen bis zu einer heuristischen Bewertung mit Vorausberechnung.
- Visuelle Hinweise heben Schlagzwang und mögliche Ziel-Felder hervor, inklusive Overlay für das Spielergebnis.
- Responsives Brett: Zellgrößen passen sich automatisch an den verfügbaren Platz an.
- Statusanzeige mit Sieg-/Patt-Erkennung.
- Modularer React-Code mit ausführlichen Kommentaren für Junior-Entwickler.

## Voraussetzungen

- Node.js 18 oder neuer
- npm (wird normalerweise mit Node.js installiert)

## Projekt lokal starten

```bash
npm install       # Abhängigkeiten installieren
npm run dev       # Entwicklungsserver starten (Vite)
```

Der Dev-Server läuft standardmäßig unter <http://localhost:5173>. Änderungen an den Quelldateien werden live nachgeladen.

## Wichtige npm-Skripte

| Skript         | Beschreibung                                                  |
| -------------- | ------------------------------------------------------------- |
| `npm run dev`  | Startet Vite im Entwicklungsmodus mit Hot Module Reloading.   |
| `npm run build`| Erstellt ein optimiertes Produktions-Bundle.                  |
| `npm run preview` | Vorschau des Produktions-Bundles auf einem lokalen Server. |
| `npm run lint` | Führt ESLint über `src/` aus, um den Code-Stil zu prüfen.     |

## Schwierigkeitsstufen

Über das Menü kannst du zwischen fünf Schwierigkeitsgraden wechseln:

1. **Stufe 1** – reine Zufallsauswahl aus allen legalen Zügen.
2. **Stufe 2** – bevorzugt Schlagzüge, bleibt sonst zufällig.
3. **Stufe 3** – priorisiert Züge mit der höchsten Anzahl geschlagener Steine.
4. **Stufe 4** – bewertet Kandidaten heuristisch (Material, Schlag-Boni, Beförderungen).
5. **Stufe 5** – simuliert einen Antwortzug des Menschen und wählt die beste Bewertung.

## Architekturüberblick

```
src/
├── App.tsx                     # Frame der Anwendung inkl. Footer
├── CheckersBoard.tsx           # Container-Komponente: State, KI, Event-Handling
├── components/
│   └── checkers/
│       ├── CheckersGrid.tsx    # Reines Rendering des Bretts + Beschriftungen
│       ├── GameMenu.tsx        # UI-Steuerelemente (Neustart, Schwierigkeitsstufe)
│       └── StatusBanner.tsx    # Aufbereitung von Status-/Gewinnmeldungen
├── game/
│   ├── checkersLogic.ts        # Regelwerk, KI-Helfer, Utility-Funktionen
│   └── checkersTypes.ts        # Gemeinsame Typdefinitionen für das Spiel
└── index.css                   # Globale Styles (Tailwind + Hintergrund)
```

- **CheckersBoard.tsx** bündelt den Spielfluss, nutzt aber kleinere Komponenten, um die Darstellung lesbar zu halten.
- **checkersLogic.ts** enthält bewusst reine Funktionen (keine React-Imports), damit man die Spielregeln isoliert testen und wiederverwenden kann.
- **checkersTypes.ts** sammelt alle Domänen-Typen an einer Stelle. Wer neue Features baut, findet dort schnell heraus, welche Datenstrukturen bereits existieren.

## Spielregeln & Gameplay

- Standard-Dame 8×8: Helle Steine (Mensch) starten unten, dunkle Steine (KI) oben.
- Züge sind nur diagonal auf dunklen Feldern erlaubt.
- Ein Schlag (Sprung über einen gegnerischen Stein) ist Pflicht, wenn möglich.
- Mehrfachschläge werden automatisch angeboten, der aktive Stein bleibt dafür ausgewählt.
- Erreicht ein Stein die gegnerische Grundlinie, wird er zur Dame und darf rückwärts ziehen.
- Das Spiel endet, wenn eine Seite keine Steine mehr besitzt oder keinen legalen Zug ausführen kann.

## Ideen für Erweiterungen

1. **Fortgeschrittene KI** – Defensive Strategien, tiefere Suchen oder alternative Heuristiken.
2. **Zugverlauf** – Eine Historie der Züge (PGN-ähnlich) hilft beim Nachvollziehen.
3. **Multiplayer** – Optional per WebSocket oder lokalem Zwei-Spieler-Modus.
4. **Tests** – Unit- oder Integrationstests für die reine Logik (`checkersLogic.ts`) steigern Vertrauen in neue Features.

## Lizenz

Veröffentlicht unter der **MIT-Lizenz**.  
© 2024 Dimitri B
