// Die App-Komponente bildet das Grundgerüst der Oberfläche ab.
// Sie sorgt dafür, dass das Spielbrett mittig dargestellt und von einem Footer ergänzt wird.
import React from 'react'
import CheckersBoard from './CheckersBoard'

export default function App() {
  // React-Komponenten geben immer einen JSX-Baum zurück, der beschreibt, was im Browser erscheint.
  return (
    <div className="flex min-h-screen flex-col">
      {/* flex-1 sorgt dafür, dass das Brett den verfügbaren Platz nutzt */}
      <div className="flex-1 p-6">
        {/* Das eigentliche Dame-Spiel */}
        <CheckersBoard />
      </div>

      {/* Ein dezenter Footer als Abschluss der Seite */}
      <footer className="border-t border-neutral-200 bg-white/80 px-6 py-4 text-center text-sm text-neutral-600 backdrop-blur">
        © {new Date().getFullYear()} Dimitri B – MIT License
      </footer>
    </div>
  )
}
