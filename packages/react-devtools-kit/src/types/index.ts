export interface FiberNode {
  key: null | string
  elementType: any
  type: any
  stateNode: any
  child: FiberNode | null
  sibling: FiberNode | null
  return: FiberNode | null
  tag: number
  pendingProps: any
  memoizedProps: any
  memoizedState: any
  _debugSource?: {
    fileName: string
    lineNumber: number
    columnNumber: number
  }
  _debugHookTypes?: string[]
}

export interface FiberRoot {
  current: FiberNode
  containerInfo?: any
}

export interface ComponentTreeNode {
  id: string
  name: string
  children: ComponentTreeNode[]
  meta?: {
    tag: number
  }
}

/**
 * Serializable prop value for display
 */
export interface PropValue {
  type: 'string' | 'number' | 'boolean' | 'null' | 'undefined' | 'object' | 'array' | 'function' | 'symbol' | 'element' | 'unknown'
  value: string
  preview?: string
  /** For objects and arrays, contains the nested properties */
  children?: Record<string, PropValue>
}

/**
 * Hook information extracted from fiber
 */
export interface HookInfo {
  name: string
  value: PropValue
  subHooks?: HookInfo[]
}

/**
 * Parent component in the render chain
 */
export interface RenderedByInfo {
  id: string
  name: string
  tag?: number
}

/**
 * Source location information
 */
export interface SourceInfo {
  fileName: string
  lineNumber: number
  columnNumber: number
}

/**
 * Detailed component information for the inspector panel
 */
export interface ComponentDetails {
  id: string
  name: string
  tag?: number
  props: Record<string, PropValue>
  hooks: HookInfo[]
  renderedBy: RenderedByInfo[]
  source?: SourceInfo
  key?: string | null
}

export type TreeListener = (tree: ComponentTreeNode | null) => void

export interface ReactDevToolsHook {
  renderers: Map<number, any>
  supportsFiber: boolean
  inject: (renderer: any) => number
  onCommitFiberRoot: (rendererID: number, root: FiberRoot) => void
  onCommitFiberUnmount: (rendererID: number, fiber: FiberNode) => void
  getFiberRoots?: (rendererID: number) => Set<FiberRoot>
  sub?: (event: string, fn: (...args: any[]) => void) => () => void
}

export const REACT_TAGS = {
  FunctionComponent: 0,
  ClassComponent: 1,
  IndeterminateComponent: 2,
  HostRoot: 3,
  HostComponent: 5,
  HostText: 6,
  Fragment: 7,
  Mode: 8,
  ContextConsumer: 9,
  ContextProvider: 10,
  ForwardRef: 11,
  SuspenseComponent: 13,
  MemoComponent: 14,
  SimpleMemoComponent: 15,
} as const

// Re-export Timeline types
export type { TimelineEvent, TimelineLayer, TimelineLayersState } from '../core/timeline'

declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: ReactDevToolsHook
  }
}
