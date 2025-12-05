import type { ComponentTreeNode, FiberRoot, ReactDevToolsHook } from '../../types'
import { buildTree } from '../fiber/tree'
import { setFiberRoot } from '../router'

const fiberRoots = new Map<number, Set<FiberRoot>>()
let updateTimer: ReturnType<typeof setTimeout> | null = null
let lastRootCurrent: any = null

type TreeUpdateCallback = (tree: ComponentTreeNode | null) => void
const treeUpdateCallbacks = new Set<TreeUpdateCallback>()

export function onTreeUpdated(callback: TreeUpdateCallback) {
  treeUpdateCallbacks.add(callback)
  return () => {
    treeUpdateCallbacks.delete(callback)
  }
}

function emitTree(tree: ComponentTreeNode | null) {
  treeUpdateCallbacks.forEach((callback) => {
    try {
      callback(tree)
    }
    catch (e) {
      // Silently handle errors
    }
  })
}

function getRoots(rendererID: number) {
  if (!fiberRoots.has(rendererID))
    fiberRoots.set(rendererID, new Set())
  return fiberRoots.get(rendererID)!
}

/**
 * Get root selector from runtime config
 */
function getRootSelector(): string | undefined {
  if (typeof window !== 'undefined') {
    return (window as any).__REACT_DEVTOOLS_CONFIG__?.rootSelector
  }
  return undefined
}

function isOverlayRoot(root: FiberRoot): boolean {
  const overlayContainer = document.getElementById('react-devtools-overlay')
  if (!overlayContainer)
    return false
  const containerInfo = (root as any).containerInfo
  return containerInfo && containerInfo instanceof Node && overlayContainer.contains(containerInfo)
}

/**
 * Check if a root belongs to the specified rootSelector container
 */
function isRootInSelector(root: FiberRoot, selector: string): boolean {
  const containerInfo = (root as any).containerInfo
  if (!containerInfo || !(containerInfo instanceof Node))
    return false
  const targetContainer = document.querySelector(selector)
  if (!targetContainer)
    return false

  return containerInfo === targetContainer || targetContainer.contains(containerInfo)
}

/**
 * Check if a root should be tracked based on rootSelector config
 */
function shouldTrackRoot(root: FiberRoot): boolean {
  // Always skip overlay root
  if (isOverlayRoot(root))
    return false

  const rootSelector = getRootSelector()
  if (!rootSelector)
    return true

  // Only track roots inside the specified selector
  return isRootInSelector(root, rootSelector)
}

function findAppRoot(): FiberRoot | null {
  // First priority: find a root that matches rootSelector (if specified)
  for (const roots of fiberRoots.values()) {
    for (const root of roots) {
      if (root && shouldTrackRoot(root))
        return root
    }
  }
  // Fallback: if no matching root found and no rootSelector, return first non0overlay root
  const rootSelector = getRootSelector()
  if (!rootSelector) {
    for (const roots of fiberRoots.values()) {
      for (const root of roots) {
        if (root && !isOverlayRoot(root))
          return root
      }
    }
  }

  return null
}

/**
 * Get the current app fiber root (exported for context debugging)
 */
export function getAppFiberRoot(): FiberRoot | null {
  return findAppRoot()
}

function handleTreeUpdate(root: FiberRoot, showHostComponents: () => boolean) {
  // Check if this root should be tracked based on rootSelector config
  if (lastRootCurrent === root?.current)
    return
  lastRootCurrent = root?.current

  // Update the fiber root reference for router module
  setFiberRoot(root)

  if (updateTimer)
    clearTimeout(updateTimer)
  updateTimer = setTimeout(() => {
    const tree = buildTree(root, showHostComponents())
    if (tree) {
      emitTree(tree)
    }
    updateTimer = null
  }, 200)
}

export function rebuildTree(showHostComponents: boolean) {
  const appRoot = findAppRoot()
  if (!appRoot)
    return

  setTimeout(() => {
    const tree = buildTree(appRoot, showHostComponents)
    if (tree) {
      emitTree(tree)
    }
  }, 100)
}

function createHook(showHostComponents: () => boolean): ReactDevToolsHook {
  let rendererIDCounter = 0
  const renderers = new Map<number, any>()

  return {
    supportsFiber: true,
    renderers,
    inject(renderer: any) {
      const id = ++rendererIDCounter
      renderers.set(id, renderer)
      return id
    },
    getFiberRoots(rendererID: number) {
      return new Set(getRoots(rendererID))
    },
    onCommitFiberRoot(rendererID: number, root: FiberRoot) {
      getRoots(rendererID).add(root)
      handleTreeUpdate(root, showHostComponents)
    },
    onCommitFiberUnmount() {
      // no-op
    },
  }
}

function patchHook(existingHook: ReactDevToolsHook, showHostComponents: () => boolean): ReactDevToolsHook {
  // Check if already patched by us
  if ((existingHook as any).__REACT_DEVTOOLS_PATCHED__) {
    return existingHook
  }

  // Check for bippy/react-scan to avoid breaking their instrumentation
  // bippy checks strict equality of onCommitFiberRoot, so we can't wrap it
  const source = (existingHook as any)._instrumentationSource || ''
  if (source.includes('bippy') || (window as any).__REACT_SCAN_INTERNALS__) {
    // Still try to detect existing roots for initial tree
    if (existingHook.renderers) {
      for (const rendererID of existingHook.renderers.keys()) {
        detectExistingRoots(rendererID)
      }
    }

    // Attempt to piggyback on React Scan's commit hook if available
    try {
      const scanInternals = (window as any).__REACT_SCAN_INTERNALS__
      if (scanInternals && scanInternals.options) {
        // Helper to trigger our update
        const triggerUpdate = () => {
          // We don't have the root here easily, but we can trigger a rebuild on the known roots
          if (existingHook.renderers) {
            for (const rendererID of existingHook.renderers.keys()) {
              const roots = getRoots(rendererID)
              roots.forEach(root => handleTreeUpdate(root, showHostComponents))
            }
          }
        }

        // This is a hacky way to hook into scan's lifecycle
        // We watch for onCommitFinish or similar
        // Note: This depends on react-scan running its options callbacks
        // We can't easily wrap the existing callback without potentially causing loops or issues
        // so we might just rely on a polling fallback or the initial detection for now.

        // Better: set up a polling interval to check for root updates if we can't hook in
        // This ensures the tree eventually updates even if we miss the event
        setInterval(() => {
          if (existingHook.renderers) {
            for (const rendererID of existingHook.renderers.keys()) {
              const roots = getRoots(rendererID)
              roots.forEach(root => handleTreeUpdate(root, showHostComponents))
            }
          }
        }, 1000)
      }
    }
    catch (e) {
      console.warn('[React DevTools] Failed to attach to React Scan', e)
    }

    return existingHook
  }

  // Store the original callback - preserve exact reference
  const originalCommit = existingHook.onCommitFiberRoot

  // Only patch if there's an existing callback to preserve
  if (originalCommit) {
    // Create new callback that chains our logic after the original
    const patchedCallback = function (this: any, rendererID: number, root: FiberRoot) {
      // Call original first with exact same context
      // We capture the result but don't return it immediately to ensure our logic runs
      let originalResult
      try {
        originalResult = originalCommit.call(this, rendererID, root)
      }
      catch (e) {
        console.error('[React DevTools] Error in other devtools hook:', e)
      }

      // Then add our component tree tracking
      try {
        getRoots(rendererID).add(root)
        handleTreeUpdate(root, showHostComponents)
      }
      catch (error) {
        // Silently handle errors in tree update
      }

      return originalResult // Preserve return value
    }

    // Preserve any properties on the original function
    Object.setPrototypeOf(patchedCallback, Object.getPrototypeOf(originalCommit))

    existingHook.onCommitFiberRoot = patchedCallback
  }
  else {
    // No existing callback, create our own
    existingHook.onCommitFiberRoot = (rendererID: number, root: FiberRoot) => {
      getRoots(rendererID).add(root)
      handleTreeUpdate(root, showHostComponents)
    }
  }

  if (!existingHook.getFiberRoots) {
    existingHook.getFiberRoots = (rendererID: number) => new Set(getRoots(rendererID))
  }

  // Mark as patched
  ; (existingHook as any).__REACT_DEVTOOLS_PATCHED__ = true

  return existingHook
}

function detectExistingRoots(rendererID: number) {
  const rootSelector = getRootSelector()
  // React 18+ stores references on DOM elements with keys like:
  // - _reactContainer$<randomId> (React 18 createRoot)
  // - __reactFiber$<randomId> (React 18+ legacy mode or older)
  // - __reactInternalInstance$<randomId> (React < 18)
  // The container/fiber leads to the root

  function findRootFromContainer(container: any): FiberRoot | null {
    // React 18 createRoot stores the container which references the root
    // The container structure: { current: FiberNode, containerInfo: DOMElement, ... }
    // The FiberNode with tag 3 (HostRoot) has stateNode pointing to the FiberRoot
    if (!container || typeof container !== 'object') {
      return null
    }

    // Check if container is a FiberRoot itself (has containerInfo property)
    // FiberRoot structure: { containerInfo: DOMElement, current: HostRootFiber, ... }
    if (container.containerInfo) {
      // This is likely a FiberRoot
      return container
    }

    // Check if container has current property (FiberNode)
    if (container.current) {
      const fiber = container.current
      // If current is a HostRoot fiber (tag 3 or 24), stateNode is the FiberRoot
      if (fiber.tag === 3 || fiber.tag === 24) {
        // stateNode of HostRoot is the FiberRoot
        return fiber.stateNode || container
      }
      // Otherwise, walk up the fiber tree to find HostRoot
      const root = findRootFromFiber(fiber)
      if (root) {
        return root
      }
    }

    // Try alternative property names for different React versions
    if (container._reactRootContainer) {
      const root = findRootFromContainer(container._reactRootContainer)
      if (root)
        return root
    }
    if (container._internalRoot) {
      const root = findRootFromContainer(container._internalRoot)
      if (root)
        return root
    }

    return null
  }

  function findRootFromFiber(fiber: any): FiberRoot | null {
    let current = fiber
    let depth = 0
    const maxDepth = 100

    while (current && depth < maxDepth) {
      // HostRoot has tag 3 (React 18) or tag 24 (ConcurrentRoot)
      if (current.tag === 3 || current.tag === 24) {
        return current.stateNode
      }
      // Walk up the tree
      current = current.return || current._debugOwner
      depth++
    }
    return null
  }

  /**
   * Try to find React root from a single element
   */
  function findRootFromElement(element: Element | Document): FiberRoot | null {
    // Use both Object.keys and Object.getOwnPropertyNames to catch all properties
    const keys = [...Object.keys(element), ...Object.getOwnPropertyNames(element)]
    const seenKeys = new Set<string>()

    for (const key of keys) {
      // Skip duplicates
      if (seenKeys.has(key))
        continue
      seenKeys.add(key)

      try {
        const value = (element as any)[key]
        if (!value || typeof value !== 'object')
          continue

        // React 18 createRoot uses __reactContainer$<randomId>
        if (key.startsWith('__reactContainer')) {
          if (value && (value.tag === 3 || value.tag === 24)) {
            const fiberRoot = value.stateNode
            if (fiberRoot) {
              return fiberRoot
            }
          }
          const root = findRootFromFiber(value)
          if (root) {
            return root
          }
        }
        // React 18+ legacy or older uses __reactFiber$<randomId>
        else if (key.startsWith('__reactFiber')) {
          const root = findRootFromFiber(value)
          if (root) {
            return root
          }
        }
        // React < 18 uses __reactInternalInstance$<randomId>
        else if (key.startsWith('__reactInternalInstance')) {
          const root = findRootFromFiber(value)
          if (root) {
            return root
          }
        }
      }
      catch (e) {
        // Ignore errors when accessing properties
        continue
      }
    }
    return null
  }

  /**
   * Check if a root's containerInfo is inside the target selector
   */
  function isRootContainerInSelector(root: FiberRoot, selector: string): boolean {
    const containerInfo = (root as any).containerInfo
    if (!containerInfo || !(containerInfo instanceof Element))
      return false

    const targetContainer = document.querySelector(selector)
    if (!targetContainer)
      return false

    // containerInfo should be the target itself or inside it
    return containerInfo === targetContainer || targetContainer.contains(containerInfo)
  }

  function walkDOM(element: Element | Document): FiberRoot | null {
    // If rootSelector is specified, only look in that specific element
    if (rootSelector) {
      const targetElement = document.querySelector(rootSelector)
      if (targetElement) {
        // First try the element itself - it should be a React mound point
        const directRoot = findRootFromElement(targetElement)
        if (directRoot && isRootContainerInSelector(directRoot, rootSelector)) {
          return directRoot
        }

        // Then walk its children, but only accept roots whose containerInfo is inside selector
        const walker = document.createTreeWalker(targetElement, NodeFilter.SHOW_ELEMENT)
        let node: Element | null = walker.currentNode as Element
        while (node) {
          const root = findRootFromElement(node)
          if (root) {
            // Only accept if this root's containerInfo is inside our target selector
            if (isRootContainerInSelector(root, rootSelector)) {
              return root
            }
          }
          node = walker.nextNode() as Element | null
        }
      }
      return null
    }

    // Default behavior: try common root containers first (#root, #app, etc.)
    const commonRootIds = ['root', 'app', 'main', 'app-root']
    for (const id of commonRootIds) {
      const rootElement = document.getElementById(id)
      if (!rootElement)
        continue
      const root = findRootFromElement(rootElement)
      if (root)
        return root
    }

    // If not found on common root containers, walk the entire DOM tree
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT)
    let node: Element | null = walker.currentNode as Element
    while (node) {
      const root = findRootFromElement(node)
      if (root)
        return root
      node = walker.nextNode() as Element | null
    }
    return null
  }

  const existingRoot = walkDOM(document.body || document)

  if (existingRoot) {
    getRoots(rendererID).add(existingRoot)
    setTimeout(() => {
      handleTreeUpdate(existingRoot, () => false)
    }, 50)
    return true
  }

  return false
}

/**
 * Get the React version from the renderer
 */
export function getReactVersion(): string | null {
  const globalObj = globalThis as typeof globalThis & { __REACT_DEVTOOLS_GLOBAL_HOOK__?: ReactDevToolsHook }
  const hook = globalObj.__REACT_DEVTOOLS_GLOBAL_HOOK__

  if (!hook || !hook.renderers) {
    return null
  }

  // Try to get version from the first renderer
  for (const renderer of hook.renderers.values()) {
    if (renderer && renderer.version) {
      return renderer.version
    }
    // Some versions store it differently
    if (renderer && renderer.reconcilerVersion) {
      return renderer.reconcilerVersion
    }
  }

  // Fallback: try to get from React global
  if (typeof window !== 'undefined') {
    const React = (window as any).React
    if (React && React.version) {
      return React.version
    }
  }

  return null
}

export function installReactHook(showHostComponents: () => boolean) {
  const globalObj = globalThis as typeof globalThis & { __REACT_DEVTOOLS_GLOBAL_HOOK__?: ReactDevToolsHook }

  if (globalObj.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    const hook = patchHook(globalObj.__REACT_DEVTOOLS_GLOBAL_HOOK__, showHostComponents)
    if (hook.renderers && hook.renderers.size > 0) {
      for (const rendererID of hook.renderers.keys()) {
        detectExistingRoots(rendererID)
      }
    }
    else {
      const defaultRendererID = hook.inject({})
      detectExistingRoots(defaultRendererID)
    }
    return
  }

  const hook = createHook(showHostComponents)
  globalObj.__REACT_DEVTOOLS_GLOBAL_HOOK__ = hook

  let attempts = 0
  const maxAttempts = 10

  function tryDetect() {
    attempts++
    const defaultRendererID = hook.inject({})
    const found = detectExistingRoots(defaultRendererID)

    if (found)
      return

    if (hook.renderers && hook.renderers.size > 0) {
      for (const rendererID of hook.renderers.keys()) {
        const foundRoots = detectExistingRoots(rendererID)
        if (foundRoots)
          return
      }
    }

    if (attempts < maxAttempts) {
      setTimeout(tryDetect, 200 * attempts)
    }
  }

  tryDetect()
  setTimeout(() => {
    tryDetect()
  }, 50)
}
