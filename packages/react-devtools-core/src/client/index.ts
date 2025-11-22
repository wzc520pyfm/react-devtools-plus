/**
 * Client connection management for React DevTools
 * React DevTools 客户端连接管理
 */

import { isBrowser, target } from '@react-devtools/shared'

/**
 * Set DevTools client URL
 * 设置 DevTools 客户端 URL
 */
export function setDevToolsClientUrl(url: string): void {
  target.__REACT_DEVTOOLS_CLIENT_URL__ = url
}

/**
 * Get DevTools client URL
 * 获取 DevTools 客户端 URL
 */
export function getDevToolsClientUrl(): string {
  return target.__REACT_DEVTOOLS_CLIENT_URL__ ?? (() => {
    if (isBrowser) {
      const devtoolsMeta = document.querySelector('meta[name=__REACT_DEVTOOLS_CLIENT_URL__]')
      if (devtoolsMeta)
        return devtoolsMeta.getAttribute('content') || ''
    }
    return ''
  })()
}

/**
 * Check if DevTools is enabled
 * 检查 DevTools 是否启用
 */
export function isDevToolsEnabled(): boolean {
  return target.__REACT_DEVTOOLS_ENABLED__ === true
}

/**
 * Set DevTools enabled state
 * 设置 DevTools 启用状态
 */
export function setDevToolsEnabled(enabled: boolean): void {
  target.__REACT_DEVTOOLS_ENABLED__ = enabled
}

/**
 * Get DevTools broadcast channel name
 * 获取 DevTools 广播通道名称
 */
export function getDevToolsChannelName(): string {
  return target.__REACT_DEVTOOLS_BROADCAST_CHANNEL__ || 'react-devtools'
}

/**
 * Set DevTools broadcast channel name
 * 设置 DevTools 广播通道名称
 */
export function setDevToolsChannelName(channelName: string): void {
  target.__REACT_DEVTOOLS_BROADCAST_CHANNEL__ = channelName
}

/**
 * Client connection manager
 * 客户端连接管理器
 */
export class ClientConnectionManager {
  private connections: Map<string, any>
  private reconnectAttempts: Map<string, number>
  private reconnectTimers: Map<string, NodeJS.Timeout>
  private maxReconnectAttempts: number
  private reconnectDelay: number

  constructor(options: {
    maxReconnectAttempts?: number
    reconnectDelay?: number
  } = {}) {
    this.connections = new Map()
    this.reconnectAttempts = new Map()
    this.reconnectTimers = new Map()
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5
    this.reconnectDelay = options.reconnectDelay || 1000
  }

  /**
   * Register a connection
   * 注册连接
   */
  register(id: string, connection: any): void {
    this.connections.set(id, connection)
    this.reconnectAttempts.set(id, 0)
  }

  /**
   * Unregister a connection
   * 注销连接
   */
  unregister(id: string): void {
    const timer = this.reconnectTimers.get(id)
    if (timer) {
      clearTimeout(timer)
      this.reconnectTimers.delete(id)
    }

    this.connections.delete(id)
    this.reconnectAttempts.delete(id)
  }

  /**
   * Get a connection
   * 获取连接
   */
  get(id: string): any {
    return this.connections.get(id)
  }

  /**
   * Get all connections
   * 获取所有连接
   */
  getAll(): Map<string, any> {
    return new Map(this.connections)
  }

  /**
   * Check if a connection exists
   * 检查连接是否存在
   */
  has(id: string): boolean {
    return this.connections.has(id)
  }

  /**
   * Handle connection error and attempt reconnect
   * 处理连接错误并尝试重连
   */
  handleError(id: string, error: Error, reconnectFn?: () => Promise<void>): void {
    console.error(`[React DevTools] Connection error for ${id}:`, error)

    if (!reconnectFn)
      return

    const attempts = this.reconnectAttempts.get(id) || 0

    if (attempts >= this.maxReconnectAttempts) {
      console.error(`[React DevTools] Max reconnect attempts reached for ${id}`)
      return
    }

    const delay = this.reconnectDelay * Math.pow(2, attempts) // Exponential backoff

    const timer = setTimeout(async () => {
      try {
        await reconnectFn()
        this.reconnectAttempts.set(id, 0) // Reset on successful reconnect
      }
      catch (err) {
        this.reconnectAttempts.set(id, attempts + 1)
        this.handleError(id, err as Error, reconnectFn)
      }
    }, delay)

    this.reconnectTimers.set(id, timer)
  }

  /**
   * Close all connections
   * 关闭所有连接
   */
  closeAll(): void {
    this.connections.forEach((connection) => {
      if (connection.$close) {
        connection.$close()
      }
    })

    this.reconnectTimers.forEach((timer) => {
      clearTimeout(timer)
    })

    this.connections.clear()
    this.reconnectAttempts.clear()
    this.reconnectTimers.clear()
  }
}

/**
 * Global client connection manager instance
 * 全局客户端连接管理器实例
 */
export const globalConnectionManager = new ClientConnectionManager()

