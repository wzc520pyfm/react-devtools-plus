/**
 * Plugin Hooks API
 * 插件 Hooks API
 *
 * This module provides React hooks for plugin view components to communicate
 * with host scripts running in the host application.
 *
 * 此模块提供 React Hooks，让插件视图组件与运行在宿主应用中的宿主脚本通信。
 */

import type { PluginRpcClient } from './types'

// ============================================================================
// Constants
// 常量
// ============================================================================

/** Plugin options storage key */
const PLUGIN_OPTIONS_KEY = '__REACT_DEVTOOLS_PLUGIN_OPTIONS__'

// ============================================================================
// Internal Utilities
// 内部工具
// ============================================================================

/**
 * Generate unique call ID
 * 生成唯一的调用 ID
 */
let callIdCounter = 0
function generateCallId(): string {
  return `${Date.now()}-${++callIdCounter}`
}

/**
 * Get current plugin name from context
 * 从上下文获取当前插件名称
 */
function getCurrentPluginName(): string | null {
  // Try to get from URL path
  if (typeof window !== 'undefined') {
    const match = window.location.hash.match(/\/plugins\/([^/]+)/)
    if (match) {
      return match[1]
    }
  }
  return null
}

// ============================================================================
// RPC Client Implementation
// RPC 客户端实现
// ============================================================================

/** Pending RPC calls */
const pendingCalls = new Map<string, {
  resolve: (value: any) => void
  reject: (error: Error) => void
}>()

/** Event listeners by plugin */
const eventListeners = new Map<string, Map<string, Set<(data: any) => void>>>()

/** Whether message listener is initialized */
let messageListenerInitialized = false

/**
 * Initialize global message listener
 * 初始化全局消息监听器
 */
function initMessageListener() {
  if (messageListenerInitialized || typeof window === 'undefined')
    return

  window.addEventListener('message', (event) => {
    const { type, plugin, callId, result, error, event: eventName, data } = event.data || {}

    // Handle RPC response
    if (type === '__DEVTOOLS_PLUGIN_RPC_RESPONSE__') {
      const pending = pendingCalls.get(callId)
      if (pending) {
        pendingCalls.delete(callId)
        if (error) {
          pending.reject(new Error(error))
        }
        else {
          pending.resolve(result)
        }
      }
    }

    // Handle plugin event
    if (type === '__DEVTOOLS_PLUGIN_EVENT__') {
      const pluginListeners = eventListeners.get(plugin)
      if (pluginListeners) {
        const handlers = pluginListeners.get(eventName)
        if (handlers) {
          handlers.forEach((handler) => {
            try {
              handler(data)
            }
            catch (e) {
              console.error(`[DevTools Plugin] Event handler error:`, e)
            }
          })
        }
      }
    }
  })

  messageListenerInitialized = true
}

/**
 * Create RPC client for a plugin
 * 为插件创建 RPC 客户端
 */
function createPluginRpcClient(pluginName: string): PluginRpcClient {
  initMessageListener()

  // Initialize event listeners map for this plugin
  if (!eventListeners.has(pluginName)) {
    eventListeners.set(pluginName, new Map())
  }

  return {
    /**
     * Call RPC method in host script
     * 调用宿主脚本中的 RPC 方法
     */
    call<T = any>(method: string, ...args: any[]): Promise<T> {
      return new Promise((resolve, reject) => {
        const callId = generateCallId()

        // Store pending call
        pendingCalls.set(callId, { resolve, reject })

        // Set timeout
        const timeout = setTimeout(() => {
          if (pendingCalls.has(callId)) {
            pendingCalls.delete(callId)
            reject(new Error(`RPC call "${method}" timed out`))
          }
        }, 30000) // 30 second timeout

        // Clean up timeout when resolved
        const originalResolve = resolve
        const originalReject = reject
        pendingCalls.set(callId, {
          resolve: (value) => {
            clearTimeout(timeout)
            originalResolve(value)
          },
          reject: (error) => {
            clearTimeout(timeout)
            originalReject(error)
          },
        })

        // Send RPC call to parent window (host application)
        window.parent.postMessage({
          type: '__DEVTOOLS_PLUGIN_RPC_CALL__',
          plugin: pluginName,
          method,
          args,
          callId,
        }, '*')
      })
    },

    /**
     * Listen to events from host script
     * 监听宿主脚本发送的事件
     */
    on(eventName: string, handler: (data: any) => void): () => void {
      const pluginListeners = eventListeners.get(pluginName)!
      if (!pluginListeners.has(eventName)) {
        pluginListeners.set(eventName, new Set())
      }
      pluginListeners.get(eventName)!.add(handler)

      // Return unsubscribe function
      return () => {
        const handlers = pluginListeners.get(eventName)
        if (handlers) {
          handlers.delete(handler)
        }
      }
    },

    /**
     * Listen to event once
     * 一次性监听事件
     */
    once(eventName: string, handler: (data: any) => void): () => void {
      const wrappedHandler = (data: any) => {
        // eslint-disable-next-line ts/no-use-before-define
        unsubscribe()
        handler(data)
      }
      const unsubscribe = this.on(eventName, wrappedHandler)
      return unsubscribe
    },
  }
}

// ============================================================================
// Public Hooks
// 公共 Hooks
// ============================================================================

// Note: These hooks require React as a peer dependency.
// We use dynamic imports to avoid bundling React.

/**
 * Get plugin RPC client
 * 获取插件 RPC 客户端
 *
 * Use this hook in plugin view components to communicate with the host script.
 *
 * @param pluginName - Plugin name (optional, auto-detected from URL if not provided)
 *
 * @example
 * ```tsx
 * import { usePluginRpc } from '@react-devtools-plus/api'
 *
 * function MyPluginPanel() {
 *   const rpc = usePluginRpc()
 *
 *   const handleClick = async () => {
 *     const data = await rpc.call('getData')
 *     console.log(data)
 *   }
 *
 *   return <button onClick={handleClick}>Get Data</button>
 * }
 * ```
 */
export function usePluginRpc(pluginName?: string): PluginRpcClient {
  // Lazy import React to avoid bundling issues
  const React = (globalThis as any).React
  if (!React) {
    throw new Error('usePluginRpc requires React to be available globally')
  }

  const useRef = React.useRef as <T>(initialValue: T) => { current: T }
  const name = pluginName || getCurrentPluginName()

  if (!name) {
    throw new Error('usePluginRpc: could not determine plugin name. Please provide it explicitly.')
  }

  const rpcRef = useRef<PluginRpcClient | null>(null)

  if (!rpcRef.current) {
    rpcRef.current = createPluginRpcClient(name)
  }

  return rpcRef.current
}

/**
 * Listen to plugin events
 * 监听插件事件
 *
 * @param eventName - Event name to listen for
 * @param handler - Event handler function
 * @param deps - Dependency array (optional)
 *
 * @example
 * ```tsx
 * import { usePluginEvent } from '@react-devtools-plus/api'
 *
 * function MyPluginPanel() {
 *   const [requests, setRequests] = useState([])
 *
 *   usePluginEvent('request:add', (request) => {
 *     setRequests(prev => [...prev, request])
 *   })
 *
 *   return <div>{requests.length} requests</div>
 * }
 * ```
 */
export function usePluginEvent(
  eventName: string,
  handler: (data: any) => void,
  deps: any[] = [],
): void {
  const React = (globalThis as any).React
  if (!React) {
    throw new Error('usePluginEvent requires React to be available globally')
  }

  const useEffect = React.useEffect as (effect: () => void | (() => void), deps?: any[]) => void
  const useRef = React.useRef as <T>(initialValue: T) => { current: T }
  const rpc = usePluginRpc()

  // Use ref to store latest handler to avoid stale closure
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    return rpc.on(eventName, (data) => {
      handlerRef.current(data)
    })
  }, [eventName, rpc, ...deps])
}

/**
 * Get plugin options
 * 获取插件选项
 *
 * Returns the options that were passed to the plugin factory function.
 *
 * @example
 * ```tsx
 * import { usePluginOptions } from '@react-devtools-plus/api'
 *
 * interface MyPluginOptions {
 *   maxItems: number
 *   showDebug: boolean
 * }
 *
 * function MyPluginPanel() {
 *   const options = usePluginOptions<MyPluginOptions>()
 *
 *   return <div>Max items: {options.maxItems}</div>
 * }
 * ```
 */
export function usePluginOptions<T = Record<string, any>>(pluginName?: string): T {
  const React = (globalThis as any).React
  if (!React) {
    throw new Error('usePluginOptions requires React to be available globally')
  }

  const useState = React.useState as <S>(initialState: S) => [S, (newState: S) => void]
  const useEffect = React.useEffect as (effect: () => void | (() => void), deps?: any[]) => void
  const name = pluginName || getCurrentPluginName()

  const [options, setOptions] = useState<T>({} as T)

  useEffect(() => {
    if (typeof window !== 'undefined' && name) {
      const pluginOptions = (window as any)[PLUGIN_OPTIONS_KEY]?.[name]
      if (pluginOptions) {
        setOptions(pluginOptions)
      }
    }
  }, [name])

  return options
}

// ============================================================================
// Non-Hook API (for use outside React components)
// 非 Hook API（用于 React 组件外部）
// ============================================================================

/**
 * Create a standalone RPC client (for use outside React components)
 * 创建独立的 RPC 客户端（用于 React 组件外部）
 *
 * @example
 * ```typescript
 * import { createRpcClient } from '@react-devtools-plus/api'
 *
 * const rpc = createRpcClient('my-plugin')
 * const data = await rpc.call('getData')
 * ```
 */
export function createRpcClient(pluginName: string): PluginRpcClient {
  return createPluginRpcClient(pluginName)
}

/**
 * Get plugin options (non-hook version)
 * 获取插件选项（非 Hook 版本）
 */
export function getPluginOptions<T = Record<string, any>>(pluginName: string): T {
  if (typeof window === 'undefined')
    return {} as T
  return ((window as any)[PLUGIN_OPTIONS_KEY]?.[pluginName] || {}) as T
}
