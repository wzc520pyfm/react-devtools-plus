/**
 * GraphPage - Shows module dependency graph
 * 模块依赖图页面
 */

import type { ModuleInfo } from '~/types/graph'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Network } from 'vis-network'
import { GraphDrawer, GraphFileType, GraphNavbar } from '~/components/graph'
import { useGraph } from '~/composables/useGraph'

export function GraphPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const navbarRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const networkInitialized = useRef(false)

  const {
    graphSettings,
    setGraphSettings,
    searchText,
    setSearchText,
    filterNodeId,
    setFilterNodeId,
    drawerData,
    drawerShow,
    graphNodesRef,
    graphEdgesRef,
    networkRef,
    graphOptions,
    parseGraphRawData,
    updateDrawerData,
    toggleDrawer,
    closeDrawer,
    cleanup,
  } = useGraph()

  // Initialize network immediately when container is available
  const initNetwork = useCallback(() => {
    if (!containerRef.current || networkInitialized.current)
      return

    networkInitialized.current = true

    const network = new Network(
      containerRef.current,
      { nodes: graphNodesRef.current, edges: graphEdgesRef.current },
      graphOptions,
    )

    networkRef.current = network

    // Event handlers
    network.on('selectNode', (options: { nodes: string[] }) => {
      updateDrawerData(options.nodes[0])
      toggleDrawer(true)
    })

    network.on('deselectNode', () => {
      toggleDrawer(false)
    })
  }, [graphOptions, graphNodesRef, graphEdgesRef, networkRef, updateDrawerData, toggleDrawer])

  // Fetch graph data from server via API endpoint
  const fetchGraph = useCallback(async () => {
    try {
      setError(null)
      const origin = window.parent?.location?.origin || window.location.origin
      const pathname = window.location.pathname.replace(/#.*$/, '').replace(/\/$/, '')

      // Check if running in Next.js environment (custom path like /devtools)
      const isNextJs = pathname !== '' && pathname !== '/__react_devtools__'

      let response: Response

      if (isNextJs) {
        // In Next.js, use the custom basePath directly to avoid 404 logs
        response = await fetch(`${window.location.origin}${pathname}/api/graph`)
        if (!response.ok) {
          // Fallback to standard path
          response = await fetch(`${origin}/__react_devtools_api__/graph`)
        }
      }
      else {
        // Standard Vite/Webpack environment
        response = await fetch(`${origin}/__react_devtools_api__/graph`)
        if (!response.ok) {
          // Fallback to basePath
          response = await fetch(`${window.location.origin}${pathname}/api/graph`)
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: { modules: ModuleInfo[], root: string } = await response.json()
      parseGraphRawData(data.modules, data.root)
    }
    catch (e) {
      console.error('[Graph] Failed to fetch graph data:', e)
      setError(e instanceof Error ? e.message : 'Failed to fetch graph data')
    }
  }, [parseGraphRawData])

  // Initialize network on mount
  useEffect(() => {
    // Use requestAnimationFrame to ensure container is rendered
    requestAnimationFrame(() => {
      initNetwork()
    })

    return () => {
      networkRef.current?.destroy()
      networkInitialized.current = false
      cleanup()
    }
  }, [])

  // Fetch data on mount (parallel with network init)
  useEffect(() => {
    fetchGraph()
  }, [])

  // Move to center when filter changes
  useEffect(() => {
    if (filterNodeId && networkRef.current) {
      networkRef.current.moveTo({ position: { x: 0, y: 0 } })
    }
  }, [filterNodeId])

  return (
    <div className="relative h-full flex flex-col overflow-hidden bg-gray-50/50 dark:bg-neutral-900/50">
      {/* Navbar */}
      <div ref={navbarRef}>
        <GraphNavbar
          searchText={searchText}
          onSearchChange={setSearchText}
          settings={graphSettings}
          onSettingsChange={setGraphSettings}
          filterNodeId={filterNodeId}
          onClearFilter={() => setFilterNodeId('')}
        />
      </div>

      {/* Graph container */}
      <div className="relative flex-1 pt-12">
        <div ref={containerRef} className="absolute inset-0" />

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50/90 dark:bg-neutral-900/90">
            <div className="flex flex-col items-center gap-4">
              <svg className="h-12 w-12 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-center">
                <p className="text-lg text-gray-700 font-medium dark:text-gray-300">Failed to load module graph</p>
                <p className="mt-1 text-sm text-gray-500">{error}</p>
              </div>
              <button
                onClick={fetchGraph}
                className="mt-2 rounded-md bg-primary-500 px-4 py-2 text-sm text-white font-medium transition-colors hover:bg-primary-600"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* File type legend */}
        <GraphFileType />

        {/* Node details drawer */}
        <GraphDrawer
          data={drawerData}
          show={drawerShow}
          onClose={closeDrawer}
          onFilterModule={setFilterNodeId}
        />
      </div>
    </div>
  )
}
