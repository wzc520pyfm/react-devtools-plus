import type { ComponentTreeNode, FiberRoot, ReactDevToolsHook } from '../../types'
import { hideHighlight } from '../fiber/highlight'
import { buildTree } from '../fiber/tree'

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

function isOverlayRoot(root: FiberRoot): boolean {
  const overlayContainer = document.getElementById('react-devtools-overlay')
  if (!overlayContainer)
    return false
  const containerInfo = (root as any).containerInfo
  return containerInfo && containerInfo instanceof Node && overlayContainer.contains(containerInfo)
}

function findAppRoot(): FiberRoot | null {
  for (const roots of fiberRoots.values()) {
    for (const root of roots) {
      if (root && !isOverlayRoot(root))
        return root
    }
  }
  // Fallback to first root
  for (const roots of fiberRoots.values()) {
    if (roots.size > 0) {
      const firstRoot = roots.values().next().value
      if (firstRoot)
        return firstRoot
    }
  }
  return null
}

function handleTreeUpdate(root: FiberRoot, showHostComponents: () => boolean) {
  if (lastRootCurrent === root?.current)
    return
  lastRootCurrent = root?.current

  // Always skip overlay root
  if (isOverlayRoot(root)) {
    return
  }

  if (updateTimer)
    clearTimeout(updateTimer)
  updateTimer = setTimeout(() => {
    const tree = buildTree(root, showHostComponents())
    if (tree) {
      emitTree(tree)
    }
    hideHighlight()
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
    hideHighlight()
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

  // Store the original callback - preserve exact reference
  const originalCommit = existingHook.onCommitFiberRoot

  // Only patch if there's an existing callback to preserve
  if (originalCommit) {
    // Create new callback that chains our logic after the original
    const patchedCallback = function (this: any, rendererID: number, root: FiberRoot) {
      // Call original first with exact same context
      const originalResult = originalCommit.call(this, rendererID, root)

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
  ;(existingHook as any).__REACT_DEVTOOLS_PATCHED__ = true

  return existingHook
}

function detectExistingRoots(rendererID: number) {
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

  function walkDOM(element: Element | Document): FiberRoot | null {
    // Try common root containers first (#root, #app, etc.)
    const commonRootIds = ['root', 'app', 'main', 'app-root']
    for (const id of commonRootIds) {
      const rootElement = document.getElementById(id)
      if (!rootElement)
        continue

      // Use both Object.keys and Object.getOwnPropertyNames to catch all properties
      // Some React properties might not be enumerable with Object.keys
      const keys = [...Object.keys(rootElement), ...Object.getOwnPropertyNames(rootElement)]
      const seenKeys = new Set<string>()

      for (const key of keys) {
        // Skip duplicates
        if (seenKeys.has(key))
          continue
        seenKeys.add(key)

        try {
          const value = (rootElement as any)[key]
          if (!value || typeof value !== 'object')
            continue

          // React 18 createRoot uses __reactContainer$<randomId> (double underscore)
          // The value is directly a FiberNode (HostRoot with tag 3)
          // The FiberNode's stateNode is the FiberRoot
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
    }

    // If not found on common root containers, walk the entire DOM tree
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT)
    let node: Element | null = walker.currentNode as Element

    while (node) {
      // Get all properties including non-enumerable ones
      const keys = [...Object.keys(node), ...Object.getOwnPropertyNames(node)]
      const seenKeys = new Set<string>()

      for (const key of keys) {
        if (seenKeys.has(key))
          continue
        seenKeys.add(key)

        try {
          const value = (node as any)[key]
          if (!value || typeof value !== 'object')
            continue

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
          // React 18+ legacy or older uses __reactFiber
          else if (key.startsWith('__reactFiber')) {
            const root = findRootFromFiber(value)
            if (root) {
              return root
            }
          }
          // React < 18 uses __reactInternalInstance
          else if (key.startsWith('__reactInternalInstance')) {
            const root = findRootFromFiber(value)
            if (root) {
              return root
            }
          }
        }
        catch (e) {
          continue
        }
      }
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

export function installReactHook(showHostComponents: () => boolean) {
  const globalObj = globalThis as typeof globalThis & { __REACT_DEVTOOLS_GLOBAL_HOOK__?: ReactDevToolsHook }

  if (globalObj.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    const hook = patchHook(globalObj.__REACT_DEVTOOLS_GLOBAL_HOOK__, showHostComponents)
    if (hook.renderers) {
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
