/**
 * Graph composable hook for managing module dependency graph state
 * 模块依赖图状态管理 Hook
 */

import type { Edge, Network, Node } from 'vis-network'
import type {
  DrawerData,
  FileTypeItem,
  GraphNodesTotalData,
  GraphSettings,
  ModuleInfo,
  SearcherNode,
} from '~/types/graph'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DataSet } from 'vis-network/standalone'
import { fileTypes, getGraphOptions } from '~/types/graph'

// Capital case keys for display
const capitalizeKeys = ['tsx', 'jsx', 'other']

/**
 * File type data for legend display
 * 文件类型数据用于图例展示
 */
export function useFileTypes() {
  const [fileTypeShow, setFileTypeShow] = useState(true)

  const fileTypeData: FileTypeItem[] = useMemo(() =>
    Object.entries(fileTypes).map(([key, value]) => ({
      key,
      color: value.color,
      capitalize: capitalizeKeys.includes(key),
    })), [])

  const toggleFileType = useCallback(() => {
    setFileTypeShow(prev => !prev)
  }, [])

  return {
    fileTypeData,
    fileTypeShow,
    toggleFileType,
  }
}

/**
 * Main graph state hook
 * 主图表状态 Hook
 */
export function useGraph() {
  // Theme state
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  )

  // Graph data state
  const [projectRoot, setProjectRoot] = useState('')
  const graphNodesRef = useRef(new DataSet<Node>([]))
  const graphEdgesRef = useRef(new DataSet<Edge>([]))
  const graphNodesTotalRef = useRef<GraphNodesTotalData[]>([])
  const graphNodesTotalMapRef = useRef(new Map<string, GraphNodesTotalData>())
  const modulesMapRef = useRef(new Map<string, GraphNodesTotalData>())
  const moduleReferencesRef = useRef(new Map<string, Array<{ path: string, displayPath: string, mod: ModuleInfo }>>())

  // Settings state
  const [graphSettings, setGraphSettings] = useState<GraphSettings>({
    node_modules: false,
    virtual: false,
    lib: false,
  })

  // Search state
  const [searchText, setSearchText] = useState('')

  // Filter state
  const [filterNodeId, setFilterNodeId] = useState('')

  // Drawer state
  const [drawerData, setDrawerData] = useState<DrawerData | undefined>()
  const [drawerShow, setDrawerShow] = useState(false)

  // Stabilizing state
  const [showStabilizing, setShowStabilizing] = useState(false)

  // Network ref
  const networkRef = useRef<Network | null>(null)

  // Graph options
  const graphOptions = useMemo(() => getGraphOptions(isDark), [isDark])

  // Listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  // Utility functions
  const uniqueNodes = useCallback((nodes: Node[]): Node[] => {
    return nodes.reduce<Node[]>((prev, node) => {
      if (!prev.some(n => n.id === node.id)) {
        prev.push(node)
      }
      return prev
    }, [])
  }, [])

  const uniqueEdges = useCallback((edges: Edge[]): Edge[] => {
    return edges.reduce<Edge[]>((prev, edge) => {
      if (!prev.some(e => e.from === edge.from && e.to === edge.to)) {
        prev.push(edge)
      }
      return prev
    }, [])
  }, [])

  const removeVerbosePath = useCallback((path: string): string => {
    return path.replace(/\?.*$/, '').replace(/#.*$/, '').replace(/\/{2,}/g, '/')
  }, [])

  const removeRootPath = useCallback((path: string, root?: string): string => {
    return path.replace(root ?? projectRoot, '')
  }, [projectRoot])

  const determineNodeSize = useCallback((depsLen: number): number => {
    return 15 + Math.min(depsLen / 2, 8)
  }, [])

  const checkIsValidModule = useCallback((module: ModuleInfo, root?: string): boolean => {
    const effectiveRoot = root ?? projectRoot
    const isNodeModule = module.id.includes('node_modules')
    if (!graphSettings.node_modules && isNodeModule)
      return false
    if (!graphSettings.virtual && module.virtual && !isNodeModule)
      return false
    if (!graphSettings.lib && !module.id.includes(effectiveRoot) && !module.virtual)
      return false
    return true
  }, [graphSettings, projectRoot])

  const checkReferenceIsValid = useCallback((modId: string, root?: string): boolean => {
    const refer = moduleReferencesRef.current.get(modId)
    if (!refer || refer.length === 0) {
      return true
    }
    // When checking references, we should be more lenient:
    // - If a module is referenced by a virtual module (like Next.js loaders), that's still valid
    // - We only filter out if ALL references are from filtered modules (node_modules/lib)
    const effectiveRoot = root ?? projectRoot
    return refer.some((ref) => {
      const isNodeModule = ref.mod.id.includes('node_modules')
      // Virtual modules referencing user code is valid
      if (ref.mod.virtual) {
        return true
      }
      // Node modules references
      if (!graphSettings.node_modules && isNodeModule) {
        return false
      }
      // Lib modules (outside project root)
      if (!graphSettings.lib && !ref.mod.id.includes(effectiveRoot) && !ref.mod.virtual) {
        return false
      }
      return true
    })
  }, [graphSettings, projectRoot])

  const getEdge = useCallback((modId: string, dep: string): Edge => {
    return {
      from: modId,
      to: dep,
      arrows: {
        to: {
          enabled: true,
          scaleFactor: 0.8,
        },
      },
    }
  }, [])

  // Close drawer
  const closeDrawer = useCallback(() => {
    setDrawerShow(false)
  }, [])

  // Toggle drawer
  const toggleDrawer = useCallback((show: boolean) => {
    setDrawerShow(show)
  }, [])

  // Recursively get node by dependencies
  const recursivelyGetNodeByDep = useCallback((nodes: SearcherNode[]) => {
    const allNodes = new Map<string, Node>()
    const allEdges = new Map<string, Edge>()

    nodes.forEach((n) => {
      const nodeCopy = { ...n }
      // Highlight current searched node
      nodeCopy.node = {
        ...nodeCopy.node,
        font: { color: '#F19B4A' },
        label: `<b>${nodeCopy.node.label}</b>`,
      }
      allNodes.set(nodeCopy.fullId, nodeCopy.node)

      nodeCopy.deps.forEach((dep) => {
        const node = modulesMapRef.current.get(dep)
        if (node && checkIsValidModule(node.mod)) {
          allNodes.set(node.mod.id, node.node)
          allEdges.set(`${nodeCopy.fullId}-${node.mod.id}`, getEdge(node.mod.id, nodeCopy.fullId))
          node.edges.forEach(edge => allEdges.set(`${edge.from}-${edge.to}`, edge))
        }
      })
    })

    return {
      nodes: Array.from(allNodes.values()),
      edges: Array.from(allEdges.values()),
    }
  }, [checkIsValidModule, getEdge])

  // Get graph filter dataset
  const getGraphFilterDataset = useCallback((): GraphNodesTotalData[] | null => {
    const nodeId = filterNodeId
    if (!nodeId)
      return null

    const node = modulesMapRef.current.get(nodeId)
    if (!node)
      return null

    const existingNodeIds = new Set<string>()

    function recursivelyGetGraphNodeData(
      nodeId: string,
      existingNodeIds: Set<string>,
      depth: number,
    ): GraphNodesTotalData[] {
      if (existingNodeIds.has(nodeId))
        return []

      const node = modulesMapRef.current.get(nodeId)
      const newDepth = depth + 1
      if (!node || newDepth > 20)
        return []

      const result = [node]
      existingNodeIds.add(nodeId)

      node.mod.deps.forEach((dep) => {
        const depNode = modulesMapRef.current.get(dep)
        if (depNode) {
          result.push(...recursivelyGetGraphNodeData(depNode.mod.id, existingNodeIds, newDepth))
        }
      })

      // Unique result
      return result.reduce<GraphNodesTotalData[]>((prev, n) => {
        if (!prev.some(existing => existing.mod.id === n.mod.id)) {
          prev.push(n)
        }
        return prev
      }, [])
    }

    return recursivelyGetGraphNodeData(nodeId, existingNodeIds, 0)
  }, [filterNodeId])

  // Update graph
  const updateGraph = useCallback(() => {
    graphNodesRef.current.clear()
    graphEdgesRef.current.clear()
    closeDrawer()

    const matchedNodes: Node[] = []
    const matchedSearchNodes: SearcherNode[] = []
    const matchedEdges: Edge[] = []

    const EXTRACT_LAST_THREE_MOD_ID_RE = /(?:[^/]*\/){3}([^/]+$)/
    const filterDataset = getGraphFilterDataset()
    const nodeData = filterDataset ? filterDataset.slice() : graphNodesTotalRef.current.slice()

    nodeData.forEach(({ node, edges, mod }) => {
      if (checkIsValidModule(mod) && checkReferenceIsValid(mod.id)) {
        matchedNodes.push(node)
        matchedSearchNodes.push({
          id: mod.id.match(EXTRACT_LAST_THREE_MOD_ID_RE)?.[0] ?? mod.id,
          fullId: mod.id,
          node,
          edges,
          deps: mod.deps,
        })
        matchedEdges.push(...edges)
      }
    })

    // Apply search filter
    if (searchText.trim().length) {
      const result = matchedSearchNodes.filter(({ id }) =>
        id.toLowerCase().includes(searchText.toLowerCase()),
      )
      matchedEdges.length = 0
      matchedNodes.length = 0
      if (result.length) {
        const { nodes, edges } = recursivelyGetNodeByDep(result)
        matchedNodes.push(...nodes)
        matchedEdges.push(...edges)
      }
    }

    graphNodesRef.current.add(uniqueNodes(matchedNodes))
    graphEdgesRef.current.add(uniqueEdges(matchedEdges))
  }, [
    closeDrawer,
    checkIsValidModule,
    checkReferenceIsValid,
    getGraphFilterDataset,
    searchText,
    recursivelyGetNodeByDep,
    uniqueNodes,
    uniqueEdges,
  ])

  // Parse graph raw data
  const parseGraphRawData = useCallback((modules: ModuleInfo[], root: string) => {
    if (!modules)
      return

    setProjectRoot(root)
    graphNodesRef.current.clear()
    graphEdgesRef.current.clear()
    graphNodesTotalRef.current = []
    graphNodesTotalMapRef.current.clear()
    modulesMapRef.current.clear()
    moduleReferencesRef.current.clear()

    const totalEdges: Edge[] = []
    const totalNodes: Node[] = []

    const isStyleFile = (path: string): boolean => {
      return path.includes('vue&type=style') || path.includes('?type=style')
    }

    const getUniqueDeps = (
      deps: string[],
      processEachDep?: (dep: string) => void,
    ): string[] => {
      const uniqueDeps: string[] = []
      deps.forEach((dep) => {
        if (isStyleFile(dep))
          return
        const cleanDep = removeVerbosePath(dep)
        if (uniqueDeps.includes(cleanDep))
          return
        uniqueDeps.push(cleanDep)
        processEachDep?.(cleanDep)
      })
      return uniqueDeps
    }

    modules.forEach((mod) => {
      if (isStyleFile(mod.id))
        return

      const cleanId = removeVerbosePath(mod.id)
      mod.id = cleanId

      // Skip duplicate module, merge their deps
      if (totalNodes.some(node => node.id === mod.id)) {
        const nodeData = modulesMapRef.current.get(mod.id)!
        nodeData.node.size = determineNodeSize(nodeData.edges.length + mod.deps.length)
        const edges: Edge[] = []
        const uniqueDeps = getUniqueDeps(mod.deps, (dep) => {
          edges.push(getEdge(mod.id, dep))
        })
        const incrementalDeps = uniqueDeps.filter(dep => !nodeData.mod.deps.includes(dep))
        if (!incrementalDeps.length)
          return
        nodeData.mod.deps.push(...incrementalDeps)
        totalEdges.push(...edges)
        return
      }

      const path = mod.id
      const pathSegments = path.split('/')
      const displayName = pathSegments.at(-1) ?? ''
      const displayPath = removeRootPath(path, root)
      const fileExt = path.match(/\.(\w+)$/)?.[1] || 'other'

      const node: GraphNodesTotalData = {
        mod,
        info: {
          displayName,
          displayPath,
        },
        node: {
          id: mod.id,
          label: displayName,
          group: fileExt,
          size: determineNodeSize(mod.deps.length),
          shape: mod.id.includes('/node_modules/')
            ? 'hexagon'
            : mod.virtual
              ? 'diamond'
              : 'dot',
        },
        edges: [],
      }

      const uniqueDeps = getUniqueDeps(mod.deps, (dep) => {
        node.edges.push(getEdge(mod.id, dep))
        // Save references
        if (!moduleReferencesRef.current.has(dep)) {
          moduleReferencesRef.current.set(dep, [])
        }
        const moduleReferencesValue = moduleReferencesRef.current.get(dep)!
        const refDisplayPath = removeRootPath(path, root)
        const isExist = moduleReferencesValue.find(
          item => item.path === path && item.displayPath === refDisplayPath && item.mod.id === mod.id,
        )
        if (isExist)
          return
        moduleReferencesValue.push({
          path,
          displayPath: refDisplayPath,
          mod,
        })
      })
      mod.deps = uniqueDeps
      graphNodesTotalRef.current.push(node)
      graphNodesTotalMapRef.current.set(mod.id, node)

      // Save cache
      modulesMapRef.current.set(mod.id, node)

      // First time check - pass root directly since setProjectRoot is async
      if (checkIsValidModule(mod, root) && checkReferenceIsValid(mod.id, root)) {
        totalNodes.push(node.node)
        totalEdges.push(...node.edges)
      }
    })

    // Set initial data
    graphNodesRef.current.add(totalNodes.slice())
    graphEdgesRef.current.add(uniqueEdges(totalEdges))
  }, [
    removeVerbosePath,
    removeRootPath,
    determineNodeSize,
    getEdge,
    checkIsValidModule,
    checkReferenceIsValid,
    uniqueEdges,
  ])

  // Update drawer data
  const updateDrawerData = useCallback((nodeId: string): DrawerData | undefined => {
    const node = modulesMapRef.current.get(nodeId)
    if (!node)
      return

    const deps = node.mod.deps.reduce<DrawerData['deps']>((prev, dep) => {
      const moduleData = modulesMapRef.current.get(dep)
      if (!moduleData)
        return prev
      if (checkIsValidModule(moduleData.mod)) {
        prev.push({
          path: dep,
          displayPath: removeRootPath(removeVerbosePath(dep)),
        })
      }
      return prev
    }, [])

    const refsData = moduleReferencesRef.current.get(node.mod.id) || []
    const refs = refsData.reduce<DrawerData['deps']>((prev, ref) => {
      const moduleData = modulesMapRef.current.get(ref.path)
      if (!moduleData)
        return prev
      if (checkIsValidModule(moduleData.mod)) {
        prev.push({
          path: ref.path,
          displayPath: ref.displayPath,
        })
      }
      return prev
    }, [])

    const data: DrawerData = {
      name: node.info.displayName,
      displayPath: node.info.displayPath,
      path: node.mod.id,
      deps,
      refs,
    }

    setDrawerData(data)
    return data
  }, [checkIsValidModule, removeRootPath, removeVerbosePath])

  // Cleanup
  const cleanup = useCallback(() => {
    graphNodesTotalRef.current = []
    graphNodesTotalMapRef.current.clear()
    graphNodesRef.current.clear()
    graphEdgesRef.current.clear()
    modulesMapRef.current.clear()
    moduleReferencesRef.current.clear()
  }, [])

  // Update graph when settings or search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateGraph()
    }, 350)
    return () => clearTimeout(timer)
  }, [searchText])

  useEffect(() => {
    updateGraph()
  }, [graphSettings, filterNodeId])

  return {
    // State
    projectRoot,
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

    // Refs
    graphNodesRef,
    graphEdgesRef,
    networkRef,

    // Options
    graphOptions,
    isDark,

    // Actions
    parseGraphRawData,
    updateGraph,
    updateDrawerData,
    toggleDrawer,
    closeDrawer,
    cleanup,
  }
}
