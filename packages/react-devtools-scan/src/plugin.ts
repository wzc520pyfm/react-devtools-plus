/**
 * React Scan Plugin for React DevTools
 *
 * This plugin integrates React Scan into the React DevTools plugin system,
 * providing performance monitoring and analysis capabilities.
 */

import type { ReactDevtoolsScanOptions, ScanInstance } from './types'
import { getScanInstance, resetScanInstance } from './adapter'

/**
 * React Scan plugin configuration
 */
export interface ScanPluginConfig extends ReactDevtoolsScanOptions {
  /**
   * Whether to auto-start scan on plugin load
   * @default true
   */
  autoStart?: boolean
}

/**
 * Create React Scan plugin
 *
 * @param config - Plugin configuration
 * @returns DevTools plugin instance
 *
 * @example
 * ```typescript
 * import { createScanPlugin } from '@react-devtools/scan/plugin';
 *
 * const scanPlugin = createScanPlugin({
 *   enabled: true,
 *   showToolbar: true,
 *   autoStart: true,
 * });
 * ```
 */
export function createScanPlugin(config: ScanPluginConfig = {}): any {
  let scanInstance: ScanInstance | null = null
  let context: any = null

  const {
    autoStart = true,
    ...scanOptions
  } = config

  // Event emitter for plugin events
  const eventHandlers: Map<string, Set<(data: any) => void>> = new Map()

  const emit = (eventName: string, data: any) => {
    const handlers = eventHandlers.get(eventName)
    if (handlers) {
      handlers.forEach((handler) => {
        if (typeof handler === 'function') {
          try {
            handler(data)
          }
          catch (error) {
            console.error(`[React Scan Plugin] Error in event handler for "${eventName}":`, error)
          }
        }
        else {
          console.warn(`[React Scan Plugin] Invalid event handler for "${eventName}":`, handler)
        }
      })
    }
  }

  const subscribe = (eventName: string, handler: (data: any) => void) => {
    if (!eventHandlers.has(eventName)) {
      eventHandlers.set(eventName, new Set())
    }
    eventHandlers.get(eventName)!.add(handler)

    // Return unsubscribe function
    return () => {
      const handlers = eventHandlers.get(eventName)
      if (handlers) {
        handlers.delete(handler)
      }
    }
  }

  return {
    id: 'react-scan',
    name: 'React Scan',
    description: 'Performance monitoring and analysis for React applications',
    version: '1.0.0',

    // Expose subscribe method for event subscriptions
    subscribe,

    /**
     * Plugin setup
     */
    async setup(ctx: any) {
      context = ctx

      // Always initialize the scan instance, and start by default
      const initOptions = {
        enabled: autoStart !== false,
        ...scanOptions,
      }

      // Always create the scan instance so RPC methods work
      scanInstance = getScanInstance(initOptions)

      // Always call scan() to start scanning by default (unless autoStart explicitly false)
      if (autoStart !== false) {
        // Use adapter's start which handles globals correctly
        scanInstance.start()
      }

      // Set up inspect state change listener
      try {
        const scan = getScanInstance()
        if (scan) {
          scan.onInspectStateChange((state: any) => {
            // Emit inspect state change event
            // Sanitize state for RPC
            const sanitizedState = {
              kind: state.kind,
            }
            emit('inspect-state-changed', sanitizedState)

            // If a component is focused, emit focused component info
            if (state.kind === 'focused') {
              const focusedComponent = scan.getFocusedComponent()
              if (focusedComponent) {
                // Sanitize for RPC - remove non-serializable fields
                const { fiber, domElement, ...serializableComponent } = focusedComponent as any
                emit('component-focused', serializableComponent)
              }
            }
          })
        }
      }
      catch (error) {
        console.error('[React Scan Plugin] Failed to set up inspect state listener:', error)
      }

      // Listen for component tree changes if context supports it
      // Listen to component tree changes if supported
      if (ctx.on) {
        ctx.on('component-tree-changed', (_event: any) => {
          // Component tree changed, could update UI here
        })
      }

      // Register RPC functions if context supports it
      if (ctx.registerRPC) {
        ctx.registerRPC('getScanOptions', () => {
          try {
            const scan = getScanInstance()
            return scan?.getOptions() || null
          }
          catch {
            return null
          }
        })

        ctx.registerRPC('setScanOptions', (options: Partial<ReactDevtoolsScanOptions>) => {
          try {
            const scan = getScanInstance()
            if (scan) {
              scan.setOptions(options)
              return true
            }
            return false
          }
          catch {
            return false
          }
        })

        ctx.registerRPC('startScan', () => {
          try {
            const scan = getScanInstance()
            if (scan) {
              scan.start()
              return true
            }
            return false
          }
          catch {
            return false
          }
        })

        ctx.registerRPC('stopScan', () => {
          try {
            const scan = getScanInstance()
            if (scan) {
              scan.stop()
              return true
            }
            return false
          }
          catch {
            return false
          }
        })

        ctx.registerRPC('isScanActive', () => {
          try {
            const scan = getScanInstance()
            return scan?.isActive() || false
          }
          catch {
            return false
          }
        })
      }
    },

    /**
     * Plugin teardown
     */
    async teardown() {
      if (scanInstance) {
        scanInstance.stop()
        scanInstance = null
      }

      resetScanInstance()
      context = null
    },

    /**
     * RPC methods exposed to other plugins
     */
    rpc: {
      /**
       * Get current scan options
       */
      getOptions: () => {
        try {
          const scan = getScanInstance()
          return scan?.getOptions() || null
        }
        catch {
          return null
        }
      },

      /**
       * Set scan options
       */
      setOptions: (options: Partial<ReactDevtoolsScanOptions>) => {
        try {
          const scan = getScanInstance()
          if (scan) {
            scan.setOptions(options)
            return true
          }
          return false
        }
        catch {
          return false
        }
      },

      /**
       * Start scan
       */
      start: () => {
        try {
          const scanInst = getScanInstance()
          if (scanInst) {
            scanInst.start()
            return true
          }
          // Auto-initialize if not started
          if (!scanInstance) {
            scanInstance = getScanInstance(config)
            scanInstance.start()
            return true
          }
          return false
        }
        catch (err) {
          console.error('[React Scan Plugin] RPC start failed:', err)
          return false
        }
      },

      /**
       * Stop scan
       */
      stop: () => {
        try {
          const scan = getScanInstance()
          if (scan) {
            scan.stop()
            return true
          }
          return false
        }
        catch {
          return false
        }
      },

      /**
       * Check if scan is active
       */
      isActive: () => {
        try {
          const scan = getScanInstance()
          return scan?.isActive() || false
        }
        catch {
          return false
        }
      },

      /**
       * Hide the React Scan toolbar
       */
      hideToolbar: () => {
        try {
          const scan = getScanInstance()
          if (scan) {
            scan.hideToolbar()
            return true
          }
          return false
        }
        catch {
          return false
        }
      },

      /**
       * Show the React Scan toolbar
       */
      showToolbar: () => {
        try {
          const scan = getScanInstance()
          if (scan) {
            scan.showToolbar()
            return true
          }
          return false
        }
        catch {
          return false
        }
      },

      /**
       * Get toolbar visibility state
       */
      getToolbarVisibility: () => {
        try {
          const scan = getScanInstance()
          return scan?.getToolbarVisibility() || false
        }
        catch {
          return false
        }
      },

      /**
       * Get performance data for all components
       */
      getPerformanceData: () => {
        try {
          const scan = getScanInstance()
          return scan?.getPerformanceData() || []
        }
        catch (error) {
          console.error('[React Scan Plugin] Failed to get performance data:', error)
          return []
        }
      },

      /**
       * Get aggregated performance summary
       */
      getPerformanceSummary: () => {
        try {
          const scan = getScanInstance()
          if (!scan) {
            return {
              totalRenders: 0,
              totalComponents: 0,
              unnecessaryRenders: 0,
              averageRenderTime: 0,
              slowestComponents: [],
            }
          }
          return scan.getPerformanceSummary()
        }
        catch (error) {
          console.error('[React Scan Plugin] Failed to get performance summary:', error)
          return {
            totalRenders: 0,
            totalComponents: 0,
            unnecessaryRenders: 0,
            averageRenderTime: 0,
            slowestComponents: [],
          }
        }
      },

      /**
       * Clear all performance data
       */
      clearPerformanceData: () => {
        try {
          const scan = getScanInstance()
          if (scan) {
            scan.clearPerformanceData()
            return true
          }
          return false
        }
        catch (error) {
          console.error('[React Scan Plugin] Failed to clear performance data:', error)
          return false
        }
      },

      /**
       * Start component inspection mode
       */
      startInspecting: () => {
        try {
          const scan = getScanInstance()
          if (scan) {
            scan.startInspecting()
            return true
          }
          return false
        }
        catch (error) {
          console.error('[React Scan Plugin] Failed to start inspecting:', error)
          return false
        }
      },

      /**
       * Stop component inspection mode
       */
      stopInspecting: () => {
        try {
          const scan = getScanInstance()
          if (scan) {
            scan.stopInspecting()
            return true
          }
          return false
        }
        catch (error) {
          console.error('[React Scan Plugin] Failed to stop inspecting:', error)
          return false
        }
      },

      /**
       * Check if inspection mode is active
       */
      isInspecting: () => {
        try {
          const scan = getScanInstance()
          return scan?.isInspecting() || false
        }
        catch {
          return false
        }
      },

      /**
       * Focus on a specific component
       */
      focusComponent: (fiber: any) => {
        try {
          const scan = getScanInstance()
          if (scan && fiber) {
            scan.focusComponent(fiber)
            return true
          }
          return false
        }
        catch (error) {
          console.error('[React Scan Plugin] Failed to focus component:', error)
          return false
        }
      },

      /**
       * Get currently focused component
       */
      getFocusedComponent: () => {
        try {
          const scan = getScanInstance()
          const component = scan?.getFocusedComponent() || null
          if (component) {
            // Sanitize for RPC - remove non-serializable fields
            const { fiber, domElement, ...serializableComponent } = component as any
            return serializableComponent
          }
          return null
        }
        catch (error) {
          console.error('[React Scan Plugin] Failed to get focused component:', error)
          return null
        }
      },
    },

    /**
     * Event handlers
     */
    on: {
      'component-mounted': (_event: any) => {
        // React Scan automatically tracks component mounts
      },

      'component-updated': (_event: any) => {
        // React Scan automatically tracks component updates
      },
    },
  }
}

/**
 * Default React Scan plugin instance
 */
export const scanPlugin = createScanPlugin()
