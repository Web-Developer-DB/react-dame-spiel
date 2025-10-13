import React from 'react'
import CheckersBoard from './CheckersBoard'

export default function App() {
  return (
    <div className="p-6">
      <CheckersBoard cell={72} />
    </div>
  )
}