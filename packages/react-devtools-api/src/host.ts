/**
 * Host Plugin API
 * 宿主插件 API
 *
 * This module provides APIs for plugin host scripts that run in the host application's main thread.
 * 此模块提供在宿主应用主线程中运行的插件宿主脚本 API。
 */

import type {
  FetchInterceptHandler,
  HostPluginConfig,
  HostPluginContext,
  NetworkInterceptor,
  XHRInterceptHandler,
} from './types'

// ============================================================================
// Internal State
// 内部状态
// ============================================================================

/** Registered host plugins */
const registeredPlugins = new Map<string, {
  config: HostPluginConfig
  cleanup: (() => void)[]
}>()

/** Global plugin RPC channel key */
const PLUGIN_RPC_KEY = '__REACT_DEVTOOLS_PLUGIN_RPC__'

/** Plugin options storage key */
const PLUGIN_OPTIONS_KEY = '__REACT_DEVTOOLS_PLUGIN_OPTIONS__'

// ============================================================================
// Network Interceptor Implementation
// 网络拦截器实现
// ============================================================================

/**
 * Create network interceptor
 * 创建网络拦截器
 */
function createNetworkInterceptor(): NetworkInterceptor {
  const fetchHandlers: FetchInterceptHandler[] = []
  const xhrHandlers: XHRInterceptHandler[] = []
  const resourceHandlers: Array<(entry: PerformanceResourceTiming) => void> = []

  // Get original functions (may have been stored by early patch script)
  const originalFetch = typeof window !== 'undefined'
    ? ((window as any).__DEVTOOLS_ORIGINAL_FETCH__ || window.fetch)
    : undefined
  const OriginalXHR = typeof window !== 'undefined'
    ? ((window as any).__DEVTOOLS_ORIGINAL_XHR__ || window.XMLHttpRequest)
    : undefined

  let fetchPatched = false
  let xhrPatched = false
  let resourceObserver: PerformanceObserver | null = null
  let earlyRequestsProcessed = false

  /**
   * Process early requests captured before host script loaded
   */
  function processEarlyRequests() {
    if (earlyRequestsProcessed || typeof window === 'undefined')
      return
    earlyRequestsProcessed = true

    const earlyRequests = (window as any).__DEVTOOLS_EARLY_REQUESTS__ as Array<{
      input?: RequestInfo | URL
      init?: RequestInit
      method?: string
      url?: string
      time: number
      type: 'fetch' | 'xhr'
      xhr?: XMLHttpRequest
    }> | undefined

    if (!earlyRequests || earlyRequests.length === 0)
      return

    console.log(`[DevTools Plugin] Processing ${earlyRequests.length} early requests`)

    for (const req of earlyRequests) {
      if (req.type === 'fetch' && req.input) {
        // Create a synthetic request for early fetch calls
        try {
          const request = new Request(req.input, req.init)
          for (const handler of fetchHandlers) {
            if (handler.onRequest) {
              try {
                handler.onRequest(request)
              }
              catch (e) {
                console.error('[DevTools Plugin] onRequest error:', e)
              }
            }
          }
        }
        catch (e) {
          // Ignore invalid requests
        }
      }
      else if (req.type === 'xhr' && req.method && req.url) {
        // Process early XHR calls
        for (const handler of xhrHandlers) {
          if (handler.onOpen) {
            try {
              handler.onOpen(req.method!, req.url!, req.xhr!)
            }
            catch (e) {
              console.error('[DevTools Plugin] XHR onOpen error:', e)
            }
          }
        }
      }
    }

    // Clear the queue
    ;(window as any).__DEVTOOLS_EARLY_REQUESTS__ = []
  }

  /**
   * Patch fetch
   */
  function patchFetch() {
    if (fetchPatched || !originalFetch || typeof window === 'undefined')
      return

    window.fetch = async function patchedFetch(
      input: RequestInfo | URL,
      init?: RequestInit,
    ): Promise<Response> {
      let request = new Request(input, init)

      // onRequest hooks
      for (const handler of fetchHandlers) {
        if (handler.onRequest) {
          try {
            const result = await handler.onRequest(request)
            if (result instanceof Response) {
              // Return mock response
              return result
            }
            if (result instanceof Request) {
              // Use modified request
              request = result
            }
          }
          catch (e) {
            console.error('[DevTools Plugin] onRequest error:', e)
          }
        }
      }

      try {
        let response = await originalFetch.call(window, request)

        // onResponse hooks
        for (const handler of fetchHandlers) {
          if (handler.onResponse) {
            try {
              const result = await handler.onResponse(response.clone(), request)
              if (result instanceof Response) {
                response = result
              }
            }
            catch (e) {
              console.error('[DevTools Plugin] onResponse error:', e)
            }
          }
        }

        return response
      }
      catch (error) {
        // onError hooks
        for (const handler of fetchHandlers) {
          if (handler.onError) {
            try {
              handler.onError(error as Error, request)
            }
            catch (e) {
              console.error('[DevTools Plugin] onError handler error:', e)
            }
          }
        }
        throw error
      }
    }

    fetchPatched = true
  }

  /**
   * Patch XMLHttpRequest
   */
  function patchXHR() {
    if (xhrPatched || !OriginalXHR || typeof window === 'undefined')
      return

    const XHRProto = OriginalXHR.prototype

    // Save original methods
    const originalOpen = XHRProto.open
    const originalSend = XHRProto.send

    // Patch open
    XHRProto.open = function patchedOpen(
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null,
    ) {
      // Store method and url for handlers
      (this as any).__devtools_method__ = method
      ;(this as any).__devtools_url__ = url.toString()

      // Call onOpen handlers
      for (const handler of xhrHandlers) {
        if (handler.onOpen) {
          try {
            handler.onOpen(method, url.toString(), this)
          }
          catch (e) {
            console.error('[DevTools Plugin] XHR onOpen error:', e)
          }
        }
      }

      return originalOpen.call(this, method, url, async ?? true, username, password)
    }

    // Patch send
    XHRProto.send = function patchedSend(body?: Document | XMLHttpRequestBodyInit | null) {
      // Call onSend handlers
      for (const handler of xhrHandlers) {
        if (handler.onSend) {
          try {
            handler.onSend(body, this)
          }
          catch (e) {
            console.error('[DevTools Plugin] XHR onSend error:', e)
          }
        }
      }

      // Listen for load and error events
      this.addEventListener('load', () => {
        for (const handler of xhrHandlers) {
          if (handler.onLoad) {
            try {
              handler.onLoad(this)
            }
            catch (e) {
              console.error('[DevTools Plugin] XHR onLoad error:', e)
            }
          }
        }
      })

      this.addEventListener('error', () => {
        for (const handler of xhrHandlers) {
          if (handler.onError) {
            try {
              handler.onError(this)
            }
            catch (e) {
              console.error('[DevTools Plugin] XHR onError error:', e)
            }
          }
        }
      })

      return originalSend.call(this, body)
    }

    xhrPatched = true
  }

  /**
   * Start resource observer
   */
  function startResourceObserver() {
    if (resourceObserver || typeof PerformanceObserver === 'undefined')
      return

    // First, get existing resource entries (loaded before observer started)
    const existingEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    for (const entry of existingEntries) {
      for (const handler of resourceHandlers) {
        try {
          handler(entry)
        }
        catch (e) {
          console.error('[DevTools Plugin] Resource handler error:', e)
        }
      }
    }

    // Then observe new resources
    resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          for (const handler of resourceHandlers) {
            try {
              handler(entry as PerformanceResourceTiming)
            }
            catch (e) {
              console.error('[DevTools Plugin] Resource handler error:', e)
            }
          }
        }
      }
    })

    resourceObserver.observe({ entryTypes: ['resource'] })
  }

  return {
    onFetch(handler: FetchInterceptHandler) {
      fetchHandlers.push(handler)
      patchFetch()
      // Process any early requests captured before this handler was registered
      processEarlyRequests()
      return () => {
        const idx = fetchHandlers.indexOf(handler)
        if (idx > -1)
          fetchHandlers.splice(idx, 1)
      }
    },

    onXHR(handler: XHRInterceptHandler) {
      xhrHandlers.push(handler)
      patchXHR()
      // Process any early XHR requests
      processEarlyRequests()
      return () => {
        const idx = xhrHandlers.indexOf(handler)
        if (idx > -1)
          xhrHandlers.splice(idx, 1)
      }
    },

    onResource(handler: (entry: PerformanceResourceTiming) => void) {
      resourceHandlers.push(handler)
      startResourceObserver()
      return () => {
        const idx = resourceHandlers.indexOf(handler)
        if (idx > -1)
          resourceHandlers.splice(idx, 1)
      }
    },
  }
}

// Singleton network interceptor
let networkInterceptor: NetworkInterceptor | null = null

function getNetworkInterceptor(): NetworkInterceptor {
  if (!networkInterceptor) {
    networkInterceptor = createNetworkInterceptor()
  }
  return networkInterceptor
}

// ============================================================================
// RPC Communication
// RPC 通信
// ============================================================================

/**
 * Create RPC channel for plugin
 * 为插件创建 RPC 通道
 */
function createPluginRpcChannel(pluginName: string, rpcMethods: Record<string, (...args: any[]) => any>) {
  if (typeof window === 'undefined')
    return { cleanup: () => {} }

  // Initialize global RPC storage
  const rpcStorage = ((window as any)[PLUGIN_RPC_KEY] ||= {}) as Record<string, any>
  rpcStorage[pluginName] = {
    methods: rpcMethods,
    eventListeners: new Map<string, Set<(data: any) => void>>(),
  }

  // Listen for RPC calls from DevTools iframe
  const handleMessage = (event: MessageEvent) => {
    const { type, plugin, method, args, callId } = event.data || {}

    if (type !== '__DEVTOOLS_PLUGIN_RPC_CALL__' || plugin !== pluginName)
      return

    const rpcHandler = rpcMethods[method]
    if (!rpcHandler) {
      // Send error response
      window.postMessage({
        type: '__DEVTOOLS_PLUGIN_RPC_RESPONSE__',
        plugin: pluginName,
        callId,
        error: `Method "${method}" not found in plugin "${pluginName}"`,
      }, '*')
      return
    }

    // Execute RPC method
    Promise.resolve()
      .then(() => rpcHandler(...(args || [])))
      .then((result) => {
        window.postMessage({
          type: '__DEVTOOLS_PLUGIN_RPC_RESPONSE__',
          plugin: pluginName,
          callId,
          result,
        }, '*')
      })
      .catch((error) => {
        window.postMessage({
          type: '__DEVTOOLS_PLUGIN_RPC_RESPONSE__',
          plugin: pluginName,
          callId,
          error: error?.message || String(error),
        }, '*')
      })
  }

  window.addEventListener('message', handleMessage)

  return {
    cleanup: () => {
      window.removeEventListener('message', handleMessage)
      delete rpcStorage[pluginName]
    },
  }
}

/**
 * Emit event to DevTools iframe
 * 向 DevTools iframe 发送事件
 */
function emitToDevTools(pluginName: string, eventName: string, data?: any) {
  if (typeof window === 'undefined')
    return

  window.postMessage({
    type: '__DEVTOOLS_PLUGIN_EVENT__',
    plugin: pluginName,
    event: eventName,
    data,
  }, '*')
}

// ============================================================================
// DevTools API Bridge
// DevTools API 桥接
// ============================================================================

/**
 * Create DevTools context for plugin
 * 为插件创建 DevTools 上下文
 */
function createDevToolsContext(): HostPluginContext['devtools'] {
  return {
    getTree() {
      // Access global tree from react-devtools-kit
      return (window as any).__REACT_DEVTOOLS_TREE__ || null
    },
    getSelectedNodeId() {
      return (window as any).__REACT_DEVTOOLS_SELECTED_NODE_ID__ || null
    },
    highlightNode(fiberId: string) {
      // Call react-devtools-kit highlight function
      const highlightFn = (window as any).__REACT_DEVTOOLS_HIGHLIGHT_NODE__
      if (typeof highlightFn === 'function') {
        highlightFn(fiberId)
      }
    },
    hideHighlight() {
      const hideFn = (window as any).__REACT_DEVTOOLS_HIDE_HIGHLIGHT__
      if (typeof hideFn === 'function') {
        hideFn()
      }
    },
  }
}

// ============================================================================
// Public API
// 公共 API
// ============================================================================

/**
 * Define a host plugin
 * 定义宿主插件
 *
 * Host plugins run in the host application's main thread and can:
 * - Intercept network requests (fetch, XHR, resources)
 * - Access and manipulate the host page's DOM
 * - Communicate with the DevTools UI via RPC
 *
 * 宿主插件运行在宿主应用的主线程中，可以：
 * - 拦截网络请求（fetch、XHR、资源）
 * - 访问和操作宿主页面的 DOM
 * - 通过 RPC 与 DevTools UI 通信
 *
 * @example
 * ```typescript
 * // src/host.ts
 * import { defineHostPlugin } from '@react-devtools-plus/api'
 *
 * export default defineHostPlugin({
 *   name: 'network-inspector',
 *
 *   rpc: {
 *     getRequests() {
 *       return Array.from(requests.values())
 *     },
 *     clearRequests() {
 *       requests.clear()
 *     },
 *   },
 *
 *   setup(ctx) {
 *     ctx.network.onFetch({
 *       onRequest(request) {
 *         // Record request
 *         ctx.emit('request:start', { url: request.url })
 *       },
 *       onResponse(response, request) {
 *         ctx.emit('request:complete', {
 *           url: request.url,
 *           status: response.status,
 *         })
 *       },
 *     })
 *   },
 * })
 * ```
 */
export function defineHostPlugin(config: HostPluginConfig): void {
  const { name, rpc = {}, setup, teardown } = config

  // Check if already registered
  if (registeredPlugins.has(name)) {
    console.warn(`[DevTools Plugin] Plugin "${name}" is already registered, skipping.`)
    return
  }

  const cleanup: (() => void)[] = []

  // Create RPC channel
  const { cleanup: rpcCleanup } = createPluginRpcChannel(name, rpc)
  cleanup.push(rpcCleanup)

  // Create plugin context
  const ctx: HostPluginContext = {
    emit: (eventName, data) => emitToDevTools(name, eventName, data),
    getOptions: <T = Record<string, any>>() => {
      const options = (window as any)[PLUGIN_OPTIONS_KEY]?.[name]
      return (options || {}) as T
    },
    network: getNetworkInterceptor(),
    devtools: createDevToolsContext(),
  }

  // Run setup
  if (setup) {
    try {
      const result = setup(ctx)
      // Handle async setup or cleanup function
      if (result instanceof Promise) {
        result
          .then((cleanupFn) => {
            if (typeof cleanupFn === 'function') {
              cleanup.push(cleanupFn)
            }
          })
          .catch((error) => {
            console.error(`[DevTools Plugin] Setup error in plugin "${name}":`, error)
          })
      }
      else if (typeof result === 'function') {
        // Sync setup returned a cleanup function
        cleanup.push(result)
      }
    }
    catch (error) {
      console.error(`[DevTools Plugin] Setup error in plugin "${name}":`, error)
    }
  }

  // Store plugin registration
  registeredPlugins.set(name, {
    config,
    cleanup,
  })

  // Register teardown if provided
  if (teardown) {
    cleanup.push(teardown)
  }

  // Log registration
  console.log(`[DevTools Plugin] Host plugin "${name}" registered`)
}

/**
 * Unregister a host plugin
 * 注销宿主插件
 */
export function unregisterHostPlugin(name: string): void {
  const registration = registeredPlugins.get(name)
  if (!registration)
    return

  // Run cleanup functions
  for (const fn of registration.cleanup) {
    try {
      fn()
    }
    catch (e) {
      console.error(`[DevTools Plugin] Cleanup error in plugin "${name}":`, e)
    }
  }

  registeredPlugins.delete(name)
  console.log(`[DevTools Plugin] Host plugin "${name}" unregistered`)
}

/**
 * Get registered host plugin names
 * 获取已注册的宿主插件名称
 */
export function getRegisteredHostPlugins(): string[] {
  return Array.from(registeredPlugins.keys())
}
