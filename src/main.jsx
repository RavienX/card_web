import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import './styles.css'
import App from './App.jsx'
import { STATIC } from './api'

// The GitHub Pages demo uses #/ links, so reloading any card works without server rules
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {STATIC
      ? <HashRouter><App /></HashRouter>
      : <BrowserRouter><App /></BrowserRouter>}
  </StrictMode>,
)
