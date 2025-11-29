import type { Root } from 'react-dom/client'
import { ThemeProvider } from '@react-devtools/ui'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { App } from './App'
import '@unocss/reset/tailwind.css'
import 'virtual:uno.css'
import '@react-devtools/ui/style.css'

let root: Root | null = null

function init() {
  const container = document.getElementById('root')
  if (!container)
    return

  let config = (window as any).__REACT_DEVTOOLS_CONFIG__

  // If not found in current window (e.g. iframe), try parent window
  if (!config && window.parent && window.parent !== window) {
    try {
      config = (window.parent as any).__REACT_DEVTOOLS_CONFIG__
    }
    catch (e) {
      // Ignore cross-origin errors
    }
  }

  const themeConfig = {
    mode: config?.theme?.mode || 'auto',
    primaryColor: config?.theme?.primaryColor || 'react',
  }

  root = createRoot(container)
  root.render(
    <StrictMode>
      <ThemeProvider config={themeConfig} storageKey="react-devtools-panel-theme">
        <HashRouter>
          <App />
        </HashRouter>
      </ThemeProvider>
    </StrictMode>,
  )
}

if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', init, { once: true })
else
  init()

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    root?.unmount()
    root = null
  })
}
