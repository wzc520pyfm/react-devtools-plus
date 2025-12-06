import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// CSS animation keyframes
const styleSheet = `
@keyframes treeNodeSlideIn {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes countPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}

.tree-node-enter {
  animation: treeNodeSlideIn 0.2s ease-out;
}

.count-pulse {
  animation: countPulse 0.3s ease-out;
}
`

// Inject styles once
if (typeof document !== 'undefined') {
  const styleId = 'component-tree-panel-styles'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = styleSheet
    document.head.appendChild(style)
  }
}

interface ComponentTreeNode {
  id: string
  name: string
  type: string
  renderCount: number
  lastRenderTime: number
  averageTime?: number
  unnecessary?: number
  children: ComponentTreeNode[]
}

interface ComponentTreePanelProps {
  tree: ComponentTreeNode[]
  onSelectComponent?: (node: ComponentTreeNode) => void
  selectedComponentId?: string
  selectedComponentName?: string
  onClear?: () => void
}

/**
 * Render count badge with color based on count
 */
function RenderCountBadge({ count, isAnimating }: { count: number, isAnimating: boolean }) {
  if (count === 0)
    return null

  // Color based on render count
  const getBadgeColor = () => {
    if (count >= 100)
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    if (count >= 50)
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    if (count >= 20)
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    if (count >= 5)
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  }

  return (
    <span
      className={` ml-2 border rounded px-1.5 py-0.5 text-xs font-mono ${getBadgeColor()}  ${isAnimating ? 'count-pulse' : ''} transition-colors duration-200 `}
    >
      ×
      {count}
    </span>
  )
}

/**
 * Single tree node component
 */
function TreeNode({
  node,
  depth = 0,
  onSelect,
  selectedId,
  selectedName,
  searchTerm,
  expandedNodes,
  onToggleExpand,
  animatingCounts,
  selectedNodeRef,
}: {
  node: ComponentTreeNode
  depth?: number
  onSelect?: (node: ComponentTreeNode) => void
  selectedId?: string
  selectedName?: string
  searchTerm: string
  expandedNodes: Set<string>
  onToggleExpand: (id: string) => void
  animatingCounts: Set<string>
  selectedNodeRef?: React.RefObject<HTMLDivElement>
}) {
  const hasChildren = node.children.length > 0
  const isExpanded = expandedNodes.has(node.id)
  // Use ID for matching when available, fall back to name
  const isSelected = selectedId ? selectedId === node.id : selectedName === node.name
  const matchesSearch = searchTerm && node.name.toLowerCase().includes(searchTerm.toLowerCase())
  const isAnimating = animatingCounts.has(node.id)

  // Highlight matching part of name
  const renderName = () => {
    if (!searchTerm) {
      return <span className="text-purple-400 font-medium">{node.name}</span>
    }

    const lowerName = node.name.toLowerCase()
    const lowerSearch = searchTerm.toLowerCase()
    const index = lowerName.indexOf(lowerSearch)

    if (index === -1) {
      return <span className="text-purple-400 font-medium">{node.name}</span>
    }

    return (
      <>
        <span className="text-purple-400 font-medium">{node.name.slice(0, index)}</span>
        <span className="rounded bg-yellow-500/20 px-0.5 text-yellow-300 font-bold">
          {node.name.slice(index, index + searchTerm.length)}
        </span>
        <span className="text-purple-400 font-medium">{node.name.slice(index + searchTerm.length)}</span>
      </>
    )
  }

  return (
    <div className="tree-node-enter" ref={isSelected ? selectedNodeRef : undefined}>
      {/* Node row */}
      <div
        className={` flex cursor-pointer items-center rounded px-2 py-1 transition-colors duration-150 ${isSelected ? 'bg-purple-500/20 border-l-2 border-purple-500' : 'hover:bg-gray-100 dark:hover:bg-white/5'}  ${matchesSearch ? 'bg-yellow-500/10' : ''}  `}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect?.(node)}
      >
        {/* Expand/collapse arrow */}
        {hasChildren
          ? (
              <button
                className="mr-1 h-4 w-4 flex items-center justify-center text-gray-500 transition-colors hover:text-gray-300"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleExpand(node.id)
                }}
              >
                <svg
                  className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )
          : (
              <span className="mr-1 h-4 w-4" />
            )}

        {/* Component name */}
        <span className="flex-1 truncate text-sm font-mono">
          {renderName()}
        </span>

        {/* Render count badge */}
        <RenderCountBadge count={node.renderCount} isAnimating={isAnimating} />
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="overflow-hidden">
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedId={selectedId}
              selectedName={selectedName}
              searchTerm={searchTerm}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
              animatingCounts={animatingCounts}
              selectedNodeRef={selectedNodeRef}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Component Tree Panel - displays the React component hierarchy with render counts
 */
export function ComponentTreePanel({
  tree,
  onSelectComponent,
  selectedComponentId,
  selectedComponentName,
  onClear,
}: ComponentTreePanelProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [animatingCounts, setAnimatingCounts] = useState<Set<string>>(new Set())
  const prevTreeRef = useRef<ComponentTreeNode[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const treeContainerRef = useRef<HTMLDivElement>(null)
  const selectedNodeRef = useRef<HTMLDivElement>(null)

  // Calculate total component count and total renders
  const stats = useMemo(() => {
    let totalComponents = 0
    let totalRenders = 0

    const countNodes = (nodes: ComponentTreeNode[]) => {
      for (const node of nodes) {
        totalComponents++
        totalRenders += node.renderCount
        if (node.children.length > 0) {
          countNodes(node.children)
        }
      }
    }

    countNodes(tree)
    return { totalComponents, totalRenders }
  }, [tree])

  // Find nodes that need animation (render count changed)
  useEffect(() => {
    const findChangedNodes = (
      newNodes: ComponentTreeNode[],
      oldNodes: ComponentTreeNode[],
      changed: Set<string>,
    ) => {
      const oldMap = new Map(oldNodes.map(n => [n.id, n]))

      for (const newNode of newNodes) {
        const oldNode = oldMap.get(newNode.id)
        if (oldNode && newNode.renderCount > oldNode.renderCount) {
          changed.add(newNode.id)
        }
        if (newNode.children.length > 0 && oldNode?.children) {
          findChangedNodes(newNode.children, oldNode.children, changed)
        }
      }
    }

    const changed = new Set<string>()
    findChangedNodes(tree, prevTreeRef.current, changed)

    if (changed.size > 0) {
      setAnimatingCounts(changed)
      setTimeout(() => setAnimatingCounts(new Set()), 300)
    }

    prevTreeRef.current = tree
  }, [tree])

  // Auto-expand first level on mount
  useEffect(() => {
    if (tree.length > 0 && expandedNodes.size === 0) {
      const firstLevelIds = new Set(tree.map(node => node.id))
      setExpandedNodes(firstLevelIds)
    }
  }, [tree, expandedNodes.size])

  // Track the last selected component to avoid repeated scrolling
  const lastScrolledToRef = useRef<string | null>(null)

  // Find path to a component by ID or name and return all ancestor IDs
  const findPathToComponent = useCallback((nodes: ComponentTreeNode[], targetId: string | undefined, targetName: string | undefined, path: string[] = []): string[] | null => {
    for (const node of nodes) {
      // Match by ID if provided, otherwise by name
      const isMatch = targetId ? node.id === targetId : node.name === targetName
      if (isMatch) {
        return path
      }
      if (node.children.length > 0) {
        const result = findPathToComponent(node.children, targetId, targetName, [...path, node.id])
        if (result) {
          return result
        }
      }
    }
    return null
  }, [])

  // Auto-expand and scroll to selected component (only when selection changes)
  useEffect(() => {
    // Only scroll if the selected component changed
    const selectionKey = selectedComponentId || selectedComponentName
    if (selectionKey && selectionKey !== lastScrolledToRef.current && tree.length > 0) {
      const path = findPathToComponent(tree, selectedComponentId, selectedComponentName)
      if (path) {
        // Expand all ancestors
        setExpandedNodes((prev) => {
          const next = new Set(prev)
          path.forEach(id => next.add(id))
          return next
        })

        // Mark as scrolled to
        lastScrolledToRef.current = selectionKey

        // Scroll to the selected node after a short delay to allow expansion
        setTimeout(() => {
          if (selectedNodeRef.current && treeContainerRef.current) {
            const container = treeContainerRef.current
            const node = selectedNodeRef.current
            const containerRect = container.getBoundingClientRect()
            const nodeRect = node.getBoundingClientRect()

            // Calculate position relative to container
            const nodeOffsetTop = nodeRect.top - containerRect.top + container.scrollTop
            const targetScrollTop = nodeOffsetTop - (containerRect.height / 2) + (nodeRect.height / 2)

            container.scrollTo({
              top: Math.max(0, targetScrollTop),
              behavior: 'smooth',
            })
          }
        }, 100)
      }
    }
    else if (!selectedComponentId && !selectedComponentName) {
      // Reset when no component is selected
      lastScrolledToRef.current = null
    }
  }, [selectedComponentId, selectedComponentName, tree, findPathToComponent])

  // Toggle node expansion
  const handleToggleExpand = useCallback((id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      }
      else {
        next.add(id)
      }
      return next
    })
  }, [])

  // Expand all nodes
  const expandAll = useCallback(() => {
    const allIds = new Set<string>()
    const collectIds = (nodes: ComponentTreeNode[]) => {
      for (const node of nodes) {
        if (node.children.length > 0) {
          allIds.add(node.id)
          collectIds(node.children)
        }
      }
    }
    collectIds(tree)
    setExpandedNodes(allIds)
  }, [tree])

  // Collapse all nodes
  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set())
  }, [])

  // Filter tree based on search term
  const filteredTree = useMemo(() => {
    if (!searchTerm)
      return tree

    const filterNodes = (nodes: ComponentTreeNode[]): ComponentTreeNode[] => {
      return nodes.reduce<ComponentTreeNode[]>((acc, node) => {
        const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase())
        const filteredChildren = filterNodes(node.children)

        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...node,
            children: filteredChildren,
          })
        }

        return acc
      }, [])
    }

    return filterNodes(tree)
  }, [tree, searchTerm])

  // Auto-expand when searching
  useEffect(() => {
    if (searchTerm) {
      expandAll()
    }
  }, [searchTerm, expandAll])

  if (tree.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-sm text-gray-500">
        <svg className="mb-3 h-12 w-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p>No components detected</p>
        <p className="mt-1 text-xs opacity-70">Enable scan to see the component tree</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with search and stats */}
      <div className="flex-shrink-0 border-b border-gray-100 p-3 dark:border-white/10">
        {/* Search input */}
        <div className="relative mb-3">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Component name, /regex..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full border border-gray-200 rounded bg-gray-50 px-3 py-1.5 pl-8 text-sm text-gray-900 transition-colors dark:border-white/10 focus:border-purple-500/50 dark:bg-black/30 dark:text-white focus:outline-none placeholder-gray-400 dark:placeholder-gray-500"
          />
          <svg
            className="absolute left-2.5 top-1/2 h-4 w-4 text-gray-500 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 text-gray-500 -translate-y-1/2 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Stats and controls */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400">
            <span className="text-gray-900 font-medium dark:text-white">{stats.totalComponents}</span>
            {' '}
            components
          </span>

          <div className="flex items-center gap-2">
            {/* Expand/Collapse buttons */}
            <button
              onClick={expandAll}
              className="rounded px-2 py-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
              title="Expand all"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={collapseAll}
              className="rounded px-2 py-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
              title="Collapse all"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>

            {/* Clear button */}
            {onClear && (
              <button
                onClick={onClear}
                className="rounded px-2 py-0.5 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                title="Clear render counts"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tree content */}
      <div ref={treeContainerRef} className="flex-1 overflow-y-auto p-2">
        {filteredTree.length === 0
          ? (
              <div className="py-4 text-center text-sm text-gray-500">
                No components match &ldquo;
                {searchTerm}
                &rdquo;
              </div>
            )
          : (
              filteredTree.map(node => (
                <TreeNode
                  key={node.id}
                  node={node}
                  onSelect={onSelectComponent}
                  selectedId={selectedComponentId}
                  selectedName={selectedComponentName}
                  searchTerm={searchTerm}
                  expandedNodes={expandedNodes}
                  onToggleExpand={handleToggleExpand}
                  animatingCounts={animatingCounts}
                  selectedNodeRef={selectedNodeRef}
                />
              ))
            )}
      </div>
    </div>
  )
}

export default ComponentTreePanel
