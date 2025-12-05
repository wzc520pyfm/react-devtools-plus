import { getRpcClient } from '@react-devtools/kit'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface RouteInfo {
  path: string
  name?: string
  element?: string
  children?: RouteInfo[]
  isIndex?: boolean
  isLayout?: boolean
  hasLoader?: boolean
  hasAction?: boolean
  isLazy?: boolean
  hasErrorBoundary?: boolean
  params?: string[]
}

interface MatchedRoute {
  path: string
  params: Record<string, string>
  element?: string
}

interface NavigationEntry {
  path: string
  search: string
  hash: string
  timestamp: number
  duration?: number
}

interface RouterState {
  currentPath: string
  search: string
  hash: string
  routes: RouteInfo[]
  routerType: 'react-router' | 'unknown' | null
  matchedRoutes: MatchedRoute[]
  params: Record<string, string>
  history: NavigationEntry[]
  lastNavigationDuration?: number
}

interface ServerRpcFunctions {
  getRouterInfo: () => Promise<RouterState | null>
  navigateTo: (path: string) => Promise<boolean>
  clearNavigationHistory: () => Promise<void>
}

// Icons
function RouteIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    </svg>
  )
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

// Helper functions
function countRoutes(routes: RouteInfo[]): number {
  let count = 0
  for (const route of routes) {
    count += 1
    if (route.children) {
      count += countRoutes(route.children)
    }
  }
  return count
}

function flattenRoutesForSearch(routes: RouteInfo[], parentPath = ''): RouteInfo[] {
  const result: RouteInfo[] = []
  for (const route of routes) {
    result.push(route)
    if (route.children) {
      result.push(...flattenRoutesForSearch(route.children, route.path))
    }
  }
  return result
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { hour12: false })
}

function formatDuration(ms?: number): string {
  if (ms === undefined)
    return '-'
  if (ms < 1000)
    return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

function highlightParams(path: string): React.ReactNode {
  const parts = path.split(/(:\w+\??)/g)
  return parts.map((part, i) => {
    if (part.startsWith(':')) {
      return (
        <span key={`param-${i}`} className="text-amber-500 font-semibold">
          {part}
        </span>
      )
    }
    return part
  })
}

// Route Tree Item Component
function RouteTreeItem({
  route,
  currentPath,
  searchQuery,
  level = 0,
  onNavigate,
  onCopy,
}: {
  route: RouteInfo
  currentPath: string
  searchQuery: string
  level?: number
  onNavigate: (path: string) => void
  onCopy: (path: string) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = route.children && route.children.length > 0

  // Check if matches search
  const matchesSearch = !searchQuery
    || route.path.toLowerCase().includes(searchQuery.toLowerCase())
    || route.element?.toLowerCase().includes(searchQuery.toLowerCase())

  // Check if any children match search
  const childMatchesSearch = route.children?.some(child =>
    child.path.toLowerCase().includes(searchQuery.toLowerCase())
    || child.element?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (!matchesSearch && !childMatchesSearch)
    return null

  const isExactMatch = route.path === currentPath
  const isLayoutActive = hasChildren && (currentPath === route.path || currentPath.startsWith(route.path === '/' ? '/' : `${route.path}/`))
  const showActiveBadge = isExactMatch && !hasChildren
  const isHighlighted = isExactMatch || (isLayoutActive && !hasChildren)

  const displayPath = route.isIndex ? 'index' : (level > 0 ? route.path.split('/').pop() || route.path : route.path)

  return (
    <div className="w-full">
      <div
        className={`group flex cursor-pointer items-center gap-1.5 py-1.5 pr-3 transition-colors ${
          isHighlighted
            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
            : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/30'
        }`}
        style={{ paddingLeft: `${12 + level * 20}px` }}
        onClick={() => onNavigate(route.path)}
      >
        {/* Expand/Collapse button */}
        {hasChildren
          ? (
              <button
                className="shrink-0 rounded p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation()
                  setExpanded(!expanded)
                }}
              >
                <ChevronDownIcon
                  className={`h-3.5 w-3.5 text-gray-400 transition-transform ${expanded ? '' : '-rotate-90'}`}
                />
              </button>
            )
          : (
              <span className="w-5" />
            )}

        {/* Route type icon */}
        {hasChildren
          ? (
              <FolderIcon className="h-4 w-4 shrink-0 text-amber-500" />
            )
          : route.isIndex
            ? (
                <HomeIcon className="h-4 w-4 shrink-0 text-blue-500" />
              )
            : (
                <FileIcon className="h-4 w-4 shrink-0 text-gray-400" />
              )}

        {/* Route path with param highlighting */}
        <div className="min-w-0 flex flex-1 items-center gap-1.5">
          <span className={`truncate text-sm font-mono ${isHighlighted ? 'text-primary-600 dark:text-primary-400' : ''}`}>
            {highlightParams(displayPath)}
          </span>

          {/* Badges */}
          {showActiveBadge && (
            <span className="shrink-0 rounded bg-primary-500 px-1.5 py-0.5 text-xs text-white font-medium">
              active
            </span>
          )}
          {route.isIndex && (
            <span className="shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-600 font-medium dark:bg-blue-900/50 dark:text-blue-400">
              index
            </span>
          )}
          {route.isLayout && (
            <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-600 font-medium dark:bg-amber-900/50 dark:text-amber-400">
              layout
            </span>
          )}
          {route.hasLoader && (
            <span className="shrink-0 rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-600 font-medium dark:bg-green-900/50 dark:text-green-400">
              loader
            </span>
          )}
          {route.hasAction && (
            <span className="shrink-0 rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-600 font-medium dark:bg-purple-900/50 dark:text-purple-400">
              action
            </span>
          )}
          {route.isLazy && (
            <span className="shrink-0 rounded bg-cyan-100 px-1.5 py-0.5 text-xs text-cyan-600 font-medium dark:bg-cyan-900/50 dark:text-cyan-400">
              lazy
            </span>
          )}
          {route.hasErrorBoundary && (
            <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600 font-medium dark:bg-red-900/50 dark:text-red-400">
              error
            </span>
          )}
        </div>

        {/* Element name */}
        <span className="shrink-0 text-xs text-gray-400 font-mono">
          {route.element || '-'}
        </span>

        {/* Copy button */}
        <button
          className="shrink-0 rounded p-1 opacity-0 transition-opacity hover:bg-gray-200 group-hover:opacity-100 dark:hover:bg-gray-700"
          onClick={(e) => {
            e.stopPropagation()
            onCopy(route.path)
          }}
          title="Copy path"
        >
          <CopyIcon className="h-3.5 w-3.5 text-gray-400" />
        </button>
      </div>

      {/* Children routes */}
      {hasChildren && expanded && (
        <div className="relative">
          <div
            className="absolute bottom-2 left-0 top-0 w-px bg-gray-200 dark:bg-gray-700"
            style={{ marginLeft: `${22 + level * 20}px` }}
          />
          {route.children!.map((child, index) => (
            <RouteTreeItem
              key={`${child.path}-${index}`}
              route={child}
              currentPath={currentPath}
              searchQuery={searchQuery}
              level={level + 1}
              onNavigate={onNavigate}
              onCopy={onCopy}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Main RoutesPage Component
export function RoutesPage() {
  const [routerState, setRouterState] = useState<RouterState | null>(null)
  const [inputPath, setInputPath] = useState('')
  const [inputSearch, setInputSearch] = useState('')
  const [inputHash, setInputHash] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [copiedPath, setCopiedPath] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'routes' | 'history'>('routes')
  const [isRoutesCollapsed, setIsRoutesCollapsed] = useState(false)

  // Track if this is the first load to sync input values
  const isFirstLoad = useRef(true)
  // Track the last known path to detect real route changes
  const lastKnownPath = useRef<string>('')

  const fetchRouterInfo = useCallback(async () => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (!rpc)
      return

    try {
      const info = await rpc.getRouterInfo()
      if (info) {
        setRouterState(info)

        // Only update input values on first load or when the route actually changed externally
        const currentFullPath = `${info.currentPath}${info.search}${info.hash}`
        if (isFirstLoad.current || lastKnownPath.current !== currentFullPath) {
          setInputPath(info.currentPath)
          setInputSearch(info.search)
          setInputHash(info.hash)
          lastKnownPath.current = currentFullPath
          isFirstLoad.current = false
        }
      }
    }
    catch (e) {
      console.debug('[RoutesPage] Failed to fetch router info:', e)
    }
    finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRouterInfo()
    const interval = setInterval(fetchRouterInfo, 500)
    return () => clearInterval(interval)
  }, [fetchRouterInfo])

  const handleNavigate = useCallback(async (fullPath: string) => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (!rpc)
      return

    try {
      const success = await rpc.navigateTo(fullPath)
      if (success) {
        // Parse the path to update input fields
        const hashIndex = fullPath.indexOf('#')
        const queryIndex = fullPath.indexOf('?')

        let path = fullPath
        let query = ''
        let hash = ''

        if (hashIndex !== -1) {
          hash = fullPath.slice(hashIndex)
          path = fullPath.slice(0, hashIndex)
        }

        if (queryIndex !== -1 && (hashIndex === -1 || queryIndex < hashIndex)) {
          const endIndex = hashIndex !== -1 ? hashIndex : fullPath.length
          query = fullPath.slice(queryIndex, endIndex)
          path = fullPath.slice(0, queryIndex)
        }

        setInputPath(path)
        setInputSearch(query)
        setInputHash(hash)
        // Update lastKnownPath so next poll won't override our navigation
        lastKnownPath.current = fullPath
      }
    }
    catch (e) {
      console.error('[RoutesPage] Failed to navigate:', e)
    }
  }, [])

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputPath) {
      const fullPath = `${inputPath}${inputSearch}${inputHash}`
      handleNavigate(fullPath)
    }
  }

  const handleCopy = useCallback((path: string) => {
    navigator.clipboard.writeText(path)
    setCopiedPath(path)
    setTimeout(() => setCopiedPath(null), 2000)
  }, [])

  const handleClearHistory = useCallback(async () => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (!rpc)
      return

    try {
      await rpc.clearNavigationHistory()
      fetchRouterInfo()
    }
    catch (e) {
      console.error('[RoutesPage] Failed to clear history:', e)
    }
  }, [fetchRouterInfo])

  const totalRoutes = useMemo(() => routerState?.routes ? countRoutes(routerState.routes) : 0, [routerState?.routes])

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50/50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="h-8 w-8 animate-spin border-2 border-primary-500 border-t-transparent rounded-full" />
          <span>Loading routes...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-gray-50/50 dark:bg-neutral-950">
      {/* Header */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-[#121212]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RouteIcon className="h-5 w-5 text-primary-500" />
            <h1 className="text-lg text-gray-900 font-semibold dark:text-white">Routes</h1>
            {routerState?.routerType && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                {routerState.routerType}
              </span>
            )}
          </div>

          {/* Search */}
          <div className="relative w-64">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full border border-gray-200 rounded-lg bg-gray-50 py-1.5 pl-9 pr-3 text-sm transition-colors dark:border-gray-700 focus:border-primary-500 dark:bg-gray-900 focus:bg-white dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 dark:focus:bg-gray-800"
              placeholder="Search routes..."
            />
          </div>
        </div>
      </div>

      {/* Matched Route Chain */}
      {routerState?.matchedRoutes && routerState.matchedRoutes.length > 0 && (
        <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-2 dark:border-gray-800 dark:bg-[#121212]">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Matched:</span>
            <div className="flex items-center gap-1">
              {routerState.matchedRoutes.map((route, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <ChevronRightIcon className="h-4 w-4 text-gray-400" />}
                  <button
                    className="rounded bg-primary-100 px-2 py-0.5 text-primary-600 font-mono transition-colors dark:bg-primary-900/50 hover:bg-primary-200 dark:text-primary-400 dark:hover:bg-primary-900"
                    onClick={() => handleNavigate(route.path)}
                  >
                    {route.element || route.path}
                  </button>
                </div>
              ))}
            </div>
            {routerState.lastNavigationDuration !== undefined && (
              <span className="ml-auto text-xs text-gray-400">
                <ClockIcon className="mr-1 inline h-3 w-3" />
                {formatDuration(routerState.lastNavigationDuration)}
              </span>
            )}
          </div>

          {/* Current Params */}
          {Object.keys(routerState.params).length > 0 && (
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Params:</span>
              {Object.entries(routerState.params).map(([key, value]) => (
                <span
                  key={key}
                  className="rounded bg-amber-100 px-2 py-0.5 text-xs font-mono dark:bg-amber-900/50"
                >
                  <span className="text-amber-600 dark:text-amber-400">
                    :
                    {key}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400"> = </span>
                  <span className="text-gray-700 dark:text-gray-300">{value}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation Input */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-[#121212]">
        <label className="mb-2 block text-sm text-gray-500 font-medium dark:text-gray-400">
          Navigate to
        </label>
        <form onSubmit={handleInputSubmit} className="flex gap-2">
          {/* Path */}
          <div className="flex-1">
            <input
              type="text"
              value={inputPath}
              onChange={(e) => {
                const value = e.target.value
                // Parse path, query, and hash from the input
                const hashIndex = value.indexOf('#')
                const queryIndex = value.indexOf('?')

                let path = value
                let query = ''
                let hash = ''

                if (hashIndex !== -1) {
                  hash = value.slice(hashIndex)
                  path = value.slice(0, hashIndex)
                }

                if (queryIndex !== -1 && (hashIndex === -1 || queryIndex < hashIndex)) {
                  const endIndex = hashIndex !== -1 ? hashIndex : value.length
                  query = value.slice(queryIndex, endIndex)
                  path = value.slice(0, queryIndex)
                }

                setInputPath(path)
                if (query)
                  setInputSearch(query)
                if (hash)
                  setInputHash(hash)
              }}
              className="w-full border border-gray-300 rounded-lg bg-white px-3 py-2 text-sm font-mono transition-colors dark:border-gray-700 focus:border-primary-500 dark:bg-[#1a1a1a] dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="/path"
            />
          </div>
          {/* Search params */}
          <div className="w-32">
            <input
              type="text"
              value={inputSearch}
              onChange={(e) => {
                const value = e.target.value
                // Remove leading ? if user is clearing the field
                if (value === '' || value === '?') {
                  setInputSearch('')
                }
                else {
                  setInputSearch(value.startsWith('?') ? value : `?${value}`)
                }
              }}
              className="w-full border border-gray-300 rounded-lg bg-white px-3 py-2 text-sm font-mono transition-colors dark:border-gray-700 focus:border-primary-500 dark:bg-[#1a1a1a] dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="?query"
            />
          </div>
          {/* Hash */}
          <div className="w-24">
            <input
              type="text"
              value={inputHash}
              onChange={(e) => {
                const value = e.target.value
                // Remove leading # if user is clearing the field
                if (value === '' || value === '#') {
                  setInputHash('')
                }
                else {
                  setInputHash(value.startsWith('#') ? value : `#${value}`)
                }
              }}
              className="w-full border border-gray-300 rounded-lg bg-white px-3 py-2 text-sm font-mono transition-colors dark:border-gray-700 focus:border-primary-500 dark:bg-[#1a1a1a] dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="#hash"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-primary-500 px-4 py-2 text-sm text-white font-medium transition-colors disabled:cursor-not-allowed hover:bg-primary-600 disabled:opacity-50"
          >
            Go
          </button>
        </form>
        {copiedPath && (
          <p className="mt-1 text-xs text-green-500">
            Copied:
            {' '}
            {copiedPath}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="shrink-0 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-[#121212]">
        <div className="flex">
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'routes'
                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('routes')}
          >
            <RouteIcon className="mr-1.5 inline h-4 w-4" />
            Routes
            <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">
              {totalRoutes}
            </span>
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('history')}
          >
            <ClockIcon className="mr-1.5 inline h-4 w-4" />
            History
            <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">
              {routerState?.history?.length || 0}
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'routes' ? (
          <div className="border border-gray-200 rounded-xl bg-white dark:border-gray-800 dark:bg-[#121212]">
            {/* Section Header */}
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50"
              onClick={() => setIsRoutesCollapsed(!isRoutesCollapsed)}
            >
              <div className="flex items-center gap-2">
                <RouteIcon className="h-5 w-5 text-gray-400" />
                <span className="text-gray-900 font-medium dark:text-white">Route Tree</span>
              </div>
              <ChevronDownIcon
                className={`h-5 w-5 text-gray-400 transition-transform ${isRoutesCollapsed ? '-rotate-90' : ''}`}
              />
            </button>

            {/* Routes Tree */}
            {!isRoutesCollapsed && (
              <div className="border-t border-gray-200 dark:border-gray-800">
                {/* Table Header */}
                <div className="flex border-b border-gray-100 bg-gray-50/50 px-4 py-2 text-xs text-gray-500 font-semibold tracking-wide uppercase dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400">
                  <div className="flex-1">Route Path</div>
                  <div className="w-24 text-right">Component</div>
                </div>

                {/* Route Tree */}
                <div className="py-2">
                  {routerState?.routes.length === 0
                    ? (
                        <div className="px-4 py-8 text-center text-gray-400">
                          <RouteIcon className="mx-auto mb-2 h-8 w-8 opacity-50" />
                          <p>No routes detected</p>
                          <p className="mt-1 text-xs">Make sure your app uses React Router</p>
                        </div>
                      )
                    : (
                        routerState?.routes.map((route, index) => (
                          <RouteTreeItem
                            key={`${route.path}-${index}`}
                            route={route}
                            currentPath={routerState.currentPath}
                            searchQuery={searchQuery}
                            onNavigate={handleNavigate}
                            onCopy={handleCopy}
                          />
                        ))
                      )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* History Tab */
          <div className="border border-gray-200 rounded-xl bg-white dark:border-gray-800 dark:bg-[#121212]">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <span className="text-gray-900 font-medium dark:text-white">Navigation History</span>
              </div>
              <button
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                onClick={handleClearHistory}
              >
                <TrashIcon className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {routerState?.history?.length === 0
                ? (
                    <div className="px-4 py-8 text-center text-gray-400">
                      <ClockIcon className="mx-auto mb-2 h-8 w-8 opacity-50" />
                      <p>No navigation history</p>
                    </div>
                  )
                : (
                    routerState?.history?.map((entry, index) => (
                      <div
                        key={`${entry.timestamp}-${index}`}
                        className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50"
                        onClick={() => handleNavigate(entry.path + entry.search + entry.hash)}
                      >
                        <span className="w-16 shrink-0 text-xs text-gray-400">
                          {formatTime(entry.timestamp)}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm text-gray-700 font-mono dark:text-gray-300">
                          {entry.path}
                          {entry.search && <span className="text-blue-500">{entry.search}</span>}
                          {entry.hash && <span className="text-purple-500">{entry.hash}</span>}
                        </span>
                        {entry.duration !== undefined && (
                          <span className="shrink-0 text-xs text-gray-400">
                            {formatDuration(entry.duration)}
                          </span>
                        )}
                        {index === 0 && (
                          <span className="shrink-0 rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-600 font-medium dark:bg-green-900/50 dark:text-green-400">
                            current
                          </span>
                        )}
                      </div>
                    ))
                  )}
            </div>
          </div>
        )}

        {/* Legend */}
        {activeTab === 'routes' && (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 px-2 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <FolderIcon className="h-3.5 w-3.5 text-amber-500" />
              <span>Layout</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HomeIcon className="h-3.5 w-3.5 text-blue-500" />
              <span>Index</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileIcon className="h-3.5 w-3.5 text-gray-400" />
              <span>Route</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-green-100 px-1 text-green-600 dark:bg-green-900/50 dark:text-green-400">loader</span>
              <span>Has loader</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-purple-100 px-1 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400">action</span>
              <span>Has action</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-cyan-100 px-1 text-cyan-600 dark:bg-cyan-900/50 dark:text-cyan-400">lazy</span>
              <span>Lazy loaded</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-500 font-mono">:param</span>
              <span>Dynamic segment</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
