/**
 * RPC channels for different communication methods
 * 不同通信方式的 RPC 通道
 */

import type { RPCChannel } from './types'

/**
 * Create a BroadcastChannel-based RPC channel
 * 创建基于 BroadcastChannel 的 RPC 通道
 */
export function createBroadcastChannel(channelName: string): RPCChannel {
  const channel = new BroadcastChannel(channelName)
  const handlers = new Set<(message: any) => void>()

  channel.addEventListener('message', (event) => {
    handlers.forEach(handler => handler(event.data))
  })

  return {
    send: (message: any) => {
      channel.postMessage(message)
    },
    onMessage: (handler: (message: any) => void) => {
      handlers.add(handler)
      return () => handlers.delete(handler)
    },
    close: () => {
      channel.close()
      handlers.clear()
    },
  }
}

/**
 * Create a PostMessage-based RPC channel (for iframe communication)
 * 创建基于 PostMessage 的 RPC 通道（用于 iframe 通信）
 */
export function createPostMessageChannel(
  target: Window,
  origin: string = '*',
): RPCChannel {
  const handlers = new Set<(message: any) => void>()

  const messageHandler = (event: MessageEvent) => {
    if (origin !== '*' && event.origin !== origin)
      return

    handlers.forEach(handler => handler(event.data))
  }

  window.addEventListener('message', messageHandler)

  return {
    send: (message: any) => {
      target.postMessage(message, origin)
    },
    onMessage: (handler: (message: any) => void) => {
      handlers.add(handler)
      return () => handlers.delete(handler)
    },
    close: () => {
      window.removeEventListener('message', messageHandler)
      handlers.clear()
    },
  }
}

/**
 * Create a WebSocket-based RPC channel
 * 创建基于 WebSocket 的 RPC 通道
 */
export function createWebSocketChannel(url: string): RPCChannel {
  const ws = new WebSocket(url)
  const handlers = new Set<(message: any) => void>()

  ws.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data)
      handlers.forEach(handler => handler(data))
    }
    catch (error) {
      console.error('[RPC] Failed to parse WebSocket message:', error)
    }
  })

  return {
    send: (message: any) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message))
      }
    },
    onMessage: (handler: (message: any) => void) => {
      handlers.add(handler)
      return () => handlers.delete(handler)
    },
    close: () => {
      ws.close()
      handlers.clear()
    },
  }
}

/**
 * Create a custom event-based RPC channel (for in-page communication)
 * 创建基于自定义事件的 RPC 通道（用于页面内通信）
 */
export function createCustomEventChannel(eventName: string): RPCChannel {
  const handlers = new Set<(message: any) => void>()

  const eventHandler = (event: CustomEvent) => {
    handlers.forEach(handler => handler(event.detail))
  }

  window.addEventListener(eventName, eventHandler as EventListener)

  return {
    send: (message: any) => {
      window.dispatchEvent(new CustomEvent(eventName, { detail: message }))
    },
    onMessage: (handler: (message: any) => void) => {
      handlers.add(handler)
      return () => handlers.delete(handler)
    },
    close: () => {
      window.removeEventListener(eventName, eventHandler as EventListener)
      handlers.clear()
    },
  }
}
