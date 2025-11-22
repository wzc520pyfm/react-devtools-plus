import type { BirpcGroup, BirpcOptions, BirpcReturn } from 'birpc'
import type { Presets } from './presets'
import type { MergeableChannelOptions } from './types/channel'
import { target } from '@react-devtools/shared'
import { createBirpc, createBirpcGroup } from 'birpc'
import { getChannel } from './presets'

export interface CreateRpcClientOptions<RemoteFunctions> {
  preset?: Presets
  channel?: MergeableChannelOptions
  options?: BirpcOptions<RemoteFunctions>
}

export interface CreateRpcServerOptions<RemoteFunctions> {
  preset?: Presets
  channel?: MergeableChannelOptions
}

target.__REACT_DEVTOOLS_KIT_RPC_CLIENT__ ??= null!

target.__REACT_DEVTOOLS_KIT_RPC_SERVER__ ??= null!

function setRpcClientToGlobal<R, L>(rpc: BirpcReturn<R, L>) {
  target.__REACT_DEVTOOLS_KIT_RPC_CLIENT__ = rpc
}

export function setRpcServerToGlobal<R, L>(rpc: BirpcGroup<R, L>) {
  target.__REACT_DEVTOOLS_KIT_RPC_SERVER__ = rpc
}

export function getRpcClient<RemoteFunctions = Record<string, never>, LocalFunctions extends object = Record<string, (arg: any) => void>>(): BirpcReturn<RemoteFunctions, LocalFunctions> | null {
  return target.__REACT_DEVTOOLS_KIT_RPC_CLIENT__ ?? null
}

export function getRpcServer<RemoteFunctions = Record<string, never>, LocalFunctions extends object = Record<string, (arg: any) => void>>(): BirpcGroup<RemoteFunctions, LocalFunctions> | null {
  return target.__REACT_DEVTOOLS_KIT_RPC_SERVER__ ?? null
}

export function createRpcClient<RemoteFunctions = Record<string, never>, LocalFunctions extends object = Record<string, (arg: any) => void>>(
  functions: LocalFunctions,
  options: CreateRpcClientOptions<RemoteFunctions> = {},
): BirpcReturn<RemoteFunctions, LocalFunctions> {
  const { channel: _channel, options: _options, preset } = options

  const channel = preset ? getChannel(preset, 'client') : _channel!
  const rpc = createBirpc<RemoteFunctions, LocalFunctions>(functions, {
    ..._options,
    ...channel,
    timeout: -1,
  })

  setRpcClientToGlobal<RemoteFunctions, LocalFunctions>(rpc)
  return rpc
}

export function createRpcServer<RemoteFunctions = Record<string, never>, LocalFunctions extends object = Record<string, (arg: any) => void>>(
  functions: LocalFunctions,
  options: CreateRpcServerOptions<RemoteFunctions> = {},
): void {
  const { channel: _channel, preset } = options

  const channel = preset ? getChannel(preset, 'server') : _channel!

  const rpcServer = getRpcServer<RemoteFunctions, LocalFunctions>()
  if (!rpcServer) {
    const group = createBirpcGroup<RemoteFunctions, LocalFunctions>(functions, [channel], {
      timeout: -1,
    })

    setRpcServerToGlobal(group)
  }
  else {
    rpcServer.updateChannels((channels) => {
      channels.push(channel)
    })
  }
}
