import { ThemeProvider } from '@react-devtools/ui'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import '@react-devtools/ui/style.css'
import './style.scss'

// Note: React Scan is now auto-injected via vite.config.ts
// 注意：React Scan 现在通过 vite.config.ts 自动注入

// React 17 uses ReactDOM.render instead of createRoot
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider config={{ primaryColor: 'react', mode: 'auto' }}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)
