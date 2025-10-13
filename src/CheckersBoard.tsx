import React from "react";

type Props = { cell?: number };

export default function CheckersBoard({ cell = 72 }: Props) {
  const rows = 8;
  const cols = 8;
  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
    gridTemplateRows: `repeat(${rows}, ${cell}px)`,
  };
  const files = Array.from({ length: cols }, (_, i) => String.fromCharCode(65 + i));
  const ranks = Array.from({ length: rows }, (_, i) => `${rows - i}`);

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
          {Array.from({ length: rows }).map((_, r) =>
            Array.from({ length: cols }).map((_, c) => {
              const isDark = (r + c) % 2 === 1;
              const key = `${r}-${c}`;
              return (
                <div
                  key={key}
                  role="gridcell"
                  aria-label={`Feld ${files[c]}${rows - r}`}
                  data-row={r}
                  data-col={c}
                  className={
                    "relative flex items-center justify-center select-none " +
                    (isDark ? "bg-emerald-700" : "bg-emerald-200")
                  }
                  style={{ width: cell, height: cell }}
                >
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
    </div>
  );
}