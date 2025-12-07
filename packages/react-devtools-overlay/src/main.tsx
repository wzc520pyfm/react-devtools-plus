/**
 * React DevTools Overlay Entry Point
 *
 * This module initializes the DevTools overlay and sets up:
 * - React Scan plugin for performance monitoring
 * - Components tree hook (on-demand)
 * - Keyboard shortcuts
 * - HMR support (Vite only)
 */

import type { ReactRootRef } from './utils/react-render'
import { globalPluginManager } from '@react-devtools-plus/core'
import { installReactHook } from '@react-devtools-plus/kit'
import { createScanPlugin } from '@react-devtools-plus/scan'
import { createElement, StrictMode } from 'react'
import { App } from './App'
import { renderToContainer, unmountRoot } from './utils/react-render'

// Module state
let rootRef: ReactRootRef | null = null

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
 * Initialize the DevTools overlay
 */
async function init() {
  try {
    // Prevent duplicate initialization
    if (document.getElementById('react-devtools-overlay')) {
      return
    }

    // Register React Scan plugin (for purple flashing box)
    // Component tree hook is installed on-demand when user visits Components page
    await registerScanPlugin()

    // Setup message listeners for component tree hook installation
    setupMessageListeners()

    // Create and mount overlay
    const container = createOverlayContainer()
    const element = createElement(StrictMode, null, createElement(App))

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

    // Unmount using the appropriate method
    unmountRoot(rootRef)
    rootRef = null

    // Remove container
    const container = document.getElementById('react-devtools-overlay')
    if (container) {
      container.remove()
    }
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
