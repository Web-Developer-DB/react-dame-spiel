import React from 'react'
import CheckersBoard from './CheckersBoard'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 p-6">
        <CheckersBoard />
      </div>
      <footer className="border-t border-neutral-200 bg-white/80 px-6 py-4 text-center text-sm text-neutral-600 backdrop-blur">
        © {new Date().getFullYear()} Dimitri B – MIT License
      </footer>
    </div>
  )
}
