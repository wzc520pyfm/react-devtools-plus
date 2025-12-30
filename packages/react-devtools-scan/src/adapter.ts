/**
 * React Scan adapter for React DevTools integration
 * Provides a clean interface to control React Scan from the DevTools UI
 */

import type { AggregatedChanges, ChangeInfo, ComponentPerformanceData, ComponentTreeNode, FocusedComponentRenderInfo, PerformanceSummary, ReactDevtoolsScanOptions, ScanInstance } from './types'
import { _fiberRoots, getDisplayName, getFiberId, isCompositeFiber } from 'bippy'
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
  // react-scan exposes internals at window.__REACT_SCAN__.ReactScanInternals
  try {
    if (typeof window !== 'undefined') {
      // Check parent window first (Host App)
      if (window.parent && window.parent !== window && (window.parent as any).__REACT_SCAN__?.ReactScanInternals) {
        return (window.parent as any).__REACT_SCAN__.ReactScanInternals
      }
      // Then check current window
      if ((window as any).__REACT_SCAN__?.ReactScanInternals) {
        return (window as any).__REACT_SCAN__.ReactScanInternals
      }
    }
  }
  catch {
    // Accessing parent might fail cross-origin
  }
  return ReactScanInternals
}

function getSetOptions() {
  // react-scan exposes setOptions via the module export
  // We need to use the one from the same react-scan instance
  try {
    if (typeof window !== 'undefined') {
      // Check parent window first (Host App)
      if (window.parent && window.parent !== window && (window.parent as any).__REACT_SCAN__?.setOptions) {
        return (window.parent as any).__REACT_SCAN__.setOptions
      }
      // Then check current window
      if ((window as any).__REACT_SCAN__?.setOptions) {
        return (window as any).__REACT_SCAN__.setOptions
      }
    }
  }
  catch {
    // Accessing parent might fail cross-origin
  }
  return setScanOptions
}

function getGetOptions() {
  return getGlobalObject('__REACT_SCAN_GET_OPTIONS__') || getScanOptions
}

function getScan() {
  return getGlobalObject('__REACT_SCAN_SCAN__') || scan
}

/**
 * Update toolbar visibility in the shadow DOM
 */
function updateToolbarVisibility(visible: boolean) {
  if (typeof document === 'undefined')
    return

  try {
    const update = () => {
      const root = document.getElementById('react-scan-root')
      if (!root || !root.shadowRoot)
        return

      let style = root.shadowRoot.getElementById('react-scan-devtools-style')
      if (!style) {
        style = document.createElement('style')
        style.id = 'react-scan-devtools-style'
        root.shadowRoot.appendChild(style)
      }

      style.textContent = visible ? '' : '#react-scan-toolbar { display: none !important; }'
    }

    // Try immediately
    update()

    // And retry in next frame to ensure DOM is ready if just initialized
    requestAnimationFrame(update)
    // And one more time for good measure given React Scan's async nature
    setTimeout(update, 100)
  }
  catch (e) {
    // Ignore errors
  }
}

let scanInstance: ScanInstance | null = null
let currentOptions: ReactDevtoolsScanOptions = {}

// Store for focused component render tracking
interface FocusedComponentTracker {
  componentName: string
  renderCount: number
  changes: AggregatedChanges
  timestamp: number
  unsubscribe: (() => void) | null
}

let focusedComponentTracker: FocusedComponentTracker | null = null
const focusedComponentChangeCallbacks = new Set<(info: FocusedComponentRenderInfo) => void>()

/**
 * Convert react-scan's internal changes format to our serializable format
 */
function convertChangesToSerializable(changesMap: Map<string, any>): ChangeInfo[] {
  const result: ChangeInfo[] = []
  changesMap.forEach((value, key) => {
    result.push({
      name: value.changes?.name || key,
      previousValue: serializeValue(value.changes?.previousValue),
      currentValue: serializeValue(value.changes?.currentValue),
      count: value.changes?.count || 1,
    })
  })
  return result
}

/**
 * Serialize a value for RPC transfer
 */
function serializeValue(value: any): any {
  if (value === undefined)
    return undefined
  if (value === null)
    return null
  if (typeof value === 'function')
    return `[Function: ${value.name || 'anonymous'}]`
  if (typeof value === 'symbol')
    return `[Symbol: ${value.description || ''}]`
  if (value instanceof Element)
    return `[Element: ${value.tagName}]`
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      if (value.length > 10)
        return `[Array(${value.length})]`
      return value.map(serializeValue)
    }
    // Handle React elements
    if (value.$$typeof)
      return `[React Element]`
    // Handle circular references and complex objects
    try {
      const keys = Object.keys(value)
      if (keys.length > 20)
        return `[Object with ${keys.length} keys]`
      const serialized: Record<string, any> = {}
      for (const key of keys.slice(0, 20)) {
        serialized[key] = serializeValue(value[key])
      }
      return serialized
    }
    catch {
      return '[Object]'
    }
  }
  return value
}

/**
 * Get the current focused fiber and its ID
 */
function getFocusedFiberInfo(): { fiber: any, fiberId: string } | null {
  try {
    const { Store } = getInternals()
    if (Store?.inspectState?.value?.kind === 'focused') {
      const fiber = Store.inspectState.value.fiber
      if (fiber) {
        // Use bippy's getFiberId to get the correct fiber ID that matches react-scan's internal usage
        const fiberId = String(getFiberId(fiber))
        return { fiber, fiberId }
      }
    }
    return null
  }
  catch {
    return null
  }
}

/**
 * Subscribe to changes for a specific fiber ID
 */
function subscribeToFiberChanges(fiberId: string, callback: (changes: any) => void): () => void {
  try {
    const { Store } = getInternals()
    if (!Store?.changesListeners)
      return () => {}

    let listeners = Store.changesListeners.get(fiberId)
    if (!listeners) {
      listeners = []
      Store.changesListeners.set(fiberId, listeners)
    }

    listeners.push(callback)

    return () => {
      const currentListeners = Store.changesListeners.get(fiberId)
      if (currentListeners) {
        const index = currentListeners.indexOf(callback)
        if (index > -1) {
          currentListeners.splice(index, 1)
        }
      }
    }
  }
  catch {
    return () => {}
  }
}

/**
 * Setup onRender callback to track focused component renders
 * This is more reliable than changesListeners as it doesn't depend on showToolbar
 */
function setupOnRenderCallback(): () => void {
  try {
    const internals = getInternals()
    if (!internals) {
      return () => {}
    }

    // Get the current onRender callback if any
    const originalOnRender = internals.options?.value?.onRender

    // Create our render tracking callback
    const trackingOnRender = (fiber: any, renders: any[]) => {
      // Call original callback first
      if (originalOnRender) {
        originalOnRender(fiber, renders)
      }

      // Always track fiber render count for component tree
      trackFiberRender(fiber)

      // Check if we have a focused component tracker
      if (!focusedComponentTracker) {
        return
      }

      // Get the fiber name to compare with focused component
      const fiberName = getDisplayName(fiber.type) || 'Unknown'

      // Compare by component name (simpler approach)
      if (fiberName !== focusedComponentTracker.componentName) {
        return
      }

      // Update tracker
      focusedComponentTracker.renderCount++
      focusedComponentTracker.timestamp = Date.now()

      // Extract changes directly from fiber since react-scan's trackChanges is false by default
      const propsChanges: ChangeInfo[] = []
      const stateChanges: ChangeInfo[] = []
      const contextChanges: ChangeInfo[] = []

      try {
        // Get props changes
        const currentProps = fiber.memoizedProps || {}
        const prevProps = fiber.alternate?.memoizedProps || {}

        for (const key of Object.keys(currentProps)) {
          if (key === 'children')
            continue
          const prevValue = prevProps[key]
          const currentValue = currentProps[key]
          if (prevValue !== currentValue) {
            propsChanges.push({
              name: key,
              previousValue: serializeValue(prevValue),
              currentValue: serializeValue(currentValue),
              count: 1,
            })
          }
        }

        // Get state changes (for functional components with hooks)
        let currentState = fiber.memoizedState
        let prevState = fiber.alternate?.memoizedState
        let hookIndex = 0

        while (currentState) {
          // Check if this is a useState/useReducer hook (has memoizedState)
          if (currentState.memoizedState !== undefined) {
            const currentValue = currentState.memoizedState
            const prevValue = prevState?.memoizedState

            if (prevValue !== currentValue && prevState) {
              stateChanges.push({
                name: `Hook ${hookIndex + 1}`,
                previousValue: serializeValue(prevValue),
                currentValue: serializeValue(currentValue),
                count: 1,
              })
            }
          }

          currentState = currentState.next
          prevState = prevState?.next
          hookIndex++
        }
      }
      catch {
        // Ignore extraction errors
      }

      // Accumulate changes - increment count if same name exists, otherwise add new
      for (const change of propsChanges) {
        const existing = focusedComponentTracker.changes.propsChanges.find(c => c.name === change.name)
        if (existing) {
          existing.count++
          existing.previousValue = change.previousValue
          existing.currentValue = change.currentValue
        }
        else {
          focusedComponentTracker.changes.propsChanges.push(change)
        }
      }

      for (const change of stateChanges) {
        const existing = focusedComponentTracker.changes.stateChanges.find(c => c.name === change.name)
        if (existing) {
          existing.count++
          existing.previousValue = change.previousValue
          existing.currentValue = change.currentValue
        }
        else {
          focusedComponentTracker.changes.stateChanges.push(change)
        }
      }

      for (const change of contextChanges) {
        const existing = focusedComponentTracker.changes.contextChanges.find(c => c.name === change.name)
        if (existing) {
          existing.count++
          existing.previousValue = change.previousValue
          existing.currentValue = change.currentValue
        }
        else {
          focusedComponentTracker.changes.contextChanges.push(change)
        }
      }

      // Notify all callbacks
      const info: FocusedComponentRenderInfo = {
        componentName: focusedComponentTracker.componentName,
        renderCount: focusedComponentTracker.renderCount,
        changes: focusedComponentTracker.changes,
        timestamp: focusedComponentTracker.timestamp,
      }

      focusedComponentChangeCallbacks.forEach((cb) => {
        try {
          cb(info)
        }
        catch {
          // Ignore callback errors
        }
      })
    }

    // Set onRender directly on window.__REACT_SCAN__.ReactScanInternals.options.value
    try {
      const globalReactScan = (window as any).__REACT_SCAN__
      if (globalReactScan?.ReactScanInternals?.options?.value) {
        const currentOpts = globalReactScan.ReactScanInternals.options.value
        globalReactScan.ReactScanInternals.options.value = {
          ...currentOpts,
          onRender: trackingOnRender,
        }
      }
    }
    catch {
      // Ignore errors setting onRender
    }

    // Ensure instrumentation is not paused if we want to track renders
    if (internals.instrumentation?.isPaused) {
      internals.instrumentation.isPaused.value = false
    }

    return () => {
      // Restore original onRender callback
      try {
        const globalReactScan = (window as any).__REACT_SCAN__
        if (globalReactScan?.ReactScanInternals?.options?.value) {
          globalReactScan.ReactScanInternals.options.value.onRender = originalOnRender || null
        }
      }
      catch (e) {
        // ignore
      }
    }
  }
  catch {
    return () => {}
  }
}

// Track whether onRender callback is set up
let onRenderCleanup: (() => void) | null = null

// Internal FPS counter
let fps = 60
let frameCount = 0
let lastTime = typeof performance !== 'undefined' ? performance.now() : Date.now()

const updateFPS = () => {
  if (typeof performance === 'undefined' || typeof requestAnimationFrame === 'undefined')
    return

  frameCount++
  const now = performance.now()
  if (now - lastTime >= 1000) {
    fps = frameCount
    frameCount = 0
    lastTime = now
  }
  requestAnimationFrame(updateFPS)
}

// Start FPS tracking
if (typeof requestAnimationFrame !== 'undefined') {
  requestAnimationFrame(updateFPS)
}

// Component render count tracking
const componentRenderCounts = new Map<number, number>()

/**
 * Find React fiber from a DOM element
 */
function getFiberFromElement(element: Element): any {
  // React 16+ uses __reactFiber$ prefix
  // React 17+ might use __reactInternalInstance$
  const keys = Object.keys(element)
  for (const key of keys) {
    if (key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$')) {
      return (element as any)[key]
    }
  }
  return null
}

/**
 * Find the root fiber by traversing up the tree
 */
function findRootFiber(fiber: any): any {
  if (!fiber)
    return null

  let current = fiber
  while (current.return) {
    current = current.return
  }

  // current is now the HostRoot fiber
  // The FiberRoot is stored in current.stateNode
  return current.stateNode || current
}

/**
 * Get fiber roots by finding React root containers in the DOM
 */
function getFiberRoots(): Set<any> {
  const roots = new Set<any>()

  const findRootsInDocument = (doc: Document) => {
    try {
      // Common React root element IDs
      const rootSelectors = ['#root', '#app', '#__next', '[data-reactroot]', '#react-root']

      for (const selector of rootSelectors) {
        const elements = doc.querySelectorAll(selector)
        elements.forEach((element) => {
          // Try the element itself first
          let fiber = getFiberFromElement(element)

          // If not found, try the first child element (React usually attaches fiber to rendered elements)
          if (!fiber && element.firstElementChild) {
            fiber = getFiberFromElement(element.firstElementChild)
          }

          // Try any descendant with fiber
          if (!fiber) {
            const descendants = element.querySelectorAll('*')
            for (const desc of descendants) {
              fiber = getFiberFromElement(desc)
              if (fiber)
                break
            }
          }

          if (fiber) {
            const rootFiber = findRootFiber(fiber)
            if (rootFiber) {
              roots.add(rootFiber)
            }
          }
        })
      }

      // Also try to find any element with React fiber
      if (roots.size === 0) {
        const allElements = doc.querySelectorAll('*')
        for (const element of allElements) {
          const fiber = getFiberFromElement(element)
          if (fiber) {
            const rootFiber = findRootFiber(fiber)
            if (rootFiber) {
              roots.add(rootFiber)
              break // Found one root, that's enough
            }
          }
        }
      }
    }
    catch {
      // Ignore errors
    }
  }

  try {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // Try parent window first (Host App where React runs)
      if (window.parent && window.parent !== window) {
        try {
          findRootsInDocument(window.parent.document)
        }
        catch {
          // Cross-origin access denied
        }
      }

      // Also try current window
      if (roots.size === 0) {
        findRootsInDocument(document)
      }
    }

    // Fallback: Try bippy's _fiberRoots
    if (roots.size === 0 && _fiberRoots) {
      // WeakSet cannot be iterated, but we can try to use it if it's actually a Set
      if (typeof (_fiberRoots as any).forEach === 'function') {
        (_fiberRoots as any).forEach((root: any) => roots.add(root))
      }
    }
  }
  catch {
    // Ignore errors
  }

  return roots
}

/**
 * Get render count for a fiber from react-scan's reportData
 */
function getFiberRenderCount(fiber: any): number {
  try {
    const fiberId = getFiberId(fiber)
    // Check our local tracking first
    const localCount = componentRenderCounts.get(fiberId)
    if (localCount !== undefined) {
      return localCount
    }

    // Try to get from react-scan's Store.reportData
    const { Store } = getInternals()
    if (Store?.reportData) {
      const componentName = getDisplayName(fiber.type) || 'Unknown'
      let totalCount = 0
      Store.reportData.forEach((data: any) => {
        if (data.componentName === componentName) {
          totalCount += data.count || 0
        }
      })
      return totalCount
    }
  }
  catch {
    // Ignore errors
  }
  return 0
}

/**
 * Collect all composite component descendants from a fiber subtree
 */
function collectCompositeDescendants(fiber: any, depth: number, maxDepth: number, results: ComponentTreeNode[]): void {
  if (!fiber || depth > maxDepth)
    return

  try {
    const isComposite = isCompositeFiber(fiber)
    const name = getDisplayName(fiber.type)

    if (isComposite && name) {
      // Found a composite component, add it to results
      const node = buildTreeNode(fiber, depth, maxDepth)
      if (node) {
        results.push(node)
      }
    }
    else {
      // Not composite, continue searching in children
      let child = fiber.child
      while (child) {
        collectCompositeDescendants(child, depth, maxDepth, results)
        child = child.sibling
      }
    }
  }
  catch {
    // Ignore errors
  }
}

/**
 * Build component tree node from fiber
 */
function buildTreeNode(fiber: any, depth: number = 0, maxDepth: number = 50): ComponentTreeNode | null {
  if (!fiber || depth > maxDepth)
    return null

  try {
    // Only include composite components (not DOM elements)
    const isComposite = isCompositeFiber(fiber)
    const name = getDisplayName(fiber.type)

    // For composite components, create a node
    if (isComposite && name) {
      const fiberId = getFiberId(fiber)
      const renderCount = getFiberRenderCount(fiber)

      const node: ComponentTreeNode = {
        id: String(fiberId),
        name,
        type: typeof fiber.type === 'function' ? 'function' : 'class',
        renderCount,
        lastRenderTime: 0,
        children: [],
      }

      // Process children - collect all composite descendants
      let child = fiber.child
      while (child) {
        collectCompositeDescendants(child, depth + 1, maxDepth, node.children)
        child = child.sibling
      }

      return node
    }

    // For non-composite fibers, traverse children to find composite descendants
    let child = fiber.child
    const compositeChildren: ComponentTreeNode[] = []
    while (child) {
      collectCompositeDescendants(child, depth, maxDepth, compositeChildren)
      child = child.sibling
    }

    // If we found composite children but this fiber isn't composite,
    // return the first child as a proxy (or null if multiple)
    if (compositeChildren.length === 1) {
      return compositeChildren[0]
    }

    return null
  }
  catch {
    return null
  }
}

/**
 * Extract component tree from fiber roots
 */
function extractComponentTree(): ComponentTreeNode[] {
  const trees: ComponentTreeNode[] = []

  try {
    const fiberRoots = getFiberRoots()

    fiberRoots.forEach((root: any) => {
      // FiberRoot has current property pointing to the HostRoot fiber
      const rootFiber = root.current || root
      if (!rootFiber)
        return

      // The actual component tree starts from the HostRoot's child
      let child = rootFiber.child
      while (child) {
        const node = buildTreeNode(child, 0)
        if (node) {
          trees.push(node)
        }
        child = child.sibling
      }
    })
  }
  catch {
    // Ignore errors
  }

  return trees
}

/**
 * Track render count for a fiber (called from onRender callback)
 */
function trackFiberRender(fiber: any): void {
  try {
    const fiberId = getFiberId(fiber)
    const current = componentRenderCounts.get(fiberId) || 0
    componentRenderCounts.set(fiberId, current + 1)
  }
  catch {
    // Ignore errors
  }
}

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
  catch {
    // Ignore extraction errors
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

      // We need to force showToolbar to true in the actual options passed to react-scan
      // so that the container/inspector is initialized. We'll handle visibility via CSS.
      const effectiveOptions = { ...currentOptions }
      if (effectiveOptions.enabled) {
        effectiveOptions.showToolbar = true
      }

      if (currentOptions.enabled) {
        const scanFn = getScan()
        if (scanFn) {
          scanFn(effectiveOptions)
        }
        else {
          getSetOptions()(effectiveOptions)
        }

        // Apply visibility override
        updateToolbarVisibility(!!currentOptions.showToolbar)
      }
      else {
        getSetOptions()(effectiveOptions)
      }
    },

    start: () => {
      const internals = getInternals()
      const { instrumentation } = internals || {}

      if (instrumentation && instrumentation.isPaused) {
        instrumentation.isPaused.value = false
      }

      const options = { ...currentOptions, enabled: true }
      // Force showToolbar to true
      const effectiveOptions = { ...options, showToolbar: true }

      const scanFn = getScan()
      const isInstrumented = internals?.instrumentation && !internals.instrumentation.isPaused.value

      // Only reinitialize if not already instrumented
      if (scanFn) {
        // Always call scanFn to ensure options are applied and it's active
        scanFn(effectiveOptions)
      }
      else {
        // Fallback to setOptions if scanFn not available
        const current = getGetOptions()()?.value || {}
        const hasChanges = Object.keys(effectiveOptions).some((key) => {
          return effectiveOptions[key as keyof ReactDevtoolsScanOptions] !== current[key as keyof typeof current]
        })

        if (hasChanges || !isInstrumented) {
          getSetOptions()(effectiveOptions)
        }
      }

      currentOptions = options
      // Apply visibility override
      updateToolbarVisibility(!!currentOptions.showToolbar)

      // Re-apply onRender callback AFTER scan() has reset options
      // This is critical because scan() calls setOptions() which replaces the entire options.value object
      if (onRenderCleanup) {
        onRenderCleanup()
      }
      onRenderCleanup = setupOnRenderCallback()
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
      currentOptions.showToolbar = false
      updateToolbarVisibility(false)
    },

    showToolbar: () => {
      currentOptions.showToolbar = true
      updateToolbarVisibility(true)
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
      catch {
        // Ignore errors
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
      catch {
        // Ignore errors
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
      catch {
        // Ignore errors
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
      catch {
        // Ignore errors
      }
    },

    getFocusedComponent: () => {
      try {
        const { Store } = getInternals()
        if (Store?.inspectState) {
          const state = Store.inspectState.value
          if (state.kind === 'focused') {
            const fiberId = getFiberId(state.fiber)
            return {
              componentName: getDisplayName(state.fiber.type) || 'Unknown',
              componentId: String(fiberId),
              fiber: state.fiber,
              domElement: state.focusedDomElement,
            }
          }
        }
        return null
      }
      catch {
        return null
      }
    },

    onInspectStateChange: (callback: (state: any) => void) => {
      try {
        const { Store } = getInternals()
        if (Store?.inspectState) {
          // Set up the onRender callback for tracking renders
          if (!onRenderCleanup) {
            onRenderCleanup = setupOnRenderCallback()
          }

          // Subscribe to inspect state changes
          const unsubscribe = Store.inspectState.subscribe((state: any) => {
            // Update focused component tracker when state changes
            if (state.kind === 'focused') {
              const componentName = getDisplayName(state.fiber?.type) || 'Unknown'
              const fiberInfo = getFocusedFiberInfo()

              // Initialize or update tracker
              if (!focusedComponentTracker || focusedComponentTracker.componentName !== componentName) {
                // Clean up previous subscription
                if (focusedComponentTracker?.unsubscribe) {
                  focusedComponentTracker.unsubscribe()
                }

                focusedComponentTracker = {
                  componentName,
                  renderCount: 0,
                  changes: { propsChanges: [], stateChanges: [], contextChanges: [] },
                  timestamp: Date.now(),
                  unsubscribe: null,
                }

                // Subscribe to changes for this fiber using the correct fiberId from bippy
                // This is a backup mechanism - main tracking is done via onRender callback
                if (fiberInfo) {
                  focusedComponentTracker.unsubscribe = subscribeToFiberChanges(fiberInfo.fiberId, (changes: any) => {
                    if (focusedComponentTracker) {
                      focusedComponentTracker.renderCount++
                      focusedComponentTracker.timestamp = Date.now()

                      // Convert changes to serializable format
                      // changes is { propsChanges: [...], stateChanges: [...], contextChanges: [...] }
                      if (changes.propsChanges && Array.isArray(changes.propsChanges)) {
                        focusedComponentTracker.changes.propsChanges = changes.propsChanges.map((c: any) => ({
                          name: c.name || 'unknown',
                          previousValue: serializeValue(c.prevValue),
                          currentValue: serializeValue(c.value),
                          count: 1,
                        }))
                      }
                      if (changes.stateChanges && Array.isArray(changes.stateChanges)) {
                        focusedComponentTracker.changes.stateChanges = changes.stateChanges.map((c: any) => ({
                          name: c.name || `Hook ${c.index || 0}`,
                          previousValue: serializeValue(c.prevValue),
                          currentValue: serializeValue(c.value),
                          count: 1,
                        }))
                      }
                      if (changes.contextChanges && Array.isArray(changes.contextChanges)) {
                        focusedComponentTracker.changes.contextChanges = changes.contextChanges.map((c: any) => ({
                          name: c.name || 'Context',
                          previousValue: serializeValue(c.prevValue),
                          currentValue: serializeValue(c.value),
                          count: 1,
                        }))
                      }

                      // Notify all callbacks
                      const info: FocusedComponentRenderInfo = {
                        componentName: focusedComponentTracker.componentName,
                        renderCount: focusedComponentTracker.renderCount,
                        changes: focusedComponentTracker.changes,
                        timestamp: focusedComponentTracker.timestamp,
                      }

                      focusedComponentChangeCallbacks.forEach((cb) => {
                        try {
                          cb(info)
                        }
                        catch {
                          // Ignore callback errors
                        }
                      })
                    }
                  })
                }
              }
            }
            else if (state.kind === 'inspect-off') {
              // Don't clear the tracker here - it will be managed by setFocusedComponentByName
              // The tracker needs to persist to continue tracking renders after selection
            }

            // Call the original callback
            callback(state)
          })
          return unsubscribe
        }
        return () => {}
      }
      catch {
        return () => {}
      }
    },

    getFPS: () => fps,

    getFocusedComponentRenderInfo: () => {
      if (!focusedComponentTracker)
        return null

      return {
        componentName: focusedComponentTracker.componentName,
        renderCount: focusedComponentTracker.renderCount,
        changes: focusedComponentTracker.changes,
        timestamp: focusedComponentTracker.timestamp,
      }
    },

    onFocusedComponentChange: (callback: (info: FocusedComponentRenderInfo) => void) => {
      focusedComponentChangeCallbacks.add(callback)
      return () => {
        focusedComponentChangeCallbacks.delete(callback)
      }
    },

    /**
     * Set the focused component by name for render tracking
     * This is used when inspectState.kind is not 'focused' but we still want to track renders
     */
    setFocusedComponentByName: (componentName: string) => {
      // Clean up previous tracker
      if (focusedComponentTracker?.unsubscribe) {
        focusedComponentTracker.unsubscribe()
      }

      // Create new tracker
      focusedComponentTracker = {
        componentName,
        renderCount: 0,
        changes: { propsChanges: [], stateChanges: [], contextChanges: [] },
        timestamp: Date.now(),
        unsubscribe: null,
      }

      // Ensure onRender callback is set up for tracking
      if (!onRenderCleanup) {
        onRenderCleanup = setupOnRenderCallback()
      }
    },

    clearFocusedComponentChanges: () => {
      if (focusedComponentTracker) {
        focusedComponentTracker.renderCount = 0
        focusedComponentTracker.changes = { propsChanges: [], stateChanges: [], contextChanges: [] }
        focusedComponentTracker.timestamp = Date.now()
      }
    },

    /**
     * Get the component tree with render counts
     */
    getComponentTree: () => {
      return extractComponentTree()
    },

    /**
     * Clear component render count tracking
     */
    clearComponentTree: () => {
      componentRenderCounts.clear()
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
