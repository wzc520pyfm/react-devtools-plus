/**
 * React DevTools Scan - Native scan engine integration
 *
 * @packageDocumentation
 */

import './polyfills'
import 'bippy'

import type { IntegrationMode, ReactDevtoolsScanOptions, ScanInstance } from './types'
import { ReactScanInternals, scan, setOptions as coreSetOptions } from './core/index'
import { getScanInstance, resetScanInstance } from './scan-facade'

/**
 * Initialize React Scan with DevTools integration
 *
 * @param options - Configuration options for React Scan
 * @returns Scan instance for further control
 *
 * @example
 * ```typescript
 * import { initScan } from '@react-devtools-plus/scan';
 *
 * // Initialize with default options
 * const scanInstance = initScan();
 *
 * // Initialize with custom options
 * const scanInstance = initScan({
 *   enabled: true,
 *   showToolbar: true,
 *   animationSpeed: 'fast',
 *   trackUnnecessaryRenders: true,
 *   integrationMode: 'overlay'
 * });
 * ```
 */
export function initScan(options: ReactDevtoolsScanOptions = {}): ScanInstance {
  // Read persisted enabled state BEFORE scan() overwrites localStorage.
  // This allows user's toggle preference to survive page refreshes.
  let persistedEnabled: boolean | undefined
  if (typeof window !== 'undefined') {
    try {
      const stored = JSON.parse(localStorage.getItem('react-scan-options') || '{}')
      if (typeof stored.enabled === 'boolean') {
        persistedEnabled = stored.enabled
      }
    }
    catch {}
  }

  // Set default options
  const defaultOptions: ReactDevtoolsScanOptions = {
    enabled: process.env.NODE_ENV === 'development',
    integrationMode: 'overlay',
    syncWithDevtools: true,
    ...options,
  }

  if (typeof window !== 'undefined') {
    // Check if already initialized (Singleton pattern)
    if (window.__REACT_SCAN_INTERNALS__) {
      // Ensure runInAllEnvironments is true on existing instance
      window.__REACT_SCAN_INTERNALS__.runInAllEnvironments = true

      // Update options on existing instance
      window.__REACT_SCAN_INTERNALS__.options.value = {
        ...window.__REACT_SCAN_INTERNALS__.options.value,
        ...defaultOptions,
      }

      // Return facade for existing instance
      return getScanInstance(defaultOptions)
    }

    // Expose internals so kit/hook/index.ts can detect scan presence
    ;(window as any).__REACT_SCAN_INTERNALS__ = ReactScanInternals
  }

  // Always call scan() with enabled:true to ensure instrumentation is initialised.
  scan(defaultOptions)

  // If user previously disabled scanning, apply that state via core's setOptions
  // which properly updates internals, isPaused, and localStorage in one shot.
  if (persistedEnabled === false) {
    coreSetOptions({ enabled: false })
  }

  const facadeOptions = persistedEnabled === false
    ? { ...defaultOptions, enabled: false }
    : defaultOptions

  return getScanInstance(facadeOptions)
}

/**
 * Get the current scan instance
 *
 * @returns Current scan instance or null if not initialized
 *
 * @example
 * ```typescript
 * import { getScan } from '@react-devtools-plus/scan';
 *
 * const scanInstance = getScan();
 * if (scanInstance) {
 *   // Check if scan is active
 *   scanInstance.isActive();
 * }
 * ```
 */
export function getScan(): ScanInstance | null {
  try {
    return getScanInstance()
  }
  catch {
    return null
  }
}

/**
 * Reset the scan instance (useful for testing)
 *
 * @example
 * ```typescript
 * import { resetScan } from '@react-devtools-plus/scan';
 *
 * // Reset for testing
 * resetScan();
 * ```
 */
export function resetScan(): void {
  resetScanInstance()
}

// Re-export types
export type { IntegrationMode, ReactDevtoolsScanOptions, ScanInstance }

// Re-export plugin
export { createScanPlugin, scanPlugin } from './plugin'
export type { ScanPluginConfig } from './plugin'

// Re-export native engine exports for convenience
export {
  getOptions,
  onRender,
  ReactScanInternals,
  scan,
  setOptions,
  useScan,
} from './core/index'

// Re-export Options type from native engine
export type { Options } from './core/index'
