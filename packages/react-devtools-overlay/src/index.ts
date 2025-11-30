import { globalPluginManager } from '@react-devtools/core'
import { installReactHook } from '@react-devtools/kit'
import { createScanPlugin } from '@react-devtools/scan'

export { App as DevTools } from './App'

// Re-export initialization utilities for manual integration (e.g., Next.js)
let componentTreeHookInstalled = false
let scanPluginRegistered = false
const showHostComponents = false

function getShowHostComponents() {
  return showHostComponents
}

/**
 * Install component tree hook for inspecting React components
 * Call this in the host page (not in iframe)
 */
export function installComponentTreeHook() {
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
 * Register React Scan plugin for performance visualization
 * Call this in the host page (not in iframe)
 */
export async function registerScanPlugin(options?: { autoStart?: boolean }) {
  if (scanPluginRegistered) {
    return
  }

  try {
    await globalPluginManager.register(createScanPlugin({
      autoStart: options?.autoStart ?? true,
    }))
    scanPluginRegistered = true
  }
  catch (e) {
    console.warn('[React DevTools] Failed to register React Scan plugin:', e)
  }
}

/**
 * Setup message listeners for component tree hook installation
 * This allows the DevTools iframe to request hook installation
 */
export function setupMessageListeners() {
  if (typeof window === 'undefined') return
  
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
 * Initialize all DevTools features
 * Call this once in the host page for full functionality
 */
export async function initDevTools(options?: { 
  autoStartScan?: boolean 
  installHook?: boolean
}) {
  if (typeof window === 'undefined') return

  // Setup message listeners for on-demand hook installation
  setupMessageListeners()

  // Register React Scan plugin
  await registerScanPlugin({ autoStart: options?.autoStartScan ?? true })

  // Optionally install component tree hook immediately
  if (options?.installHook) {
    installComponentTreeHook()
  }
}
