import type { Root } from 'react-dom/client'
import * as DevToolsApi from '@react-devtools-plus/api'
import { ThemeProvider } from '@react-devtools-plus/ui'
import React, { StrictMode } from 'react'
import * as ReactDOM from 'react-dom'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { App } from './App'
import './global.css'
import '@unocss/reset/tailwind.css'
import 'virtual:uno.css'
import '@react-devtools-plus/ui/style.css'

// Hack: Hack to suppress "can't detect preamble" error when loading plugins from Vite server
// in the built DevTools client.
// @ts-expect-error - global variable
window.__vite_plugin_react_preamble_installed__ = true

// Expose React and ReactDOM for plugins that externalize React
// This ensures plugins share the same React instance as the DevTools client
// @ts-expect-error - global variable
window.React = React
// @ts-expect-error - global variable
window.ReactDOM = { ...ReactDOM, createRoot }

// Expose DevTools API for plugins that externalize @react-devtools-plus/api
// This allows plugins to use hooks like usePluginRpc, usePluginEvent, etc.
// @ts-expect-error - global variable
window.__REACT_DEVTOOLS_API__ = DevToolsApi

let root: Root | null = null

function init() {
  const container = document.getElementById('root')
  if (!container)
    return

  let config: any = null

  // For iframe case (DevTools panel), always try parent window first
  // because config is injected into the main page, not the iframe
  if (window.parent && window.parent !== window) {
    try {
      config = (window.parent as any).__REACT_DEVTOOLS_CONFIG__
    }
    catch (e) {
      // Ignore cross-origin errors
    }
  }

  // Fallback to current window (for standalone/non-iframe case)
  if (!config) {
    config = (window as any).__REACT_DEVTOOLS_CONFIG__
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
