/**
 * React DevTools Scan - Native scan engine integration
 *
 * @packageDocumentation
 */

import './polyfills'
import 'bippy'

import type { IntegrationMode, ReactDevtoolsScanOptions, ScanInstance } from './types'
import { ReactScanInternals, scan } from './core/index'
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
  const defaultOptions: ReactDevtoolsScanOptions = {
    integrationMode: 'overlay',
    syncWithDevtools: true,
    ...options,
  }

  if (typeof window !== 'undefined') {
    if (window.__REACT_SCAN_INTERNALS__) {
      window.__REACT_SCAN_INTERNALS__.runInAllEnvironments = true

      window.__REACT_SCAN_INTERNALS__.options.value = {
        ...window.__REACT_SCAN_INTERNALS__.options.value,
        ...defaultOptions,
      }

      return getScanInstance(defaultOptions)
    }

    ;(window as any).__REACT_SCAN_INTERNALS__ = ReactScanInternals
  }

  // When `enabled` is not in options, core's setOptions() will automatically
  // restore the user's preference from localStorage.
  scan(defaultOptions)

  return getScanInstance(defaultOptions)
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
