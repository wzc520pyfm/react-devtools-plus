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
          // Track the last hovered component during inspection
          let lastInspectedComponent: { componentName: string } | null = null

          scan.onInspectStateChange((state: any) => {
            // Emit inspect state change event
            // Sanitize state for RPC
            const sanitizedState = {
              kind: state.kind,
              // Include component name if available
              componentName: state.fiber ? (state.fiber.type?.displayName || state.fiber.type?.name || 'Unknown') : undefined,
            }
            emit('inspect-state-changed', sanitizedState)

            // Track component during inspecting state
            if (state.kind === 'inspecting' && state.hoveredDomElement) {
              // Try to get component name from the hovered element
              // This will be used when inspection ends
            }

            // If a component is focused, emit focused component info and set up tracking
            if (state.kind === 'focused') {
              const focusedComponent = scan.getFocusedComponent()
              if (focusedComponent) {
                // Sanitize for RPC - remove non-serializable fields
                const { fiber, domElement, ...serializableComponent } = focusedComponent as any
                emit('component-focused', serializableComponent)
                // Set up render tracking
                scan.setFocusedComponentByName(focusedComponent.componentName)
              }
            }

            // When inspection ends (inspect-off), check if we had a hovered component
            // and emit it as focused
            if (state.kind === 'inspect-off' && lastInspectedComponent) {
              emit('component-focused', lastInspectedComponent)
              scan.setFocusedComponentByName(lastInspectedComponent.componentName)
              lastInspectedComponent = null
            }
          })

          // Subscribe to focused component render changes
          scan.onFocusedComponentChange((info) => {
            // Emit focused component render event with changes
            console.log('[React Scan Plugin] Focused component changed:', info)
            emit('focused-component-render', info)
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
       * Get current FPS
       */
      getFPS: () => {
        try {
          const scan = getScanInstance()
          return scan?.getFPS() || 0
        }
        catch {
          return 0
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

      /**
       * Get focused component render info with changes
       */
      getFocusedComponentRenderInfo: () => {
        try {
          const scan = getScanInstance()
          return scan?.getFocusedComponentRenderInfo() || null
        }
        catch (error) {
          console.error('[React Scan Plugin] Failed to get focused component render info:', error)
          return null
        }
      },

      /**
       * Clear focused component changes
       */
      clearFocusedComponentChanges: () => {
        try {
          const scan = getScanInstance()
          if (scan) {
            scan.clearFocusedComponentChanges()
            return true
          }
          return false
        }
        catch (error) {
          console.error('[React Scan Plugin] Failed to clear focused component changes:', error)
          return false
        }
      },

      /**
       * Set focused component by name for render tracking
       */
      setFocusedComponentByName: (componentName: string) => {
        try {
          const scan = getScanInstance()
          if (scan && componentName) {
            scan.setFocusedComponentByName(componentName)
            return true
          }
          return false
        }
        catch (error) {
          console.error('[React Scan Plugin] Failed to set focused component by name:', error)
          return false
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
