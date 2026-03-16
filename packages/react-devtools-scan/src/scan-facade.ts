/**
 * Scan Facade — direct integration with the local scan engine.
 *
 * Replaces the old adapter.ts that bridged the DevTools to an external
 * react-scan package via window globals. All engine access is now through
 * direct ES-module imports.
 */

import type {
  AggregatedChanges,
  ComponentPerformanceData,
  ComponentTreeNode,
  FocusedComponentRenderInfo,
  PerformanceSummary,
  ReactDevtoolsScanOptions,
  ScanInstance,
} from './types'
import { _fiberRoots, getDisplayName, getFiberId, isCompositeFiber } from 'bippy'
import {
  ReactScanInternals as _ReactScanInternals,
  Store as _Store,
  addOnRenderListener,
  getRenderCount,
  scan,
  setOptions as setScanOptions,
} from './core/index'

// When the Vite plugin injects a pre-built scan.js bundle AND the overlay loads
// scan from source, two separate module instances of Store/ReactScanInternals
// exist. The pre-built bundle sets window.__REACT_SCAN_INTERNALS__ during
// initScan(). We always prefer that global instance so the facade operates on
// the same objects the toolbar/ScanOverlay already subscribe to.
function getInternals(): typeof _ReactScanInternals {
  if (typeof window !== 'undefined' && (window as any).__REACT_SCAN_INTERNALS__) {
    return (window as any).__REACT_SCAN_INTERNALS__
  }
  return _ReactScanInternals
}

function getStore(): typeof _Store {
  return getInternals().Store
}

// Proxies that always access the runtime-global instances
const ReactScanInternals = new Proxy({} as typeof _ReactScanInternals, {
  get(_target, prop, receiver) {
    return Reflect.get(getInternals(), prop, receiver)
  },
  set(_target, prop, value, receiver) {
    return Reflect.set(getInternals(), prop, value, receiver)
  },
})

const Store = new Proxy({} as typeof _Store, {
  get(_target, prop, receiver) {
    return Reflect.get(getStore(), prop, receiver)
  },
  set(_target, prop, value, receiver) {
    return Reflect.set(getStore(), prop, value, receiver)
  },
})

/**
 * Inject positioning CSS for ScanOverlay into a shadow root.
 * The pre-built scan.js CSS may lack compiled Tailwind utilities,
 * so we ensure the critical layout rules are present.
 */
function ensureOverlayCSS(sr: ShadowRoot): void {
  const id = '__react-scan-overlay-css__'
  if (sr.querySelector(`#${id}`)) return
  const style = document.createElement('style')
  style.id = id
  style.textContent = `
    .fixed { position: fixed !important; }
    .top-0 { top: 0 !important; }
    .left-0 { left: 0 !important; }
    .w-screen { width: 100vw !important; }
    .h-screen { height: 100vh !important; }
    .pointer-events-none { pointer-events: none !important; }
    .z-\\[214748365\\] { z-index: 214748365 !important; }
    .z-\\[214748367\\] { z-index: 214748367 !important; }
    .inset-0 { inset: 0 !important; }
  `
  sr.appendChild(style)
}

const STORAGE_KEY = 'react-scan-options'

function persistEnabledState(enabled: boolean): void {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, enabled }))
  }
  catch {}
}

// ─── Serialisation ──────────────────────────────────────────────────────────

function serializeValue(value: unknown): unknown {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value === 'function') return `[Function: ${(value as Function).name || 'anonymous'}]`
  if (typeof value === 'symbol') return `[Symbol: ${(value as symbol).description || ''}]`
  if (value instanceof Element) return `[Element: ${value.tagName}]`
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      if (value.length > 10) return `[Array(${value.length})]`
      return value.map(serializeValue)
    }
    if ((value as any).$$typeof) return '[React Element]'
    try {
      const keys = Object.keys(value as object)
      if (keys.length > 20) return `[Object with ${keys.length} keys]`
      const out: Record<string, unknown> = {}
      for (const k of keys.slice(0, 20)) {
        out[k] = serializeValue((value as any)[k])
      }
      return out
    } catch {
      return '[Object]'
    }
  }
  return value
}

// ─── Component tree ─────────────────────────────────────────────────────────

function getFiberRenderCount(fiber: any): number {
  try {
    return getRenderCount(getFiberId(fiber))
  } catch {
    return 0
  }
}

function collectCompositeDescendants(
  fiber: any,
  depth: number,
  maxDepth: number,
  results: ComponentTreeNode[],
): void {
  if (!fiber || depth > maxDepth) return
  try {
    const name = getDisplayName(fiber.type)
    if (isCompositeFiber(fiber) && name) {
      const node = buildTreeNode(fiber, depth, maxDepth)
      if (node) results.push(node)
    } else {
      let child = fiber.child
      while (child) {
        collectCompositeDescendants(child, depth, maxDepth, results)
        child = child.sibling
      }
    }
  } catch {
    // ignore
  }
}

function buildTreeNode(fiber: any, depth = 0, maxDepth = 50): ComponentTreeNode | null {
  if (!fiber || depth > maxDepth) return null
  try {
    const name = getDisplayName(fiber.type)
    if (isCompositeFiber(fiber) && name) {
      const node: ComponentTreeNode = {
        id: String(getFiberId(fiber)),
        name,
        type: typeof fiber.type === 'function' ? 'function' : 'class',
        renderCount: getFiberRenderCount(fiber),
        lastRenderTime: 0,
        children: [],
      }
      let child = fiber.child
      while (child) {
        collectCompositeDescendants(child, depth + 1, maxDepth, node.children)
        child = child.sibling
      }
      return node
    }
    // Non-composite: collect composite descendants
    const compositeChildren: ComponentTreeNode[] = []
    let child = fiber.child
    while (child) {
      collectCompositeDescendants(child, depth, maxDepth, compositeChildren)
      child = child.sibling
    }
    return compositeChildren.length === 1 ? compositeChildren[0] : null
  } catch {
    return null
  }
}

function findFiberRootsFromDOM(): any[] {
  const roots: any[] = []
  if (typeof document === 'undefined') return roots
  const candidates = [
    document.getElementById('root'),
    document.getElementById('app'),
    document.getElementById('__next'),
  ]
  for (const el of candidates) {
    if (!el) continue
    // React 18+ container key
    const fiberKey = Object.keys(el).find(k => k.startsWith('__reactContainer$'))
    if (fiberKey) {
      let fiber = (el as any)[fiberKey]
      while (fiber) {
        if (fiber.stateNode?.current) {
          roots.push(fiber.stateNode)
          break
        }
        fiber = fiber.return
      }
    }
    // React 16-17
    const legacy = (el as any)._reactRootContainer?._internalRoot
    if (legacy) roots.push(legacy)
  }
  return roots
}

function extractComponentTree(): ComponentTreeNode[] {
  const trees: ComponentTreeNode[] = []
  try {
    // Try bippy _fiberRoots first (global > local), fall back to DOM walking
    const bippyRoots = (getInternals().fiberRootsSet ?? _fiberRoots) as unknown as Set<any>
    let hasRoots = false
    if (typeof (bippyRoots as any).forEach === 'function' && (bippyRoots as any).size > 0) {
      hasRoots = true
      bippyRoots.forEach((root: any) => {
        const rootFiber = root.current || root
        if (!rootFiber) return
        let child = rootFiber.child
        while (child) {
          const node = buildTreeNode(child, 0)
          if (node) trees.push(node)
          child = child.sibling
        }
      })
    }

    if (!hasRoots) {
      const domRoots = findFiberRootsFromDOM()
      for (const root of domRoots) {
        const rootFiber = root.current || root
        if (!rootFiber) continue
        let child = rootFiber.child
        while (child) {
          const node = buildTreeNode(child, 0)
          if (node) trees.push(node)
          child = child.sibling
        }
      }
    }
  } catch {
    // ignore
  }
  return trees
}

// ─── Performance data ────────────────────────────────────────────────────────

function extractPerformanceData(): ComponentPerformanceData[] {
  const performanceData: ComponentPerformanceData[] = []
  try {
    if (!Store.reportData) return performanceData

    const componentStats = new Map<string, {
      renderCount: number
      totalTime: number
      unnecessaryRenders: number
      lastRenderTime: number | null
    }>()

    Store.reportData.forEach((renderData) => {
      const componentName = renderData.componentName || 'Unknown'
      const existing = componentStats.get(componentName) ?? {
        renderCount: 0,
        totalTime: 0,
        unnecessaryRenders: 0,
        lastRenderTime: null,
      }
      existing.renderCount += renderData.count || 0
      existing.totalTime += renderData.time || 0
      if (renderData.unnecessary) existing.unnecessaryRenders++
      if (renderData.time != null) existing.lastRenderTime = renderData.time
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
  } catch {
    // ignore
  }
  return performanceData
}

function calculatePerformanceSummary(data: ComponentPerformanceData[]): PerformanceSummary {
  const totalRenders = data.reduce((s, i) => s + i.renderCount, 0)
  const totalTime = data.reduce((s, i) => s + i.totalTime, 0)
  return {
    totalRenders,
    totalComponents: data.length,
    unnecessaryRenders: data.reduce((s, i) => s + i.unnecessaryRenders, 0),
    averageRenderTime: totalRenders > 0 ? totalTime / totalRenders : 0,
    slowestComponents: data.slice(0, 10),
  }
}

// ─── FPS counter ─────────────────────────────────────────────────────────────

let fps = 60
let frameCount = 0
let lastFpsTime = typeof performance !== 'undefined' ? performance.now() : Date.now()

const updateFPS = () => {
  if (typeof performance === 'undefined' || typeof requestAnimationFrame === 'undefined') return
  frameCount++
  const now = performance.now()
  if (now - lastFpsTime >= 1000) {
    fps = frameCount
    frameCount = 0
    lastFpsTime = now
  }
  requestAnimationFrame(updateFPS)
}
if (typeof requestAnimationFrame !== 'undefined') {
  requestAnimationFrame(updateFPS)
}

// ─── Focused component tracking ──────────────────────────────────────────────

interface FocusedComponentTracker {
  componentName: string
  renderCount: number
  changes: AggregatedChanges
  timestamp: number
}

let focusedComponentTracker: FocusedComponentTracker | null = null
const focusedComponentChangeCallbacks = new Set<(info: FocusedComponentRenderInfo) => void>()

function notifyFocusedComponentCallbacks(): void {
  if (!focusedComponentTracker) return
  const info: FocusedComponentRenderInfo = {
    componentName: focusedComponentTracker.componentName,
    renderCount: focusedComponentTracker.renderCount,
    changes: focusedComponentTracker.changes,
    timestamp: focusedComponentTracker.timestamp,
  }
  focusedComponentChangeCallbacks.forEach((cb) => {
    try { cb(info) } catch { /* ignore */ }
  })
}

// Single persistent render listener registered once
let renderListenerCleanup: (() => void) | null = null

function ensureRenderListener(): void {
  if (renderListenerCleanup) return
  // When the pre-built scan.js bundle is active, its instrumentation calls
  // notifyRenderListeners on its own Set.  We must register on that Set
  // (via the global internals) rather than the source-bundle's local Set.
  const registerListener = getInternals().addOnRenderListener ?? addOnRenderListener
  renderListenerCleanup = registerListener((fiber, _renders) => {
    if (!focusedComponentTracker) return
    const fiberName = getDisplayName(fiber.type) || 'Unknown'
    if (fiberName !== focusedComponentTracker.componentName) return

    focusedComponentTracker.renderCount++
    focusedComponentTracker.timestamp = Date.now()

    // Extract changes from fiber
    try {
      const currentProps = fiber.memoizedProps || {}
      const prevProps = fiber.alternate?.memoizedProps || {}
      for (const key of Object.keys(currentProps)) {
        if (key === 'children') continue
        const prev = prevProps[key]
        const curr = currentProps[key]
        if (prev !== curr) {
          const existing = focusedComponentTracker.changes.propsChanges.find(c => c.name === key)
          if (existing) {
            existing.count++
            existing.previousValue = serializeValue(prev)
            existing.currentValue = serializeValue(curr)
          } else {
            focusedComponentTracker.changes.propsChanges.push({
              name: key,
              previousValue: serializeValue(prev),
              currentValue: serializeValue(curr),
              count: 1,
            })
          }
        }
      }

      let currentState = fiber.memoizedState
      let prevState = fiber.alternate?.memoizedState
      let hookIndex = 0
      while (currentState) {
        if (currentState.memoizedState !== undefined) {
          const curr = currentState.memoizedState
          const prev = prevState?.memoizedState
          if (prev !== curr && prevState) {
            const name = `Hook ${hookIndex + 1}`
            const existing = focusedComponentTracker.changes.stateChanges.find(c => c.name === name)
            if (existing) {
              existing.count++
              existing.previousValue = serializeValue(prev)
              existing.currentValue = serializeValue(curr)
            } else {
              focusedComponentTracker.changes.stateChanges.push({
                name,
                previousValue: serializeValue(prev),
                currentValue: serializeValue(curr),
                count: 1,
              })
            }
          }
        }
        currentState = currentState.next
        prevState = prevState?.next
        hookIndex++
      }
    } catch {
      // ignore extraction errors
    }

    notifyFocusedComponentCallbacks()
  })
}

// ─── ScanInstance ─────────────────────────────────────────────────────────────

let scanInstance: ScanInstance | null = null
let currentOptions: ReactDevtoolsScanOptions = {}

// Check whether the pre-built scan.js already initialised instrumentation.
// If so, we must NOT call scan()/start() from the source-code copy because
// that would create a *second* bippy instrumentation instance.
function isGlobalInstanceAvailable(): boolean {
  return typeof window !== 'undefined' && !!(window as any).__REACT_SCAN_INTERNALS__
}

function createScanInstance(options: ReactDevtoolsScanOptions): ScanInstance {
  currentOptions = options

  return {
    getOptions: () => currentOptions,

    setOptions: (newOptions: Partial<ReactDevtoolsScanOptions>) => {
      currentOptions = { ...currentOptions, ...newOptions }
      // Update options on the global internals directly
      const internals = getInternals()
      internals.options.value = { ...internals.options.value, ...currentOptions }
    },

    start: () => {
      const opts = { ...currentOptions, enabled: true }
      currentOptions = opts

      const internals = getInternals()
      if (internals.instrumentation?.isPaused) {
        internals.instrumentation.isPaused.value = false
      }
      internals.options.value = { ...internals.options.value, enabled: true }

      persistEnabledState(true)

      if (!isGlobalInstanceAvailable()) {
        scan(opts)
      }
      ensureRenderListener()
    },

    stop: () => {
      currentOptions = { ...currentOptions, enabled: false }

      const internals = getInternals()
      if (internals.instrumentation?.isPaused) {
        internals.instrumentation.isPaused.value = true
      }
      internals.options.value = { ...internals.options.value, enabled: false }

      persistEnabledState(false)
    },

    isActive: () => {
      const internals = getInternals()
      if (internals.instrumentation?.isPaused) {
        return !internals.instrumentation.isPaused.value
      }
      return internals.options.value?.enabled === true
    },

    hideToolbar: () => {
      currentOptions = { ...currentOptions, showToolbar: false }
      // Use setScanOptions so the toolbar UI is actually torn down via initToolbar()
      setScanOptions({ showToolbar: false })
      getInternals().options.value = { ...getInternals().options.value, showToolbar: false }
    },

    showToolbar: () => {
      currentOptions = { ...currentOptions, showToolbar: true }
      setScanOptions({ showToolbar: true })
      getInternals().options.value = { ...getInternals().options.value, showToolbar: true }
    },

    getToolbarVisibility: () => {
      return getInternals().options.value?.showToolbar !== false
    },

    getPerformanceData: () => extractPerformanceData(),

    getPerformanceSummary: () => calculatePerformanceSummary(extractPerformanceData()),

    clearPerformanceData: () => {
      Store.reportData?.clear()
      Store.legacyReportData?.clear()
    },

    startInspecting: () => {
      const internals = getInternals()
      // ScanOverlay (which handles inspect highlights and click-to-select) is
      // only rendered when the toolbar is visible.  Force-initialise the toolbar
      // if it hasn't been created yet, then hide the widget UI so only the
      // overlay remains active.
      if (typeof window !== 'undefined' && !window.__REACT_SCAN_TOOLBAR_CONTAINER__) {
        internals.initToolbar?.(true)
        const scanRoot = document.getElementById('react-scan-root')
        const sr = scanRoot?.shadowRoot
        if (sr) {
          // Hide the toolbar widget while keeping ScanOverlay rendered
          const toolbarEl = sr.querySelector('#react-scan-toolbar') as HTMLElement | null
          if (toolbarEl) toolbarEl.style.display = 'none'
          // Inject critical positioning CSS for ScanOverlay since Tailwind
          // utilities may not be compiled in the shadow root stylesheet.
          ensureOverlayCSS(sr)
        }
      }
      Store.inspectState.value = { kind: 'inspecting', hoveredDomElement: null }
    },

    stopInspecting: () => {
      Store.inspectState.value = { kind: 'inspect-off' }
      // If the toolbar was force-initialised for inspection and the user's
      // original setting was showToolbar: false, tear it down.
      if (!currentOptions.showToolbar && typeof window !== 'undefined' && window.__REACT_SCAN_TOOLBAR_CONTAINER__) {
        const internals = getInternals()
        internals.initToolbar?.(false)
      }
    },

    isInspecting: () => Store.inspectState.value.kind === 'inspecting',

    focusComponent: (fiber: any) => {
      if (!fiber) return
      const domElement = fiber.stateNode instanceof Element ? fiber.stateNode : null
      if (domElement) {
        Store.inspectState.value = { kind: 'focused', focusedDomElement: domElement, fiber }
      }
    },

    getFocusedComponent: () => {
      const state = Store.inspectState.value
      if (state.kind !== 'focused') return null
      return {
        componentName: getDisplayName(state.fiber.type) || 'Unknown',
        componentId: String(getFiberId(state.fiber)),
        fiber: state.fiber,
        domElement: state.focusedDomElement,
      }
    },

    onInspectStateChange: (callback: (state: any) => void) => {
      ensureRenderListener()
      return Store.inspectState.subscribe((state: any) => {
        if (state.kind === 'focused') {
          const componentName = getDisplayName(state.fiber?.type) || 'Unknown'
          if (!focusedComponentTracker || focusedComponentTracker.componentName !== componentName) {
            focusedComponentTracker = {
              componentName,
              renderCount: 0,
              changes: { propsChanges: [], stateChanges: [], contextChanges: [] },
              timestamp: Date.now(),
            }
          }
        }
        callback(state)
      })
    },

    getFPS: () => fps,

    getFocusedComponentRenderInfo: () => {
      if (!focusedComponentTracker) return null
      return {
        componentName: focusedComponentTracker.componentName,
        renderCount: focusedComponentTracker.renderCount,
        changes: focusedComponentTracker.changes,
        timestamp: focusedComponentTracker.timestamp,
      }
    },

    onFocusedComponentChange: (callback: (info: FocusedComponentRenderInfo) => void) => {
      focusedComponentChangeCallbacks.add(callback)
      return () => focusedComponentChangeCallbacks.delete(callback)
    },

    clearFocusedComponentChanges: () => {
      if (focusedComponentTracker) {
        focusedComponentTracker.renderCount = 0
        focusedComponentTracker.changes = { propsChanges: [], stateChanges: [], contextChanges: [] }
        focusedComponentTracker.timestamp = Date.now()
      }
    },

    setFocusedComponentByName: (componentName: string) => {
      focusedComponentTracker = {
        componentName,
        renderCount: 0,
        changes: { propsChanges: [], stateChanges: [], contextChanges: [] },
        timestamp: Date.now(),
      }
      ensureRenderListener()
    },

    getComponentTree: () => extractComponentTree(),

    clearComponentTree: () => {
      // No separate map to clear — render counts come from Store.reportData
    },
  }
}

export function getScanInstance(options?: ReactDevtoolsScanOptions): ScanInstance {
  if (!scanInstance && options) {
    scanInstance = createScanInstance(options)
  }
  if (!scanInstance) {
    throw new Error('Scan instance not initialized. Call initScan first.')
  }
  return scanInstance
}

export function resetScanInstance(): void {
  scanInstance = null
  currentOptions = {}
  focusedComponentTracker = null
  focusedComponentChangeCallbacks.clear()
  if (renderListenerCleanup) {
    renderListenerCleanup()
    renderListenerCleanup = null
  }
}
