import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { loadIconMap } from '@/services/coinIconMapService'

// Kick off coin icon map fetch immediately — fire and forget
loadIconMap()

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)