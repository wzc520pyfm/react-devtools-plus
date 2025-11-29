/**
 * React Scan adapter for React DevTools integration
 * Provides a clean interface to control React Scan from the DevTools UI
 */

import type { ComponentPerformanceData, PerformanceSummary, ReactDevtoolsScanOptions, ScanInstance } from './types'
import { getDisplayName } from 'bippy'
import { getOptions as getScanOptions, ReactScanInternals, scan, setOptions as setScanOptions } from 'react-scan'

// Helper to get shared internals from global window
function getGlobalObject(key: string) {
  if (typeof window === 'undefined')
    return undefined

  // Check parent window (Host App) first
  try {
    if (window.parent && window.parent !== window && (window.parent as any)[key]) {
      return (window.parent as any)[key]
    }
  }
  catch (e) {
    // Accessing parent might fail cross-origin
  }

  // Fallback to current window
  if ((window as any)[key]) {
    return (window as any)[key]
  }

  return undefined
}

function getInternals() {
  return getGlobalObject('__REACT_SCAN_INTERNALS__') || ReactScanInternals
}

function getSetOptions() {
  return getGlobalObject('__REACT_SCAN_SET_OPTIONS__') || setScanOptions
}

function getGetOptions() {
  return getGlobalObject('__REACT_SCAN_GET_OPTIONS__') || getScanOptions
}

function getScan() {
  return getGlobalObject('__REACT_SCAN_SCAN__') || scan
}

let scanInstance: ScanInstance | null = null
let currentOptions: ReactDevtoolsScanOptions = {}

/**
 * Extract performance data from React Scan internals
 */
function extractPerformanceData(): ComponentPerformanceData[] {
  const performanceData: ComponentPerformanceData[] = []

  try {
    const { Store } = getInternals()

    if (!Store || !Store.reportData) {
      return performanceData
    }

    const componentStats = new Map<string, {
      renderCount: number
      totalTime: number
      unnecessaryRenders: number
      lastRenderTime: number | null
    }>()

    Store.reportData.forEach((renderData) => {
      const componentName = renderData.componentName || 'Unknown'
      const existing = componentStats.get(componentName) || {
        renderCount: 0,
        totalTime: 0,
        unnecessaryRenders: 0,
        lastRenderTime: null,
      }

      existing.renderCount += renderData.count || 0
      existing.totalTime += renderData.time || 0

      if (renderData.unnecessary) {
        existing.unnecessaryRenders++
      }

      if (renderData.time !== null && renderData.time !== undefined) {
        existing.lastRenderTime = renderData.time
      }

      componentStats.set(componentName, existing)
    })

    componentStats.forEach((stats, componentName) => {
      performanceData.push({
        componentName,
        renderCount: stats.renderCount,
        totalTime: stats.totalTime,
        averageTime: stats.renderCount > 0 ? stats.totalTime / stats.renderCount : 0,
        unnecessaryRenders: stats.unnecessaryRenders,
        lastRenderTime: stats.lastRenderTime,
      })
    })

    performanceData.sort((a, b) => b.totalTime - a.totalTime)
  }
  catch (error) {
    console.error('[React Scan] Failed to extract performance data:', error)
  }

  return performanceData
}

/**
 * Calculate performance summary
 */
function calculatePerformanceSummary(data: ComponentPerformanceData[]): PerformanceSummary {
  const totalRenders = data.reduce((sum, item) => sum + item.renderCount, 0)
  const totalComponents = data.length
  const unnecessaryRenders = data.reduce((sum, item) => sum + item.unnecessaryRenders, 0)
  const totalTime = data.reduce((sum, item) => sum + item.totalTime, 0)
  const averageRenderTime = totalRenders > 0 ? totalTime / totalRenders : 0
  const slowestComponents = data.slice(0, 10)

  return {
    totalRenders,
    totalComponents,
    unnecessaryRenders,
    averageRenderTime,
    slowestComponents,
  }
}

/**
 * Create a scan instance with DevTools integration
 */
function createScanInstance(options: ReactDevtoolsScanOptions): ScanInstance {
  currentOptions = options

  return {
    getOptions: () => currentOptions,

    setOptions: (newOptions: Partial<ReactDevtoolsScanOptions>) => {
      currentOptions = { ...currentOptions, ...newOptions }

      if (currentOptions.enabled) {
        const scanFn = getScan()
        if (scanFn) {
          scanFn(currentOptions)
        }
        else {
          getSetOptions()(currentOptions)
        }
      }
      else {
        getSetOptions()(currentOptions)
      }
    },

    start: () => {
      const internals = getInternals()
      const { instrumentation } = internals || {}

      if (instrumentation && instrumentation.isPaused) {
        instrumentation.isPaused.value = false
      }

      const options = { ...currentOptions, enabled: true }
      const scanFn = getScan()
      const isInstrumented = internals?.instrumentation && !internals.instrumentation.isPaused.value

      // Only reinitialize if not already instrumented
      if (scanFn) {
        // Always call scanFn to ensure options are applied and it's active
        // Even if instrumented, we need to ensure it's using our options
        scanFn(options)
      }
      else {
        // Fallback to setOptions if scanFn not available
        const current = getGetOptions()()?.value || {}
        const hasChanges = Object.keys(options).some((key) => {
          return options[key as keyof ReactDevtoolsScanOptions] !== current[key as keyof typeof current]
        })

        if (hasChanges || !isInstrumented) {
          getSetOptions()(options)
        }
      }

      currentOptions = options
    },

    stop: () => {
      const options = { ...currentOptions, enabled: false }
      currentOptions = options
      getSetOptions()(options)
    },

    isActive: () => {
      const opts = getGetOptions()()
      if (opts && typeof opts === 'object' && 'value' in opts) {
        return opts.value.enabled === true
      }
      return opts?.enabled === true
    },

    hideToolbar: () => {
      getSetOptions()({ showToolbar: false })
    },

    showToolbar: () => {
      getSetOptions()({ showToolbar: true })
    },

    getToolbarVisibility: () => {
      const opts = getGetOptions()()
      if (opts && typeof opts === 'object' && 'value' in opts) {
        return opts.value.showToolbar !== false
      }
      return opts?.showToolbar !== false
    },

    getPerformanceData: () => {
      return extractPerformanceData()
    },

    getPerformanceSummary: () => {
      const data = extractPerformanceData()
      return calculatePerformanceSummary(data)
    },

    clearPerformanceData: () => {
      try {
        const { Store } = getInternals()
        if (Store?.reportData) {
          Store.reportData.clear()
        }
        if (Store?.legacyReportData) {
          Store.legacyReportData.clear()
        }
      }
      catch (error) {
        console.error('[React Scan] Failed to clear performance data:', error)
      }
    },

    startInspecting: () => {
      try {
        const { Store } = getInternals()
        if (Store?.inspectState) {
          Store.inspectState.value = {
            kind: 'inspecting',
            hoveredDomElement: null,
          }
        }
      }
      catch (error) {
        console.error('[React Scan] Failed to start inspecting:', error)
      }
    },

    stopInspecting: () => {
      try {
        const { Store } = getInternals()
        if (Store?.inspectState) {
          Store.inspectState.value = {
            kind: 'inspect-off',
          }
        }
      }
      catch (error) {
        console.error('[React Scan] Failed to stop inspecting:', error)
      }
    },

    isInspecting: () => {
      try {
        const { Store } = getInternals()
        if (Store?.inspectState) {
          return Store.inspectState.value.kind === 'inspecting'
        }
        return false
      }
      catch {
        return false
      }
    },

    focusComponent: (fiber: any) => {
      try {
        const { Store } = getInternals()
        if (!fiber || !Store?.inspectState)
          return

        let domElement: Element | null = null
        if (fiber.stateNode && fiber.stateNode instanceof Element) {
          domElement = fiber.stateNode
        }

        if (domElement) {
          Store.inspectState.value = {
            kind: 'focused',
            focusedDomElement: domElement,
            fiber,
          }
        }
      }
      catch (error) {
        console.error('[React Scan] Failed to focus component:', error)
      }
    },

    getFocusedComponent: () => {
      try {
        const { Store } = getInternals()
        if (Store?.inspectState) {
          const state = Store.inspectState.value
          if (state.kind === 'focused') {
            return {
              componentName: getDisplayName(state.fiber.type) || 'Unknown',
              fiber: state.fiber,
              domElement: state.focusedDomElement,
            }
          }
        }
        return null
      }
      catch (error) {
        console.error('[React Scan] Failed to get focused component:', error)
        return null
      }
    },

    onInspectStateChange: (callback: (state: any) => void) => {
      try {
        const { Store } = getInternals()
        if (Store?.inspectState) {
          return Store.inspectState.subscribe(callback)
        }
        return () => {}
      }
      catch (error) {
        console.error('[React Scan] Failed to subscribe to inspect state:', error)
        return () => {}
      }
    },
  }
}

/**
 * Get or create the scan instance
 */
export function getScanInstance(options?: ReactDevtoolsScanOptions): ScanInstance {
  if (!scanInstance && options) {
    scanInstance = createScanInstance(options)
  }

  if (!scanInstance) {
    throw new Error('Scan instance not initialized. Call initScan first.')
  }

  return scanInstance
}

/**
 * Reset the scan instance
 */
export function resetScanInstance(): void {
  scanInstance = null
  currentOptions = {}
}
