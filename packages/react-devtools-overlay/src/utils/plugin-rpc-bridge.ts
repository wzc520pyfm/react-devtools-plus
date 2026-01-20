/**
 * Plugin RPC Bridge
 * 插件 RPC 桥接
 *
 * This module bridges RPC communication between:
 * - DevTools iframe (View layer) - inside react-devtools-client
 * - Host scripts (Host layer) - running in main page context
 *
 * Communication flow:
 * View -> postMessage -> Bridge -> direct call -> Host Script
 * Host Script -> emit -> Bridge -> postMessage -> View
 */

const PLUGIN_RPC_KEY = '__REACT_DEVTOOLS_PLUGIN_RPC__'

interface PluginRpcStorage {
  methods: Record<string, (...args: any[]) => any>
  eventListeners: Map<string, Set<(data: any) => void>>
}

/**
 * Initialize plugin RPC bridge
 * 初始化插件 RPC 桥接
 *
 * This sets up message listeners to handle RPC calls from the DevTools iframe
 * and forwards them to the host scripts.
 */
export function initPluginRpcBridge(): () => void {
  if (typeof window === 'undefined')
    return () => {}

  /**
   * Handle RPC call from DevTools iframe
   * 处理来自 DevTools iframe 的 RPC 调用
   */
  const handleRpcCall = async (event: MessageEvent) => {
    const { type, plugin, method, args, callId } = event.data || {}

    if (type !== '__DEVTOOLS_PLUGIN_RPC_CALL__')
      return

    // Get the registered plugin
    const rpcStorage = (window as any)[PLUGIN_RPC_KEY] as Record<string, PluginRpcStorage> | undefined
    const pluginRpc = rpcStorage?.[plugin]

    if (!pluginRpc) {
      // Send error response back to iframe
      broadcastToIframe({
        type: '__DEVTOOLS_PLUGIN_RPC_RESPONSE__',
        plugin,
        callId,
        error: `Plugin "${plugin}" not found or not registered`,
      })
      return
    }

    const rpcHandler = pluginRpc.methods[method]
    if (!rpcHandler) {
      broadcastToIframe({
        type: '__DEVTOOLS_PLUGIN_RPC_RESPONSE__',
        plugin,
        callId,
        error: `Method "${method}" not found in plugin "${plugin}"`,
      })
      return
    }

    // Execute the RPC method
    try {
      const result = await Promise.resolve(rpcHandler(...(args || [])))
      broadcastToIframe({
        type: '__DEVTOOLS_PLUGIN_RPC_RESPONSE__',
        plugin,
        callId,
        result,
      })
    }
    catch (error) {
      broadcastToIframe({
        type: '__DEVTOOLS_PLUGIN_RPC_RESPONSE__',
        plugin,
        callId,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  /**
   * Handle event forwarding from host script to DevTools iframe
   * 处理从宿主脚本到 DevTools iframe 的事件转发
   */
  const handlePluginEvent = (event: MessageEvent) => {
    const { type, plugin, event: eventName, data } = event.data || {}

    if (type !== '__DEVTOOLS_PLUGIN_EVENT__')
      return

    // Forward the event to the DevTools iframe
    const iframe = document.getElementById('react-devtools-client-iframe') as HTMLIFrameElement | null
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({
        type: '__DEVTOOLS_PLUGIN_EVENT__',
        plugin,
        event: eventName,
        data,
      }, '*')
    }
  }

  // Listen for messages
  window.addEventListener('message', handleRpcCall)
  window.addEventListener('message', handlePluginEvent)

  // Cleanup function
  return () => {
    window.removeEventListener('message', handleRpcCall)
    window.removeEventListener('message', handlePluginEvent)
  }
}

/**
 * Broadcast message to DevTools iframe
 * 向 DevTools iframe 广播消息
 */
function broadcastToIframe(message: any) {
  const iframe = document.getElementById('react-devtools-client-iframe') as HTMLIFrameElement | null
  if (iframe?.contentWindow) {
    iframe.contentWindow.postMessage(message, '*')
  }
}

/**
 * Check if plugin RPC is available for a plugin
 * 检查插件 RPC 是否可用
 */
export function isPluginRpcAvailable(pluginName: string): boolean {
  const rpcStorage = (window as any)[PLUGIN_RPC_KEY] as Record<string, PluginRpcStorage> | undefined
  return !!rpcStorage?.[pluginName]
}

/**
 * Get list of registered plugins with RPC
 * 获取已注册 RPC 的插件列表
 */
export function getRegisteredRpcPlugins(): string[] {
  const rpcStorage = (window as any)[PLUGIN_RPC_KEY] as Record<string, PluginRpcStorage> | undefined
  return rpcStorage ? Object.keys(rpcStorage) : []
}
