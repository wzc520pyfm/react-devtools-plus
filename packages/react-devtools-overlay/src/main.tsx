/**
 * React DevTools Overlay Entry Point
 *
 * This module initializes the DevTools overlay and sets up:
 * - React Scan plugin for performance monitoring
 * - Components tree hook (on-demand)
 * - Keyboard shortcuts
 * - HMR support (Vite only)
 *
 * NOTE: We use window.React to access createElement/StrictMode at runtime
 * to ensure compatibility with the host app's React version (16-19).
 */

import type { ReactRootRef } from './utils/react-render'
import { globalPluginManager } from '@react-devtools-plus/core'
import { installReactHook } from '@react-devtools-plus/kit'
import { createScanPlugin } from '@react-devtools-plus/scan'
import { App } from './App'
import { initPluginRpcBridge } from './utils/plugin-rpc-bridge'
import { renderToContainer, unmountRoot } from './utils/react-render'

/**
 * Get React from window globals
 */
function getReact(): any {
  return typeof window !== 'undefined' ? (window as any).React : undefined
}

// Module state
let rootRef: ReactRootRef | null = null
let pluginRpcBridgeCleanup: (() => void) | null = null

let componentTreeHookInstalled = false
const showHostComponents = false

function getShowHostComponents() {
  return showHostComponents
}

/**
 * Install component tree hook (called on-demand from client iframe)
 */
function installComponentTreeHook() {
  if (componentTreeHookInstalled) {
    return
  }

  try {
    installReactHook(getShowHostComponents)
    componentTreeHookInstalled = true
  }
  catch (e) {
    console.warn('[React DevTools] Failed to install component tree hook:', e)
  }
}

/**
 * Register React Scan plugin
 */
async function registerScanPlugin() {
  try {
    await globalPluginManager.register(createScanPlugin({
      autoStart: true,
    }))
  }
  catch (e) {
    console.warn('[React DevTools] Failed to register React Scan plugin:', e)
  }
}

/**
 * Setup message listeners for component tree hook installation
 */
function setupMessageListeners() {
  window.addEventListener('message', (event) => {
    // Handle component tree hook installation request
    if (event.data?.type === '__REACT_DEVTOOLS_INSTALL_COMPONENT_TREE_HOOK__') {
      installComponentTreeHook()
    }
    // Also handle simple string message format (for cross-origin compatibility)
    if (event.data === '__REACT_DEVTOOLS_INSTALL_COMPONENT_TREE_HOOK__') {
      installComponentTreeHook()
    }
  })
}

/**
 * Create and mount overlay container
 */
function createOverlayContainer(): HTMLElement {
  const container = document.createElement('div')
  container.id = 'react-devtools-overlay'
  document.body.appendChild(container)
  return container
}

/**
 * Check if DevTools should initialize based on micro-frontend mode
 *
 * @returns true if DevTools should initialize, false otherwise
 */
function shouldInitializeDevTools(): boolean {
  const config = (window as any).__REACT_DEVTOOLS_CONFIG__
  const mode = config?.microFrontend || 'auto'

  // Check if DevTools already exists (DOM check + global marker)
  const existingOverlay = document.getElementById('react-devtools-overlay')
  const globalMarker = (window as any).__REACT_DEVTOOLS_PLUS_INITIALIZED__

  const devToolsExists = existingOverlay || globalMarker

  switch (mode) {
    case 'host':
      // Host app: always initialize (take ownership)
      // If another instance exists, it will be the same DOM element check that prevents re-render
      return !existingOverlay
    case 'child':
      // Child app: skip if any DevTools exists
      if (devToolsExists) {
        console.debug('[React DevTools] Skipping initialization (child mode, DevTools already exists)')
        return false
      }
      return true
    case 'standalone':
      // Standalone: always initialize for isolated development
      // Only check DOM to prevent duplicate mounting in same context
      return !existingOverlay
    case 'auto':
    default:
      // Auto: detect and skip if exists
      if (devToolsExists) {
        return false
      }
      return true
  }
}

/**
 * Initialize the DevTools overlay
 */
async function init() {
  try {
    // Check micro-frontend mode to decide whether to initialize
    if (!shouldInitializeDevTools()) {
      return
    }

    // Set global marker to help other instances detect us
    ;(window as any).__REACT_DEVTOOLS_PLUS_INITIALIZED__ = true

    // Register React Scan plugin (for purple flashing box)
    // Component tree hook is installed on-demand when user visits Components page
    await registerScanPlugin()

    // Initialize plugin RPC bridge (for host script <-> devtools communication)
    pluginRpcBridgeCleanup = initPluginRpcBridge()

    // Setup message listeners for component tree hook installation
    setupMessageListeners()

    // Create and mount overlay
    const container = createOverlayContainer()
    const React = getReact()
    if (!React) {
      console.warn('[React DevTools] React not found on window')
      return
    }
    const element = React.createElement(React.StrictMode, null, React.createElement(App))

    // Render using the appropriate method based on React version
    rootRef = renderToContainer(element, container)

    if (!rootRef) {
      console.warn('[React DevTools] Failed to mount overlay')
    }
  }
  catch (e) {
    console.warn('[React DevTools] Overlay init error:', e)
  }
}

/**
 * Handle keyboard shortcuts
 */
function handleKeydown(event: KeyboardEvent) {
  try {
    if (event.defaultPrevented)
      return
    const key = event.key.toLowerCase()
    const container = document.getElementById('react-devtools-overlay')

    // Alt + Shift + D to toggle DevTools panel open/close
    // About key codes: https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent/keyCode
    if (event.altKey && event.shiftKey && (key === 'd' || event.code === 'KeyD' || event.keyCode === 68)) {
      event.preventDefault()
      // Dispatch custom event for the DevTools UI to handle panel toggle
      window.dispatchEvent(new CustomEvent('react-devtools:toggle-panel'))
    }

    // Alt + Shift + R to toggle overlay visibility (display: none/block)
    if (event.altKey && event.shiftKey && (key === 'r' || event.code === 'KeyR' || event.keyCode === 82)) {
      event.preventDefault()
      if (container) {
        container.style.display = container.style.display === 'none' ? 'block' : 'none'
      }
    }
  }
  catch (e) {
    // Silently ignore
  }
}

/**
 * Cleanup function for HMR
 */
function cleanup() {
  try {
    window.removeEventListener('keydown', handleKeydown)

    // Cleanup plugin RPC bridge
    if (pluginRpcBridgeCleanup) {
      pluginRpcBridgeCleanup()
      pluginRpcBridgeCleanup = null
    }

    // Unmount using the appropriate method
    unmountRoot(rootRef)
    rootRef = null

    // Remove container
    const container = document.getElementById('react-devtools-overlay')
    if (container) {
      container.remove()
    }

    // Clear global marker
    delete (window as any).__REACT_DEVTOOLS_PLUS_INITIALIZED__
  }
  catch (e) {
    // Silently ignore cleanup errors
  }
}

/**
 * Setup HMR support (Vite only)
 */
function setupHMR() {
  try {
    // Use Function constructor to avoid static analysis issues
    // eslint-disable-next-line no-new-func
    const getImportMeta = new Function('return typeof import.meta !== "undefined" ? import.meta : undefined')
    const importMeta = getImportMeta()

    if (importMeta?.hot) {
      importMeta.hot.dispose(cleanup)
    }
  }
  catch (e) {
    // Silently ignore - HMR not available
  }
}

// Initialize overlay with proper timing
// Wrap in try-catch to prevent breaking host app
try {
  window.addEventListener('keydown', handleKeydown)

  // Delay initialization to not block module loading
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 0), { once: true })
  }
  else {
    setTimeout(init, 0)
  }

  // Setup HMR
  setupHMR()
}
catch (e) {
  console.warn('[React DevTools] Failed to setup overlay:', e)
}
