/**
 * Re-export from @react-devtools-plus/api
 * 从 @react-devtools-plus/api 重导出
 *
 * @example
 * ```typescript
 * import { defineDevToolsPlugin } from 'react-devtools-plus/api'
 * // or
 * import { defineDevToolsPlugin } from '@react-devtools-plus/api'
 * ```
 */

export {
  // Non-hook API
  createRpcClient,
  // Plugin definition
  defineDevToolsPlugin,
  // Host plugin
  defineHostPlugin,
  // Types
  type DevToolsPluginComponent,
  type DevToolsPluginMeta,
  type DevToolsPluginProps,
  getPluginOptions,
  type HostPluginConfig,
  type HostPluginContext,
  // View hooks
  usePluginEvent,
  usePluginOptions,
  usePluginRpc,
} from '@react-devtools-plus/api'
