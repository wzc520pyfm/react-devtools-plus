/**
 * RPC types for React DevTools
 * React DevTools RPC 类型定义
 */

import type { ClientFunctions, ServerFunctions } from '../types'

/**
 * RPC channel interface
 * RPC 通道接口
 */
export interface RPCChannel {
  /**
   * Send message
   * 发送消息
   */
  send: (message: any) => void

  /**
   * Receive message handler
   * 接收消息处理器
   */
  onMessage: (handler: (message: any) => void) => () => void

  /**
   * Close channel
   * 关闭通道
   */
  close?: () => void
}

/**
 * RPC options
 * RPC 选项
 */
export interface RPCOptions {
  /**
   * Timeout for RPC calls (ms)
   * RPC 调用超时时间（毫秒）
   * @default 30000
   */
  timeout?: number

  /**
   * Enable logging
   * 启用日志
   * @default false
   */
  logging?: boolean
}

/**
 * RPC connection state
 * RPC 连接状态
 */
export type RPCConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error'

/**
 * RPC connection info
 * RPC 连接信息
 */
export interface RPCConnectionInfo {
  state: RPCConnectionState
  error?: Error
  connectedAt?: number
}

/**
 * Client RPC instance type
 * 客户端 RPC 实例类型
 */
export interface ClientRPC extends ClientFunctions {
  $functions: ClientFunctions
  $channel: RPCChannel
  $state: RPCConnectionInfo
  $close: () => void
}

/**
 * Server RPC instance type
 * 服务端 RPC 实例类型
 */
export interface ServerRPC extends ServerFunctions {
  $functions: ServerFunctions
  $channel: RPCChannel
  $state: RPCConnectionInfo
  $close: () => void
}
