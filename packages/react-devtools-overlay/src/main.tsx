import type { Root } from 'react-dom/client'
import { globalPluginManager } from '@react-devtools/core'
import { installReactHook } from '@react-devtools/kit'
import { createScanPlugin } from '@react-devtools/scan'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

let root: Root | null = null
const showHostComponents = false
let componentTreeHookInstalled = false

function getShowHostComponents() {
  return showHostComponents
}

function installComponentTreeHook() {
  if (componentTreeHookInstalled) {
    return
  }

  installReactHook(getShowHostComponents)
  componentTreeHookInstalled = true
}

async function init() {
  // Prevent duplicate initialization
  if (document.getElementById('react-devtools-overlay')) {
    return
  }

  // STRATEGY: React Scan runs independently first (for purple flashing box)
  // Component tree hook is installed on-demand when user visits Components page
  try {
    await globalPluginManager.register(createScanPlugin({
      autoStart: true,
    }))
    console.log('[React DevTools] React Scan plugin registered successfully')
  }
  catch (error) {
    console.error('[React DevTools] Failed to register Scan plugin:', error)
  }

  // Listen for component tree hook installation requests from client iframe
  window.addEventListener('message', (event) => {
    if (event.data?.type === '__REACT_DEVTOOLS_INSTALL_COMPONENT_TREE_HOOK__') {
      installComponentTreeHook()
    }
  })

  const container = document.createElement('div')
  container.id = 'react-devtools-overlay'
  document.body.appendChild(container)

  root = createRoot(container)
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

function handleKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented)
    return
  const key = event.key.toLowerCase()
  if (event.altKey && event.shiftKey && !event.metaKey && !event.ctrlKey && key === 'r') {
    event.preventDefault()
    const container = document.getElementById('react-devtools-overlay')
    if (container) {
      container.style.display = container.style.display === 'none' ? 'block' : 'none'
    }
  }
}

window.addEventListener('keydown', handleKeydown)

if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', init, { once: true })
else
  init()

// HMR support (Vite only)
// In webpack, import.meta.hot will be undefined, which is fine
if (typeof import.meta !== 'undefined' && (import.meta as any).hot) {
  (import.meta as any).hot.dispose(() => {
    window.removeEventListener('keydown', handleKeydown)
    root?.unmount()
    root = null
    const container = document.getElementById('react-devtools-overlay')
    container?.remove()
  })
}
