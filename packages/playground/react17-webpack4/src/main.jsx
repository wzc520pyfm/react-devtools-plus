import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './style.scss'

// Note: React Scan is now auto-injected via webpack.config.js
// 注意：React Scan 现在通过 webpack.config.js 自动注入

// React 17 uses ReactDOM.render (not createRoot which is React 18+)
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
