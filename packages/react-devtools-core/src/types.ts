/**
 * Core types for React DevTools
 * React DevTools 核心类型定义
 */

/**
 * Component tree node information
 * 组件树节点信息
 */
export interface ComponentNode {
  id: string
  name: string
  type: 'function' | 'class' | 'memo' | 'forward-ref' | 'context' | 'provider' | 'consumer'
  props: Record<string, any>
  state?: Record<string, any>
  hooks?: HookInfo[]
  children: string[]
  parent?: string
  source?: SourceLocation
}

/**
 * Hook information
 * Hook 信息
 */
export interface HookInfo {
  index: number
  name: string
  value: any
  subHooks?: HookInfo[]
}

/**
 * Source code location
 * 源码位置
 */
export interface SourceLocation {
  fileName: string
  lineNumber: number
  columnNumber: number
}

/**
 * Performance metrics
 * 性能指标
 */
export interface PerformanceMetrics {
  componentId: string
  renderTime: number
  updateCount: number
  timestamp: number
}

/**
 * DevTools state
 * DevTools 状态
 */
export interface DevToolsState {
  connected: boolean
  selectedComponent?: string
  expandedComponents: Set<string>
  highlightedComponent?: string
}

/**
 * Event types
 * 事件类型
 */
export type DevToolsEvent
  = | { type: 'component-selected', componentId: string }
    | { type: 'component-updated', componentId: string }
    | { type: 'component-mounted', componentId: string }
    | { type: 'component-unmounted', componentId: string }
    | { type: 'connection-changed', connected: boolean }
    | { type: 'highlight-changed', componentId?: string }

/**
 * RPC function definitions
 * RPC 函数定义
 */
export interface ClientFunctions {
  // Component tree operations
  getComponentTree: () => Promise<ComponentNode[]>
  getComponentDetails: (componentId: string) => Promise<ComponentNode | null>
  updateComponentProps: (componentId: string, props: Record<string, any>) => Promise<void>
  updateComponentState: (componentId: string, state: Record<string, any>) => Promise<void>

  // Source code operations
  openInEditor: (source: SourceLocation) => Promise<void>

  // Performance operations
  startProfiling: () => Promise<void>
  stopProfiling: () => Promise<PerformanceMetrics[]>

  // DevTools state
  selectComponent: (componentId: string) => Promise<void>
  highlightComponent: (componentId?: string) => Promise<void>
}

export interface ServerFunctions {
  // Notifications from client to server
  onComponentTreeChanged: () => void
  onComponentSelected: (componentId: string) => void
  onPerformanceData: (metrics: PerformanceMetrics) => void
}

/**
 * Plugin types
 * 插件类型
 */
export interface DevToolsPlugin {
  /**
   * Plugin unique identifier
   * 插件唯一标识符
   */
  id: string

  /**
   * Plugin name
   * 插件名称
   */
  name: string

  /**
   * Plugin description
   * 插件描述
   */
  description?: string

  /**
   * Plugin initialization
   * 插件初始化
   */
  setup?: (context: PluginContext) => void | Promise<void>

  /**
   * Plugin cleanup
   * 插件清理
   */
  teardown?: () => void | Promise<void>

  /**
   * Custom RPC functions
   * 自定义 RPC 函数
   */
  rpc?: Record<string, (...args: any[]) => any>

  /**
   * Event handlers
   * 事件处理器
   */
  on?: Partial<Record<DevToolsEvent['type'], (event: DevToolsEvent) => void>>
}

/**
 * Plugin context
 * 插件上下文
 */
export interface PluginContext {
  /**
   * Get component tree
   * 获取组件树
   */
  getComponentTree: () => Promise<ComponentNode[]>

  /**
   * Get component details
   * 获取组件详情
   */
  getComponentDetails: (componentId: string) => Promise<ComponentNode | null>

  /**
   * Emit event
   * 发送事件
   */
  emit: (event: DevToolsEvent) => void

  /**
   * Subscribe to events
   * 订阅事件
   */
  on: <T extends DevToolsEvent['type']>(
    type: T,
    handler: (event: Extract<DevToolsEvent, { type: T }>) => void,
  ) => () => void

  /**
   * Register custom RPC function
   * 注册自定义 RPC 函数
   */
  registerRPC: <T extends (...args: any[]) => any>(name: string, fn: T) => void

  /**
   * Call RPC function
   * 调用 RPC 函数
   */
  callRPC: <T = any>(name: string, ...args: any[]) => Promise<T>
}
