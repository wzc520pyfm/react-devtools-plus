import type { PropValue } from '@react-devtools/kit'
import { getRpcClient } from '@react-devtools/kit'
import { useCallback, useEffect, useState } from 'react'

/**
 * Context Provider information (matches kit types)
 */
interface ContextProviderInfo {
  id: string
  name: string
  value: PropValue
  fiberId: string
  consumerCount: number
  consumers: ContextConsumerInfo[]
  children: ContextProviderInfo[]
  source?: {
    fileName: string
    lineNumber: number
    columnNumber: number
  }
}

interface ContextConsumerInfo {
  id: string
  name: string
  fiberId: string
}

interface ContextTree {
  providers: ContextProviderInfo[]
  totalProviders: number
  totalConsumers: number
}

interface ServerRpcFunctions {
  getContextTree: () => Promise<ContextTree | null>
  getContextProviderDetails: (fiberId: string) => Promise<ContextProviderInfo | null>
  highlightNode: (fiberId: string) => void
  hideHighlight: () => void
  openInEditor: (options: { fileName: string, line: number, column: number }) => void
}

// Icons
function ContextIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
      <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
      <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
      <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
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

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  )
}

// Value display helpers
function getValueColorClass(type: PropValue['type']) {
  switch (type) {
    case 'string':
      return 'text-green-600 dark:text-green-400'
    case 'number':
      return 'text-blue-600 dark:text-blue-400'
    case 'boolean':
      return 'text-purple-600 dark:text-purple-400'
    case 'null':
    case 'undefined':
      return 'text-gray-400 dark:text-gray-500'
    case 'function':
      return 'text-cyan-600 dark:text-cyan-400'
    case 'element':
      return 'text-primary-600 dark:text-primary-400'
    case 'array':
    case 'object':
      return 'text-yellow-600 dark:text-yellow-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

function ContextValueDisplay({ value, depth = 0 }: { value: PropValue, depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(depth < 2)
  const hasChildren = value.children && Object.keys(value.children).length > 0
  const isExpandable = hasChildren && (value.type === 'object' || value.type === 'array')

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isExpandable) {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <div className="text-xs font-mono">
      <div
        className={`flex items-start gap-1 py-0.5 ${isExpandable ? 'cursor-pointer hover:bg-gray-50 rounded dark:hover:bg-gray-800/50' : ''}`}
        style={{ paddingLeft: `${depth * 12}px` }}
        onClick={handleToggle}
      >
        {isExpandable
          ? (
              <svg
                className={`mt-0.5 h-3 w-3 flex-shrink-0 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            )
          : (
              <span className="w-3 flex-shrink-0" />
            )}

        <span className={getValueColorClass(value.type)} title={value.preview || value.value}>
          {value.value}
          {value.preview && !isExpanded && (
            <span className="ml-1 text-gray-400">{value.preview}</span>
          )}
        </span>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {Object.entries(value.children!).map(([childName, childValue]) => (
            <div key={childName} className="flex items-start gap-1 py-0.5" style={{ paddingLeft: `${(depth + 1) * 12}px` }}>
              <span className="w-3 flex-shrink-0" />
              <span className="text-pink-600 dark:text-pink-400">{childName}</span>
              <span className="text-gray-400">:</span>
              <ContextValueDisplay value={childValue} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Provider card component
interface ProviderCardProps {
  provider: ContextProviderInfo
  level?: number
  onSelectConsumer?: (fiberId: string) => void
}

function ProviderCard({ provider, level = 0, onSelectConsumer }: ProviderCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showConsumers, setShowConsumers] = useState(false)

  const handleMouseEnter = useCallback(() => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (rpc?.highlightNode) {
      rpc.highlightNode(provider.fiberId)
    }
  }, [provider.fiberId])

  const handleMouseLeave = useCallback(() => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (rpc?.hideHighlight) {
      rpc.hideHighlight()
    }
  }, [])

  const handleOpenInEditor = useCallback(() => {
    if (provider.source) {
      const rpc = getRpcClient<ServerRpcFunctions>()
      if (rpc?.openInEditor) {
        rpc.openInEditor({
          fileName: provider.source.fileName,
          line: provider.source.lineNumber,
          column: provider.source.columnNumber,
        })
      }
    }
  }, [provider.source])

  const handleConsumerClick = useCallback((fiberId: string) => {
    onSelectConsumer?.(fiberId)
  }, [onSelectConsumer])

  const handleConsumerMouseEnter = useCallback((fiberId: string) => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (rpc?.highlightNode) {
      rpc.highlightNode(fiberId)
    }
  }, [])

  const handleConsumerMouseLeave = useCallback(() => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (rpc?.hideHighlight) {
      rpc.hideHighlight()
    }
  }, [])

  return (
    <div
      className={`border rounded-lg bg-white shadow-sm transition-shadow dark:bg-neutral-900 hover:shadow-md ${level > 0 ? 'ml-4 mt-2 border-dashed border-gray-300 dark:border-gray-600' : 'border-gray-200 dark:border-gray-700'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded p-0.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDownIcon
              className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
            />
          </button>

          <div className="flex items-center gap-2">
            <ContextIcon className="h-4 w-4 text-purple-500" />
            <span className="text-gray-900 font-medium font-mono dark:text-white">
              {provider.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Consumer count badge */}
          <button
            type="button"
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors ${
              showConsumers
                ? 'bg-purple-500 text-white'
                : 'bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-400 dark:hover:bg-purple-900'
            }`}
            onClick={() => setShowConsumers(!showConsumers)}
            title={`${provider.consumerCount} consumers`}
          >
            <UsersIcon className="h-3 w-3" />
            <span>{provider.consumerCount}</span>
          </button>

          {/* Open in editor button */}
          {provider.source && (
            <button
              type="button"
              className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              onClick={handleOpenInEditor}
              title="Open in editor"
            >
              <ExternalLinkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Value section */}
          <div className="mb-3">
            <div className="mb-1 text-xs text-gray-500 font-medium uppercase tracking-wide dark:text-gray-400">
              Value
            </div>
            <div className="rounded bg-gray-50 p-2 dark:bg-gray-800/50">
              <ContextValueDisplay value={provider.value} />
            </div>
          </div>

          {/* Consumers list */}
          {showConsumers && provider.consumers.length > 0 && (
            <div className="mb-3">
              <div className="mb-1 text-xs text-gray-500 font-medium uppercase tracking-wide dark:text-gray-400">
                Consumers ({provider.consumers.length})
              </div>
              <div className="max-h-40 space-y-1 overflow-y-auto rounded bg-gray-50 p-2 dark:bg-gray-800/50">
                {provider.consumers.map(consumer => (
                  <button
                    key={consumer.id}
                    type="button"
                    className="w-full rounded px-2 py-1 text-left text-xs text-primary-600 font-mono transition-colors hover:bg-gray-100 dark:text-primary-400 dark:hover:bg-gray-700"
                    onClick={() => handleConsumerClick(consumer.fiberId)}
                    onMouseEnter={() => handleConsumerMouseEnter(consumer.fiberId)}
                    onMouseLeave={handleConsumerMouseLeave}
                  >
                    {'<'}
                    {consumer.name}
                    {'>'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Source info */}
          {provider.source && (
            <div className="text-xs text-gray-400">
              <span className="font-mono">
                {provider.source.fileName.split('/').pop()}
                :
                {provider.source.lineNumber}
              </span>
            </div>
          )}

          {/* Nested providers */}
          {provider.children.length > 0 && (
            <div className="mt-3">
              <div className="mb-1 text-xs text-gray-500 font-medium uppercase tracking-wide dark:text-gray-400">
                Nested Providers ({provider.children.length})
              </div>
              {provider.children.map(child => (
                <ProviderCard
                  key={child.id}
                  provider={child}
                  level={level + 1}
                  onSelectConsumer={onSelectConsumer}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Main ContextPage component
export function ContextPage() {
  const [contextTree, setContextTree] = useState<ContextTree | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchContextTree = useCallback(async () => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (!rpc)
      return

    try {
      const tree = await rpc.getContextTree()
      setContextTree(tree)
    }
    catch (e) {
      console.debug('[ContextPage] Failed to fetch context tree:', e)
    }
    finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContextTree()

    if (autoRefresh) {
      const interval = setInterval(fetchContextTree, 2000)
      return () => clearInterval(interval)
    }
  }, [fetchContextTree, autoRefresh])

  const handleSelectConsumer = useCallback((fiberId: string) => {
    // Navigate to components page and select the consumer
    // This would need integration with the parent App component
    console.log('[ContextPage] Select consumer:', fiberId)
  }, [])

  // Filter providers based on search query
  const filteredProviders = contextTree?.providers.filter((provider) => {
    if (!searchQuery)
      return true
    const query = searchQuery.toLowerCase()
    return provider.name.toLowerCase().includes(query)
      || provider.consumers.some(c => c.name.toLowerCase().includes(query))
  }) ?? []

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50/50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="h-8 w-8 animate-spin border-2 border-primary-500 border-t-transparent rounded-full" />
          <span>Loading contexts...</span>
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
            <ContextIcon className="h-5 w-5 text-primary-500" />
            <h1 className="text-lg text-gray-900 font-semibold dark:text-white">Context</h1>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-600 font-medium dark:bg-purple-900/50 dark:text-purple-400">
                {contextTree?.totalProviders || 0} providers
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                {contextTree?.totalConsumers || 0} consumers
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-48">
              <svg className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full border border-gray-200 rounded-lg bg-gray-50 py-1.5 pl-9 pr-3 text-sm transition-colors dark:border-gray-700 focus:border-primary-500 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Search..."
              />
            </div>

            {/* Auto refresh toggle */}
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={e => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto
            </label>

            {/* Refresh button */}
            <button
              type="button"
              className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              onClick={() => fetchContextTree()}
              title="Refresh"
            >
              <RefreshIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {filteredProviders.length === 0
          ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <ContextIcon className="mb-4 h-16 w-16 opacity-30" />
                <p className="text-lg font-medium">
                  {searchQuery ? 'No matching contexts found' : 'No Context Providers detected'}
                </p>
                <p className="mt-2 text-sm opacity-70">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Create a Context.Provider in your app to see it here'}
                </p>
              </div>
            )
          : (
              <div className="mx-auto max-w-4xl space-y-4">
                {filteredProviders.map(provider => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    onSelectConsumer={handleSelectConsumer}
                  />
                ))}
              </div>
            )}
      </div>

      {/* Info footer */}
      <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-2 dark:border-gray-800 dark:bg-[#121212]">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            Hover over a provider to highlight it in the page
          </span>
          <span>
            Click on consumers to navigate to them
          </span>
        </div>
      </div>
    </div>
  )
}

