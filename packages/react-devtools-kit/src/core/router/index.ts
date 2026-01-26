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
  /** Whether this route has a loader function */
  hasLoader?: boolean
  /** Whether this route has an action function */
  hasAction?: boolean
  /** Whether this route uses lazy loading */
  isLazy?: boolean
  /** Whether this route has an error boundary */
  hasErrorBoundary?: boolean
  /** Dynamic segments in the path (e.g., :id, :userId) */
  params?: string[]
  /** Whether this route requires exact match (React Router v5) */
  exact?: boolean
  /** Whether this route uses strict matching (React Router v5) */
  strict?: boolean
}

export interface MatchedRoute {
  path: string
  params: Record<string, string>
  element?: string
}

export interface NavigationEntry {
  path: string
  search: string
  hash: string
  timestamp: number
  duration?: number
}

export interface RouterState {
  currentPath: string
  search: string
  hash: string
  routes: RouteInfo[]
  routerType: 'react-router' | 'unknown' | null
  /** Current matched route chain */
  matchedRoutes: MatchedRoute[]
  /** Current route params */
  params: Record<string, string>
  /** Navigation history */
  history: NavigationEntry[]
  /** Last navigation duration in ms */
  lastNavigationDuration?: number
}

/**
 * Global variable to store the React fiber root reference
 */
let fiberRoot: FiberRoot | null = null

/**
 * Navigation history storage
 */
const navigationHistory: NavigationEntry[] = []
let lastNavigationStart: number | null = null
let lastNavigationDuration: number | undefined

/**
 * Max history entries to keep
 */
const MAX_HISTORY_ENTRIES = 50

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
 * Extract dynamic params from a path pattern
 */
function extractParamsFromPath(path: string): string[] {
  const params: string[] = []
  const regex = /:([^/]+)/g
  let match = regex.exec(path)
  while (match !== null) {
    params.push(match[1])
    match = regex.exec(path)
  }
  return params
}

/**
 * Check if element is lazy loaded
 */
function isLazyElement(element: any): boolean {
  if (!element)
    return false
  // Check for React.lazy wrapper
  if (element.$$typeof?.toString() === 'Symbol(react.lazy)')
    return true
  if (element.type?.$$typeof?.toString() === 'Symbol(react.lazy)')
    return true
  return false
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
  // Handle lazy components
  if (element.type?._payload?._result?.name)
    return element.type._payload._result.name
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

  // Extract dynamic params from the path
  const params = extractParamsFromPath(props.path || '')

  const routeInfo: RouteInfo = {
    path: fullPath || '/',
    name: props.id || undefined,
    element: getElementName(props.element),
    isIndex,
    isLayout: hasChildren,
    hasLoader: !!props.loader,
    hasAction: !!props.action,
    isLazy: isLazyElement(props.element) || !!props.lazy,
    hasErrorBoundary: !!props.errorElement || !!props.ErrorBoundary,
    params: params.length > 0 ? params : undefined,
  }

  if (hasChildren) {
    routeInfo.children = childRoutes
  }

  return routeInfo
}

/**
 * Extract routes from Routes component's children prop (React Router v6)
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
 * Get component name from React Router v5 Route props
 */
function getV5ComponentName(props: any): string | undefined {
  // v5 uses component, render, or children props
  if (props.component) {
    return props.component.name || props.component.displayName
  }
  if (props.render) {
    return 'render()'
  }
  if (typeof props.children === 'function') {
    return 'children()'
  }
  return undefined
}

/**
 * Check if a component is likely a React Router v5 Route by its props
 */
function isLikelyV5Route(props: any): boolean {
  if (!props)
    return false
  // v5 Route typically has path and one of: component, render, children
  const hasPath = typeof props.path === 'string' || props.path === undefined // path can be undefined for catch-all routes
  const hasRouteProps = props.component || props.render || props.children !== undefined
  const hasExactOrStrict = props.exact !== undefined || props.strict !== undefined
  const hasLocation = props.location !== undefined
  const hasComputedMatch = props.computedMatch !== undefined

  return (hasPath && hasRouteProps) || hasExactOrStrict || hasComputedMatch || hasLocation
}

/**
 * Check if a component is likely a React Router v5 Switch by its props/children
 */
function isLikelyV5Switch(props: any): boolean {
  if (!props || !props.children)
    return false

  const children = Array.isArray(props.children) ? props.children : [props.children]

  // Check if children look like Route elements
  for (const child of children) {
    if (child && child.props) {
      if (isLikelyV5Route(child.props)) {
        return true
      }
    }
  }
  return false
}

/**
 * Check if a component is likely a React Router v5 Redirect by its props
 */
function isLikelyV5Redirect(props: any): boolean {
  if (!props)
    return false
  // Redirect has 'to' prop and optionally 'from', 'push', 'exact'
  return typeof props.to === 'string' || (typeof props.to === 'object' && props.to !== null)
}

/**
 * Check if a fiber node is a React Router v5 context provider
 * React Router v5 uses __RouterContext with value containing { history, location, match, staticContext }
 */
function isRouterContextProvider(fiber: FiberNode): boolean {
  const props = fiber.memoizedProps || fiber.pendingProps
  if (!props?.value)
    return false

  const value = props.value
  // React Router context has these properties
  return !!(value.history && value.location && typeof value.match === 'object')
}

/**
 * Check if a fiber node is a React Router v5 Route context provider
 * Route wraps children in a context provider with match info
 */
function isRouteContextProvider(fiber: FiberNode): boolean {
  const props = fiber.memoizedProps || fiber.pendingProps
  if (!props?.value)
    return false

  const value = props.value
  // Route context has match with path, url, params
  return !!(value.match && typeof value.match.path === 'string')
}

/**
 * Extract routes from React Router v5 by traversing fiber tree and finding Route context providers
 * This works even when component names are minified
 */
function extractRoutesFromFiberV5(fiber: FiberNode): RouteInfo[] {
  const routes: RouteInfo[] = []
  const visited = new WeakSet<FiberNode>()
  const seenPaths = new Set<string>()

  function traverse(node: FiberNode | null): void {
    if (!node || visited.has(node))
      return

    visited.add(node)

    const props = node.memoizedProps || node.pendingProps

    // Method 1: Check for Route context provider (works with minified code)
    if (isRouteContextProvider(node)) {
      const value = props.value
      const match = value.match
      const path = match.path || match.url || '/'

      // Avoid duplicates
      if (!seenPaths.has(path)) {
        seenPaths.add(path)

        const routeInfo: RouteInfo = {
          path,
          params: match.params ? Object.keys(match.params) : undefined,
          exact: match.isExact,
        }

        // Try to find the rendered element name
        if (node.child) {
          const childName = getDisplayName(node.child)
          if (childName && childName !== 'Anonymous' && childName.length > 1) {
            routeInfo.element = childName
          }
        }

        routes.push(routeInfo)
      }
    }

    // Method 2: Check props for Switch-like structure
    if (props?.children) {
      const children = Array.isArray(props.children) ? props.children : [props.children]

      // Check if this looks like a Switch (has Route-like children)
      let hasRouteChildren = false
      for (const child of children) {
        if (child && child.props && isLikelyV5Route(child.props)) {
          hasRouteChildren = true
          const route = extractRouteFromElementV5(child)
          if (route && !seenPaths.has(route.path)) {
            seenPaths.add(route.path)
            routes.push(route)
          }
        }
      }

      // If we found route children, don't traverse into them again
      if (hasRouteChildren) {
        return
      }
    }

    // Continue traversing
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
 * Extract route info from a React Router v5 Route element (JSX props)
 */
function extractRouteFromElementV5(element: any, parentPath: string = ''): RouteInfo | null {
  if (!element || !element.props)
    return null

  const props = element.props

  // v5 Route must have a path (unless it's a fallback route)
  const path = props.path || '*'

  // Calculate full path
  let fullPath = path
  if (path !== '*' && !path.startsWith('/') && parentPath) {
    fullPath = `${parentPath}/${path}`.replace(/\/+/g, '/')
  }

  // Extract dynamic params from the path
  const params = extractParamsFromPath(path)

  // Extract nested routes from children (if children is an element, not a function)
  const childRoutes: RouteInfo[] = []
  if (props.children && typeof props.children !== 'function') {
    const children = Array.isArray(props.children) ? props.children : [props.children]

    for (const child of children) {
      if (child && child.type) {
        const typeName = child.type.name || child.type?.displayName

        // Check for Route by name or props
        const isRoute = typeName === 'Route' || isLikelyV5Route(child.props)
        const isSwitch = typeName === 'Switch' || isLikelyV5Switch(child.props)
        const isRedirect = typeName === 'Redirect' || isLikelyV5Redirect(child.props)

        if (isRoute && !isRedirect) {
          const childRoute = extractRouteFromElementV5(child, fullPath)
          if (childRoute) {
            childRoutes.push(childRoute)
          }
        }
        // Also check for nested Switch
        else if (isSwitch) {
          const switchChildren = extractRoutesFromSwitchProps(child.props, fullPath)
          childRoutes.push(...switchChildren)
        }
      }
    }
  }

  const hasChildren = childRoutes.length > 0

  const routeInfo: RouteInfo = {
    path: fullPath,
    element: getV5ComponentName(props),
    exact: props.exact === true,
    strict: props.strict === true,
    isLayout: hasChildren,
    isLazy: isLazyElement(props.component),
    params: params.length > 0 ? params : undefined,
  }

  if (hasChildren) {
    routeInfo.children = childRoutes
  }

  return routeInfo
}

/**
 * Extract routes from Switch component's children prop (React Router v5)
 */
function extractRoutesFromSwitchProps(props: any, parentPath: string = ''): RouteInfo[] {
  const routes: RouteInfo[] = []

  if (!props?.children)
    return routes

  const children = Array.isArray(props.children) ? props.children : [props.children]

  for (const child of children) {
    if (child && child.type) {
      const typeName = child.type.name || child.type.displayName

      // Check by name first, then by props characteristics (for minified code)
      const isRoute = typeName === 'Route' || isLikelyV5Route(child.props)
      const isRedirect = typeName === 'Redirect' || isLikelyV5Redirect(child.props)

      if (isRoute && !isRedirect) {
        const route = extractRouteFromElementV5(child, parentPath)
        if (route) {
          routes.push(route)
        }
      }
      // Handle Redirect (v5)
      else if (isRedirect) {
        const to = child.props?.to
        const toPath = typeof to === 'string' ? to : (to?.pathname || 'unknown')
        const redirectInfo: RouteInfo = {
          path: child.props?.from || '*',
          element: `Redirect → ${toPath}`,
          exact: child.props?.exact === true,
        }
        routes.push(redirectInfo)
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
          hasLoader: !!route?.loader,
          hasAction: !!route?.action,
          hasErrorBoundary: !!route?.errorElement,
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
 * Find Routes/Switch component and extract route configuration
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

    // Look for Switch component (React Router v5) - by name or by props characteristics
    const isSwitch = name === 'Switch' || isLikelyV5Switch(props)
    if (isSwitch) {
      const switchRoutes = extractRoutesFromSwitchProps(props)
      if (switchRoutes.length > 0) {
        routes = switchRoutes
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

    // Continue traversing to find Routes/Switch/Router components
    if (node.child) {
      traverse(node.child)
    }
    if (node.sibling) {
      traverse(node.sibling)
    }
  }

  traverse(fiber)

  // Fallback: If no routes found via component names/props, try context-based detection
  // This works even when component names are minified
  if (routes.length === 0) {
    routes = extractRoutesFromFiberV5(fiber)
  }

  return routes
}

/**
 * Match a path against a route pattern and extract params
 */
function matchPath(pattern: string, pathname: string): { matched: boolean, params: Record<string, string> } {
  const params: Record<string, string> = {}

  // Normalize paths
  const patternParts = pattern.split('/').filter(Boolean)
  const pathParts = pathname.split('/').filter(Boolean)

  // Index route matches empty path
  if (patternParts.length === 0 && pathParts.length === 0) {
    return { matched: true, params }
  }

  let patternIndex = 0
  let pathIndex = 0

  while (patternIndex < patternParts.length && pathIndex < pathParts.length) {
    const patternPart = patternParts[patternIndex]
    const pathPart = pathParts[pathIndex]

    if (patternPart.startsWith(':')) {
      // Dynamic segment
      const paramName = patternPart.slice(1).replace('?', '')
      params[paramName] = pathPart
    }
    else if (patternPart === '*') {
      // Splat route - matches rest of path
      params['*'] = pathParts.slice(pathIndex).join('/')
      return { matched: true, params }
    }
    else if (patternPart !== pathPart) {
      return { matched: false, params: {} }
    }

    patternIndex++
    pathIndex++
  }

  // Check for optional params at the end
  while (patternIndex < patternParts.length) {
    const part = patternParts[patternIndex]
    if (!part.endsWith('?') && !part.startsWith(':')) {
      return { matched: false, params: {} }
    }
    patternIndex++
  }

  // Layout routes can match even if there are more path parts
  return { matched: true, params }
}

/**
 * Find matched routes for a given path
 */
function findMatchedRoutes(routes: RouteInfo[], pathname: string): MatchedRoute[] {
  const matched: MatchedRoute[] = []

  function findInRoutes(routeList: RouteInfo[], currentPath: string): boolean {
    for (const route of routeList) {
      const { matched: isMatch, params } = matchPath(route.path, pathname)

      if (isMatch) {
        matched.push({
          path: route.path,
          params,
          element: route.element,
        })

        // If this is a layout route with children, continue matching
        if (route.children && route.children.length > 0) {
          findInRoutes(route.children, route.path)
        }

        // If this matches exactly or is an index route at current level, we're done
        if (route.path === pathname || route.isIndex) {
          return true
        }
      }
    }
    return matched.length > 0
  }

  findInRoutes(routes, pathname)
  return matched
}

/**
 * Get current URL information
 */
function getCurrentUrlInfo(): { path: string, search: string, hash: string } {
  // Check for hash router first
  if (window.location.hash && window.location.hash.startsWith('#/')) {
    const hashContent = window.location.hash.slice(1)
    const [pathAndSearch, hash] = hashContent.split('#')
    const [path, search] = (pathAndSearch || '/').split('?')
    return {
      path: path || '/',
      search: search ? `?${search}` : '',
      hash: hash ? `#${hash}` : '',
    }
  }

  return {
    path: window.location.pathname || '/',
    search: window.location.search || '',
    hash: window.location.hash || '',
  }
}

/**
 * Get current path from window.location
 */
function getCurrentPath(): string {
  return getCurrentUrlInfo().path
}

/**
 * Extract all params from matched routes
 */
function extractAllParams(matchedRoutes: MatchedRoute[]): Record<string, string> {
  const params: Record<string, string> = {}
  for (const route of matchedRoutes) {
    Object.assign(params, route.params)
  }
  return params
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
    const props = node.memoizedProps || node.pendingProps

    // Check for React Router components by name
    if (
      name === 'Router'
      || name === 'BrowserRouter'
      || name === 'HashRouter'
      || name === 'MemoryRouter'
      || name === 'Routes' // React Router v6
      || name === 'Switch' // React Router v5
      || name === 'Route'
    ) {
      return 'react-router'
    }

    // Also check by props characteristics (for minified code)
    if (isLikelyV5Switch(props) || isLikelyV5Route(props)) {
      return 'react-router'
    }

    // Check for Router context provider (works with minified code)
    // React Router v5 provides context with { history, location, match }
    if (isRouterContextProvider(node) || isRouteContextProvider(node)) {
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
 * Record navigation to history
 */
function recordNavigation(path: string, search: string, hash: string) {
  const now = Date.now()

  // Calculate duration if we have a start time
  if (lastNavigationStart !== null) {
    lastNavigationDuration = now - lastNavigationStart
  }

  // Add to history
  navigationHistory.unshift({
    path,
    search,
    hash,
    timestamp: now,
    duration: lastNavigationDuration,
  })

  // Keep only MAX_HISTORY_ENTRIES
  if (navigationHistory.length > MAX_HISTORY_ENTRIES) {
    navigationHistory.pop()
  }

  lastNavigationStart = null
}

/**
 * Get router information from the current React app
 */
export function getRouterInfo(): RouterState | null {
  const root = fiberRoot
  const urlInfo = getCurrentUrlInfo()

  if (!root?.current) {
    // Fallback: just return current path
    return {
      currentPath: urlInfo.path,
      search: urlInfo.search,
      hash: urlInfo.hash,
      routes: [],
      routerType: null,
      matchedRoutes: [],
      params: {},
      history: [...navigationHistory],
      lastNavigationDuration,
    }
  }

  const fiber = root.current

  // Detect router type
  const routerType = detectRouterType(fiber)

  // Extract routes from fiber tree
  const routes = findAndExtractRoutes(fiber.child)

  // Find matched routes for current path
  const matchedRoutes = findMatchedRoutes(routes, urlInfo.path)

  // Extract all params from matched routes
  const params = extractAllParams(matchedRoutes)

  return {
    currentPath: urlInfo.path,
    search: urlInfo.search,
    hash: urlInfo.hash,
    routes,
    routerType,
    matchedRoutes,
    params,
    history: [...navigationHistory],
    lastNavigationDuration,
  }
}

/**
 * Navigate to a path using various methods
 */
export function navigateTo(path: string): boolean {
  try {
    // Start timing
    lastNavigationStart = Date.now()

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
    lastNavigationStart = null
    return false
  }
}

/**
 * Clear navigation history
 */
export function clearNavigationHistory(): void {
  navigationHistory.length = 0
  lastNavigationDuration = undefined
}

/**
 * Initialize navigation tracking by listening to navigation events
 */
if (typeof window !== 'undefined') {
  let currentFullPath = ''

  const updateCurrentPath = () => {
    const urlInfo = getCurrentUrlInfo()
    currentFullPath = `${urlInfo.path}${urlInfo.search}${urlInfo.hash}`
  }

  const handleNavigation = () => {
    const urlInfo = getCurrentUrlInfo()
    const newFullPath = `${urlInfo.path}${urlInfo.search}${urlInfo.hash}`

    if (newFullPath !== currentFullPath) {
      recordNavigation(urlInfo.path, urlInfo.search, urlInfo.hash)
      currentFullPath = newFullPath
    }
  }

  // Listen for popstate (browser back/forward)
  window.addEventListener('popstate', handleNavigation)

  // Listen for hashchange (HashRouter)
  window.addEventListener('hashchange', handleNavigation)

  // Also track pushState and replaceState (BrowserRouter)
  const originalPushState = window.history.pushState
  const originalReplaceState = window.history.replaceState

  window.history.pushState = function (...args) {
    const result = originalPushState.apply(this, args)
    handleNavigation()
    return result
  }

  window.history.replaceState = function (...args) {
    const result = originalReplaceState.apply(this, args)
    updateCurrentPath()
    return result
  }

  // Record initial navigation
  const urlInfo = getCurrentUrlInfo()
  recordNavigation(urlInfo.path, urlInfo.search, urlInfo.hash)
  currentFullPath = `${urlInfo.path}${urlInfo.search}${urlInfo.hash}`
}
