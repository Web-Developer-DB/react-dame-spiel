// Der Einstiegspunkt der Anwendung: hier wird die React-App im Browser gestartet.
import React from 'react'
// createRoot verbindet React mit dem DOM-Element in index.html.
import { createRoot } from 'react-dom/client'
// Globale Styles und Tailwind-Utilities.
import './index.css'
// Die Wurzelkomponente, die den Rest der App enthält.
import App from './App'

// React rendert den Inhalt in das div mit der ID "root".
createRoot(document.getElementById('root')!).render(
  // StrictMode hilft Einsteigern, Warnungen über unsichere Muster zu erhalten.
  <React.StrictMode>
    {/* Unsere eigentliche Anwendung */}
    <App />
  </React.StrictMode>
)
