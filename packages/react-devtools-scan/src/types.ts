/**
 * Type definitions for React DevTools Scan integration
 */

import type { Options as ReactScanOptions } from 'react-scan'

/**
 * Integration modes for React Scan
 */
export type IntegrationMode = 'overlay' | 'panel' | 'both'

/**
 * Extended options for React DevTools Scan integration
 */
export interface ReactDevtoolsScanOptions extends ReactScanOptions {
  /**
   * Integration mode - how scan should be displayed
   * - 'overlay': Show as overlay on the page (default react-scan behavior)
   * - 'panel': Integrate into DevTools panel
   * - 'both': Show both overlay and panel integration
   *
   * @default 'overlay'
   */
  integrationMode?: IntegrationMode

  /**
   * Whether to sync state with DevTools panel
   *
   * @default true
   */
  syncWithDevtools?: boolean
}

/**
 * Scan instance interface
 */
/**
 * Performance metrics for a component
 */
export interface ComponentPerformanceData {
  componentName: string
  renderCount: number
  totalTime: number
  averageTime: number
  unnecessaryRenders: number
  lastRenderTime: number | null
}

/**
 * Aggregated performance summary
 */
export interface PerformanceSummary {
  totalRenders: number
  totalComponents: number
  unnecessaryRenders: number
  averageRenderTime: number
  slowestComponents: ComponentPerformanceData[]
}

/**
 * Component info for selection
 */
export interface ComponentInfo {
  componentName: string
  fiber: any // Fiber reference
  domElement: Element | null
}

/**
 * Change info for a single prop/state/context value
 */
export interface ChangeInfo {
  name: string
  previousValue: any
  currentValue: any
  count: number
}

/**
 * Aggregated changes for a component render
 */
export interface AggregatedChanges {
  propsChanges: ChangeInfo[]
  stateChanges: ChangeInfo[]
  contextChanges: ChangeInfo[]
}

/**
 * Focused component render info with changes
 */
export interface FocusedComponentRenderInfo {
  componentName: string
  renderCount: number
  changes: AggregatedChanges
  timestamp: number
}

export interface ScanInstance {
  /**
   * Get current scan options
   */
  getOptions: () => ReactDevtoolsScanOptions

  /**
   * Update scan options at runtime
   */
  setOptions: (options: Partial<ReactDevtoolsScanOptions>) => void

  /**
   * Start scanning
   */
  start: () => void

  /**
   * Stop scanning
   */
  stop: () => void

  /**
   * Check if scanning is active
   */
  isActive: () => boolean

  /**
   * Hide the React Scan toolbar
   */
  hideToolbar: () => void

  /**
   * Show the React Scan toolbar
   */
  showToolbar: () => void

  /**
   * Get toolbar visibility state
   */
  getToolbarVisibility: () => boolean

  /**
   * Get performance data for all components
   */
  getPerformanceData: () => ComponentPerformanceData[]

  /**
   * Get aggregated performance summary
   */
  getPerformanceSummary: () => PerformanceSummary

  /**
   * Clear all performance data
   */
  clearPerformanceData: () => void

  /**
   * Start component inspection mode
   */
  startInspecting: () => void

  /**
   * Stop component inspection mode
   */
  stopInspecting: () => void

  /**
   * Check if inspection mode is active
   */
  isInspecting: () => boolean

  /**
   * Focus on a specific component by fiber
   */
  focusComponent: (fiber: any) => void

  /**
   * Get currently focused component
   */
  getFocusedComponent: () => ComponentInfo | null

  /**
   * Subscribe to inspection state changes
   */
  onInspectStateChange: (callback: (state: any) => void) => () => void

  /**
   * Get current FPS
   */
  getFPS: () => number

  /**
   * Get focused component render info with changes
   */
  getFocusedComponentRenderInfo: () => FocusedComponentRenderInfo | null

  /**
   * Subscribe to focused component changes (re-renders)
   */
  onFocusedComponentChange: (callback: (info: FocusedComponentRenderInfo) => void) => () => void

  /**
   * Clear the focused component's change history
   */
  clearFocusedComponentChanges: () => void

  /**
   * Set the focused component by name for render tracking
   * This is used when inspectState.kind is not 'focused' but we still want to track renders
   */
  setFocusedComponentByName: (componentName: string) => void
}

/**
 * Component render information
 */
export interface RenderInfo {
  componentName: string
  renderTime: number
  timestamp: number
  reason?: string
  unnecessary?: boolean
}

/**
 * Component statistics
 */
export interface ComponentStats {
  id: string
  name: string
  renderCount: number
  totalTime: number
  averageTime: number
  lastRenderTime: number
  renders: RenderInfo[]
  unnecessary?: number
}

/**
 * Component tree node
 */
export interface ComponentTreeNode {
  id: string
  name: string
  type: string
  renderCount: number
  lastRenderTime: number
  averageTime?: number
  unnecessary?: number
  children: ComponentTreeNode[]
  fiber?: any
}

/**
 * Performance data aggregation
 */
export interface PerformanceData {
  components: Map<string, ComponentStats>
  totalRenders: number
  averageRenderTime: number
  slowestComponents: ComponentStats[]
  mostRenderedComponents: ComponentStats[]
  timestamp: number
}
