import type { FiberNode, FiberRoot } from '../../types'
import { getDisplayName } from '../fiber/utils'

export interface RouteInfo {
  path: string
  name?: string
  element?: string
  children?: RouteInfo[]
  /** Whether this is an index route (renders at parent's path) */
  isIndex?: boolean
  /** Whether this is a layout route (has children but may not add URL segment) */
  isLayout?: boolean
}

export interface RouterState {
  currentPath: string
  routes: RouteInfo[]
  routerType: 'react-router' | 'unknown' | null
}

/**
 * Global variable to store the React fiber root reference
 */
let fiberRoot: FiberRoot | null = null

/**
 * Set the fiber root reference (called from hook)
 */
export function setFiberRoot(root: FiberRoot | null) {
  fiberRoot = root
}

/**
 * Get the current fiber root
 */
export function getFiberRoot(): FiberRoot | null {
  return fiberRoot
}

/**
 * Get element name from React element
 */
function getElementName(element: any): string | undefined {
  if (!element)
    return undefined
  if (typeof element.type === 'string')
    return element.type
  if (element.type?.name)
    return element.type.name
  if (element.type?.displayName)
    return element.type.displayName
  return undefined
}

/**
 * Extract route info from a React Router Route element (JSX props)
 */
function extractRouteFromElement(element: any, parentPath: string = ''): RouteInfo | null {
  if (!element || !element.props)
    return null

  const props = element.props
  const isIndex = props.index === true

  // Calculate the actual path for this route
  let displayPath = ''
  let fullPath = ''

  if (isIndex) {
    // Index routes render at parent's path
    displayPath = 'index'
    fullPath = parentPath || '/'
  }
  else if (props.path) {
    displayPath = props.path
    fullPath = props.path.startsWith('/')
      ? props.path
      : `${parentPath}/${props.path}`.replace(/\/+/g, '/')
  }
  else {
    // Layout route without explicit path
    displayPath = parentPath || '/'
    fullPath = parentPath || '/'
  }

  // Extract nested routes from children first to determine if this is a layout route
  const childRoutes: RouteInfo[] = []
  if (props.children) {
    const children = Array.isArray(props.children) ? props.children : [props.children]

    for (const child of children) {
      if (child && child.type && (child.type.name === 'Route' || child.type?.displayName === 'Route')) {
        const childRoute = extractRouteFromElement(child, fullPath)
        if (childRoute) {
          childRoutes.push(childRoute)
        }
      }
    }
  }

  const hasChildren = childRoutes.length > 0

  const routeInfo: RouteInfo = {
    path: fullPath || '/',
    name: props.id || undefined,
    element: getElementName(props.element),
    isIndex,
    isLayout: hasChildren,
  }

  if (hasChildren) {
    routeInfo.children = childRoutes
  }

  return routeInfo
}

/**
 * Extract routes from Routes component's children prop
 */
function extractRoutesFromProps(props: any): RouteInfo[] {
  const routes: RouteInfo[] = []

  if (!props?.children)
    return routes

  const children = Array.isArray(props.children) ? props.children : [props.children]

  for (const child of children) {
    if (child && child.type && (child.type.name === 'Route' || child.type?.displayName === 'Route')) {
      const route = extractRouteFromElement(child)
      if (route) {
        routes.push(route)
      }
    }
  }

  return routes
}

/**
 * Extract route configuration from fiber tree
 */
function extractRoutesFromFiber(fiber: FiberNode): RouteInfo[] {
  const routes: RouteInfo[] = []
  const visited = new WeakSet<FiberNode>()

  function traverse(node: FiberNode | null, parentPath: string = ''): void {
    if (!node || visited.has(node))
      return

    visited.add(node)

    const name = getDisplayName(node)
    const props = node.memoizedProps || node.pendingProps

    // Check if this is a Route component (various names used by React Router)
    const isRouteComponent = name === 'Route'
      || name === 'RenderedRoute'
      || name === 'RouteContext.Provider'

    if (isRouteComponent && props) {
      // Try to get route info from props.match or props.value (Context providers)
      const match = props.match || props.value?.match
      const route = props.route || props.value?.route

      if (match || route) {
        const routeInfo: RouteInfo = {
          path: match?.pathname || route?.path || parentPath || '/',
          name: route?.id || undefined,
          element: route?.element?.type?.name || route?.element?.type?.displayName || getElementName(props.element),
        }

        // Don't add duplicate paths
        if (!routes.some(r => r.path === routeInfo.path)) {
          routes.push(routeInfo)
        }
      }
    }

    // Continue traversing
    if (node.child) {
      traverse(node.child, parentPath)
    }
    if (node.sibling) {
      traverse(node.sibling, parentPath)
    }
  }

  traverse(fiber)
  return routes
}

/**
 * Find Routes component and extract route configuration
 */
function findAndExtractRoutes(fiber: FiberNode | null): RouteInfo[] {
  if (!fiber)
    return []

  const visited = new WeakSet<FiberNode>()
  let routes: RouteInfo[] = []

  function traverse(node: FiberNode | null): void {
    if (!node || visited.has(node))
      return

    visited.add(node)

    const name = getDisplayName(node)
    const props = node.memoizedProps || node.pendingProps

    // Look for Routes component (React Router v6)
    if (name === 'Routes') {
      // First try to extract from props.children (JSX children)
      const propsRoutes = extractRoutesFromProps(props)
      if (propsRoutes.length > 0) {
        routes = propsRoutes
        return // Found routes, no need to continue
      }
    }

    // Look for Router context or DataRoutes
    if (name === 'DataRoutes' || name === 'RoutesRenderer') {
      const fiberRoutes = extractRoutesFromFiber(node)
      if (fiberRoutes.length > 0) {
        routes.push(...fiberRoutes)
      }
    }

    // Continue traversing to find Routes/Router components
    if (node.child) {
      traverse(node.child)
    }
    if (node.sibling) {
      traverse(node.sibling)
    }
  }

  traverse(fiber)
  return routes
}

/**
 * Get current path from window.location
 */
function getCurrentPath(): string {
  // Check for hash router first
  if (window.location.hash && window.location.hash.startsWith('#')) {
    const hashPath = window.location.hash.slice(1)
    // Remove query string from hash if present
    return hashPath.split('?')[0] || '/'
  }

  // Regular path
  return window.location.pathname || '/'
}

/**
 * Detect router type from fiber tree
 */
function detectRouterType(fiber: FiberNode | null): 'react-router' | 'unknown' | null {
  if (!fiber)
    return null

  const visited = new WeakSet<FiberNode>()

  function traverse(node: FiberNode | null): 'react-router' | 'unknown' | null {
    if (!node || visited.has(node))
      return null

    visited.add(node)

    const name = getDisplayName(node)

    // Check for React Router components
    if (
      name === 'Router'
      || name === 'BrowserRouter'
      || name === 'HashRouter'
      || name === 'MemoryRouter'
      || name === 'Routes'
      || name === 'Route'
    ) {
      return 'react-router'
    }

    // Check children
    if (node.child) {
      const result = traverse(node.child)
      if (result)
        return result
    }

    // Check siblings
    if (node.sibling) {
      const result = traverse(node.sibling)
      if (result)
        return result
    }

    return null
  }

  return traverse(fiber)
}

/**
 * Get router information from the current React app
 */
export function getRouterInfo(): RouterState | null {
  const root = fiberRoot

  if (!root?.current) {
    // Fallback: just return current path
    return {
      currentPath: getCurrentPath(),
      routes: [],
      routerType: null,
    }
  }

  const fiber = root.current

  // Detect router type
  const routerType = detectRouterType(fiber)

  // Extract routes from fiber tree
  const routes = findAndExtractRoutes(fiber.child)

  return {
    currentPath: getCurrentPath(),
    routes,
    routerType,
  }
}

/**
 * Navigate to a path using various methods
 */
export function navigateTo(path: string): boolean {
  try {
    // Try using History API (works with BrowserRouter)
    if (window.history && window.history.pushState) {
      // Check if we're using a hash router
      if (window.location.hash && window.location.hash.startsWith('#/')) {
        window.location.hash = path
      }
      else {
        window.history.pushState({}, '', path)
        // Dispatch a popstate event to notify React Router
        window.dispatchEvent(new PopStateEvent('popstate'))
      }
      return true
    }

    // Fallback: direct location change
    window.location.href = path
    return true
  }
  catch (e) {
    console.error('[React DevTools] Failed to navigate:', e)
    return false
  }
}
