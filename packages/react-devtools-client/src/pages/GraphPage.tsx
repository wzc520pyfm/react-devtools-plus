/**
 * GraphPage - Shows module dependency graph
 * 模块依赖图页面
 */

import type { ModuleInfo } from '~/types/graph'
import { Network } from 'vis-network'
import { useCallback, useEffect, useRef, useState } from 'react'
import { GraphDrawer, GraphFileType, GraphNavbar } from '~/components/graph'
import { useGraph } from '~/composables/useGraph'

export function GraphPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const navbarRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    graphSettings,
    setGraphSettings,
    searchText,
    setSearchText,
    filterNodeId,
    setFilterNodeId,
    drawerData,
    drawerShow,
    showStabilizing,
    setShowStabilizing,
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

  // Fetch graph data from server via API endpoint
  const fetchGraph = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // Use parent window's origin since we're in an iframe
      const origin = window.parent?.location?.origin || window.location.origin
      const response = await fetch(`${origin}/__react_devtools_api__/graph`)
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
    finally {
      setLoading(false)
    }
  }, [parseGraphRawData])

  // Mount network visualization - depends on loading state to ensure container exists
  useEffect(() => {
    if (loading || !containerRef.current)
      return

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

    network.on('startStabilizing', () => {
      setShowStabilizing(true)
    })

    network.on('stabilized', () => {
      setShowStabilizing(false)
    })

    network.on('deselectNode', () => {
      toggleDrawer(false)
    })

    return () => {
      network.destroy()
    }
  }, [graphOptions, loading])

  // Move to center when filter changes
  useEffect(() => {
    if (filterNodeId && networkRef.current) {
      networkRef.current.moveTo({ position: { x: 0, y: 0 } })
    }
  }, [filterNodeId])

  // Fetch data on mount
  useEffect(() => {
    fetchGraph()

    return () => {
      cleanup()
    }
  }, [])

  // Show loading state
  if (loading) {
    return (
      <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-gray-50/50 dark:bg-neutral-900/50">
        <div className="flex items-center space-x-2">
          <svg className="h-6 w-6 animate-spin text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-gray-500">Loading module graph...</span>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-gray-50/50 dark:bg-neutral-900/50">
        <div className="flex flex-col items-center gap-4">
          <svg className="h-12 w-12 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Failed to load module graph</p>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
          </div>
          <button
            onClick={fetchGraph}
            className="mt-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-gray-50/50 dark:bg-neutral-900/50">
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

        {/* Stabilizing modal */}
        {showStabilizing && (
          <div className="absolute inset-0 flex select-none items-center justify-center bg-white/80 text-base dark:bg-neutral-900/80">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 animate-spin text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Stabilizing...</span>
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

