import '@react-devtools/ui/style.css'
import { ThemeProvider } from '@react-devtools/ui'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ThemeDemo } from './ThemeDemo.tsx'
import './style.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider config={{ primaryColor: 'react', mode: 'auto' }}>
      <ThemeDemo />
      <div style={{ marginTop: '48px', borderTop: '2px solid var(--color-border-base)', paddingTop: '48px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>原 App 组件</h2>
        <App />
      </div>
    </ThemeProvider>
  </React.StrictMode>,
)
