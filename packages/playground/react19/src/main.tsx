import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './style.css'

// Note: React Scan is now auto-injected via vite.config.ts
// 注意：React Scan 现在通过 vite.config.ts 自动注入

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
