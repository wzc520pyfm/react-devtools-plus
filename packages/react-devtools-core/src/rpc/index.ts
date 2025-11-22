/**
 * RPC system for React DevTools
 * React DevTools RPC 系统
 */

import { createBirpc } from 'birpc'
import type { ClientFunctions, ServerFunctions } from '../types'
import type { ClientRPC, RPCChannel, RPCOptions, ServerRPC } from './types'

/**
 * Create client RPC instance
 * 创建客户端 RPC 实例
 */
export function createClientRPC(
  functions: ClientFunctions,
  channel: RPCChannel,
  options: RPCOptions = {},
): ClientRPC {
  const { timeout = 30000 } = options

  const rpc = createBirpc<ServerFunctions, ClientFunctions>(functions, {
    post: (data) => {
      channel.send(data)
    },
    on: (fn) => {
      return channel.onMessage(fn)
    },
    timeout,
  })

  return Object.assign(rpc, functions, {
    $functions: functions,
    $channel: channel,
    $state: {
      state: 'connected' as const,
      connectedAt: Date.now(),
    },
    $close: () => {
      channel.close?.()
    },
  }) as unknown as ClientRPC
}

/**
 * Create server RPC instance
 * 创建服务端 RPC 实例
 */
export function createServerRPC(
  functions: ServerFunctions,
  channel: RPCChannel,
  options: RPCOptions = {},
): ServerRPC {
  const { timeout = 30000 } = options

  const rpc = createBirpc<ClientFunctions, ServerFunctions>(functions, {
    post: (data) => {
      channel.send(data)
    },
    on: (fn) => {
      return channel.onMessage(fn)
    },
    timeout,
  })

  return Object.assign(rpc, functions, {
    $functions: functions,
    $channel: channel,
    $state: {
      state: 'connected' as const,
      connectedAt: Date.now(),
    },
    $close: () => {
      channel.close?.()
    },
  }) as unknown as ServerRPC
}

// Export channel creators
export * from './channel'
export * from './types'

