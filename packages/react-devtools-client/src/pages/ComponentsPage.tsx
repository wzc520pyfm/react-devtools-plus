import type { ComponentDetails, ComponentTreeNode } from '@react-devtools/kit'
import { getRpcClient, REACT_TAGS } from '@react-devtools/kit'
import { Checkbox } from '@react-devtools/ui'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ComponentDetailsPanel } from '~/components/ComponentDetailsPanel'
import { useComponentTreeHook } from '~/composables/useComponentTreeHook'

interface ComponentsPageProps {
  tree: ComponentTreeNode | null
  selectedNodeId?: string | null
  onSelectNode?: (id: string) => void
}

interface TreeNodeProps {
  node: ComponentTreeNode
  showHostComponents: boolean
  selectedNodeId?: string | null
  onSelectNode?: (id: string) => void
  forceExpand?: boolean
  depth?: number
}

interface ServerRpcFunctions {
  getComponentDetails: (fiberId: string) => Promise<ComponentDetails | null>
}

function getBadge(node: ComponentTreeNode) {
  const tag = node.meta?.tag

  if (tag === undefined)
    return null

  if (tag === REACT_TAGS.Fragment) {
    return <span className="ml-2 rounded bg-gray-200 px-1 py-0.5 text-[10px] text-gray-600 dark:bg-gray-700 dark:text-gray-300">fragment</span>
  }
  if (tag === REACT_TAGS.ContextProvider) {
    return <span className="ml-2 rounded bg-purple-100 px-1 py-0.5 text-[10px] text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">provider</span>
  }
  if (tag === REACT_TAGS.ContextConsumer) {
    return <span className="ml-2 rounded bg-purple-100 px-1 py-0.5 text-[10px] text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">consumer</span>
  }
  if (tag === REACT_TAGS.MemoComponent || tag === REACT_TAGS.SimpleMemoComponent) {
    return <span className="ml-2 rounded bg-orange-100 px-1 py-0.5 text-[10px] text-orange-600 dark:bg-orange-900/30 dark:text-orange-300">memo</span>
  }
  if (tag === REACT_TAGS.ForwardRef) {
    return <span className="ml-2 rounded bg-yellow-100 px-1 py-0.5 text-[10px] text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300">forwardRef</span>
  }
  if (tag === REACT_TAGS.SuspenseComponent) {
    return <span className="ml-2 rounded bg-pink-100 px-1 py-0.5 text-[10px] text-pink-600 dark:bg-pink-900/30 dark:text-pink-300">suspense</span>
  }

  return null
}

function TreeNode({ node, showHostComponents, selectedNodeId, onSelectNode, forceExpand, depth = 0 }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (forceExpand) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setExpanded(true)
    }
  }, [forceExpand])

  const isSelected = selectedNodeId === node.id

  useEffect(() => {
    if (isSelected && elementRef.current) {
      elementRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [isSelected])

  const handleMouseEnter = () => {
    const rpc = getRpcClient() as any
    if (rpc?.highlightNode) {
      rpc.highlightNode(node.id)
    }
  }

  const handleMouseLeave = () => {
    const rpc = getRpcClient() as any
    if (rpc?.hideHighlight) {
      rpc.hideHighlight()
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelectNode?.(node.id)
  }

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setExpanded(!expanded)
  }

  return (
    <li>
      <div
        ref={elementRef}
        className={`min-w-full w-fit flex cursor-pointer select-none items-center py-1 pr-2 transition-colors ${isSelected ? 'bg-primary-500 text-white' : 'hover:bg-[color-mix(in_srgb,var(--color-primary-500),transparent_90%)] text-gray-700 dark:text-gray-300'}`}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <span
          onClick={toggleExpand}
          className="mr-1 h-4 w-4 flex items-center justify-center text-xs opacity-60 hover:opacity-100"
        >
          {node.children.length > 0
            ? (expanded
                ? <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" /></svg>
                : <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>)
            : null}
        </span>
        <span className="whitespace-nowrap text-sm font-mono">
          <span className={isSelected ? 'text-white' : 'text-primary-600 dark:text-primary-400'}>{'<'}</span>
          {node.name}
          <span className={isSelected ? 'text-white' : 'text-primary-600 dark:text-primary-400'}>{'>'}</span>
        </span>
        {getBadge(node)}
      </div>
      {expanded && node.children.length > 0 && (
        <ul className="m-0 list-none p-0">
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              showHostComponents={showHostComponents}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
              forceExpand={forceExpand}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function filterTree(node: ComponentTreeNode, search: string): ComponentTreeNode | null {
  if (!search)
    return node

  const nameMatch = node.name.toLowerCase().includes(search.toLowerCase())
  const filteredChildren = node.children
    .map(child => filterTree(child, search))
    .filter((child): child is ComponentTreeNode => child !== null)

  if (nameMatch || filteredChildren.length > 0) {
    return {
      ...node,
      children: filteredChildren,
    }
  }

  return null
}

interface SplitPaneProps {
  tree: ComponentTreeNode | null
  showHostComponents: boolean
  selectedNodeId?: string | null
  onSelectNode: (id: string) => void
  search: string
  isLoadingDetails: boolean
  componentDetails: ComponentDetails | null
  onScrollToComponent?: () => void
}

function SplitPane({ tree, showHostComponents, selectedNodeId, onSelectNode, search, isLoadingDetails, componentDetails, onScrollToComponent }: SplitPaneProps) {
  const [panelWidth, setPanelWidth] = useState(320)
  const isDragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current)
        return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newWidth = containerRect.right - e.clientX

      // Clamp width between min and max
      const clampedWidth = Math.max(200, Math.min(newWidth, containerRect.width - 200))
      setPanelWidth(clampedWidth)
    }

    const handleMouseUp = () => {
      isDragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div ref={containerRef} className="flex flex-1 overflow-hidden">
      {/* Left: Component Tree */}
      <div className="min-w-0 flex-1 overflow-auto panel-grids">
        <ul className="m-0 list-none p-0">
          {tree && (
            <TreeNode
              node={tree}
              showHostComponents={showHostComponents}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
              forceExpand={!!search}
            />
          )}
        </ul>
      </div>

      {/* Resize Handle */}
      <div
        className="w-1 flex-shrink-0 cursor-col-resize bg-gray-200 transition-colors active:bg-primary-500 dark:bg-gray-700 hover:bg-primary-400 dark:hover:bg-primary-500"
        onMouseDown={handleMouseDown}
      />

      {/* Right: Component Details */}
      <div
        className="flex-shrink-0 overflow-hidden border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-[#121212]"
        style={{ width: panelWidth }}
      >
        {isLoadingDetails
          ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin">
                  <svg className="h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
            )
          : (
              <ComponentDetailsPanel
                details={componentDetails}
                onSelectNode={onSelectNode}
                onScrollToComponent={onScrollToComponent}
                onPropChange={() => {
                  // Re-fetch component details after prop change
                  if (selectedNodeId) {
                    const rpc = getRpcClient<ServerRpcFunctions>()
                    if (rpc?.getComponentDetails) {
                      rpc.getComponentDetails(selectedNodeId)
                        .then(setComponentDetails)
                        .catch(console.debug)
                    }
                  }
                }}
              />
            )}
      </div>
    </div>
  )
}

export function ComponentsPage({ tree, selectedNodeId, onSelectNode }: ComponentsPageProps) {
  const [showHostComponents, setShowHostComponents] = useState(false)
  const [search, setSearch] = useState('')
  const [inspectorMode, setInspectorMode] = useState<'select-component' | 'open-in-editor' | null>(null)
  const [componentDetails, setComponentDetails] = useState<ComponentDetails | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  // Ensure component tree hook is installed
  useComponentTreeHook(tree)

  const filteredTree = useMemo(() => {
    if (!tree)
      return null
    return filterTree(tree, search)
  }, [tree, search])

  useEffect(() => {
    if (!tree)
      return

    const rpc = getRpcClient() as any
    if (rpc?.rebuildTree) {
      rpc.rebuildTree(showHostComponents).catch(() => {})
    }
  }, [showHostComponents, tree])

  // Fetch component details when selection changes
  useEffect(() => {
    if (!selectedNodeId) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setComponentDetails(null)
      return
    }

    const fetchDetails = async () => {
      setIsLoadingDetails(true)
      try {
        const rpc = getRpcClient<ServerRpcFunctions>()
        if (rpc?.getComponentDetails) {
          const details = await rpc.getComponentDetails(selectedNodeId)
          setComponentDetails(details)
        }
      }
      catch (error) {
        console.debug('[Components Page] Failed to fetch component details:', error)
        setComponentDetails(null)
      }
      finally {
        setIsLoadingDetails(false)
      }
    }

    fetchDetails()
  }, [selectedNodeId])

  // When selection changes (e.g. from inspector), turn off inspector
  useEffect(() => {
    if (selectedNodeId) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setInspectorMode(null)
    }
  }, [selectedNodeId])

  const toggleInspector = (mode: 'select-component' | 'open-in-editor') => {
    const newMode = inspectorMode === mode ? null : mode
    setInspectorMode(newMode)

    const rpc = getRpcClient() as any
    if (newMode) {
      // If turning on, use toggleInspectorMode which sets mode and hides panel
      if (rpc?.toggleInspectorMode) {
        rpc.toggleInspectorMode(newMode)
      }
    }
    else {
      // If turning off, just disable it
      if (rpc?.toggleInspector) {
        rpc.toggleInspector(false)
      }
    }
  }

  const handleSelectNode = useCallback((id: string) => {
    onSelectNode?.(id)
  }, [onSelectNode])

  const handleScrollToComponent = useCallback(() => {
    if (!selectedNodeId)
      return
    const rpc = getRpcClient() as any
    if (rpc?.scrollToComponent) {
      rpc.scrollToComponent(selectedNodeId)
    }
  }, [selectedNodeId])

  if (!tree) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <div className="mb-4 animate-spin">
          <svg className="h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        Waiting for React renderer…
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-base">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-base bg-base p-2">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Find components..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded bg-gray-50 py-1.5 pl-8 pr-3 text-sm text-gray-900 transition-colors dark:border-gray-700 focus:border-primary-500 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <button
          type="button"
          onClick={() => toggleInspector('select-component')}
          title="Select component in the page"
          className={`mr-1 rounded p-1.5 transition-colors ${inspectorMode === 'select-component' ? 'bg-primary-500 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
            <path d="m12 12 4 10 1.7-4.3L22 16Z" />
          </svg>
        </button>
        <div className="mx-1 h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
        <Checkbox
          label="Host"
          checked={showHostComponents}
          onChange={setShowHostComponents}
        />
      </div>

      {/* Main Content - Split Layout */}
      <SplitPane
        tree={filteredTree}
        showHostComponents={showHostComponents}
        selectedNodeId={selectedNodeId}
        onSelectNode={handleSelectNode}
        search={search}
        isLoadingDetails={isLoadingDetails}
        componentDetails={componentDetails}
        onScrollToComponent={handleScrollToComponent}
      />
    </div>
  )
}
