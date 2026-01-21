/**
 * @react-devtools-plus/api
 *
 * Public API for React DevTools Plus plugins.
 * React DevTools Plus 插件的公共 API。
 *
 * This package provides:
 * - Plugin definition API (`defineDevToolsPlugin`)
 * - Host script API (`defineHostPlugin`)
 * - View hooks (`usePluginRpc`, `usePluginEvent`, `usePluginOptions`)
 * - Type definitions
 *
 * @example
 * ```typescript
 * // Define a plugin with full capabilities
 * import { defineDevToolsPlugin, type DevToolsPluginProps } from '@react-devtools-plus/api'
 *
 * function MyPanel({ tree, selectedNodeId, theme }: DevToolsPluginProps) {
 *   return <div>My Plugin</div>
 * }
 *
 * export const MyPlugin = defineDevToolsPlugin({
 *   meta: {
 *     name: 'my-plugin',
 *     title: 'My Plugin',
 *     icon: 'lucide:puzzle',
 *     packageName: '@my-org/devtools-plugin',
 *     exportName: 'MyPlugin',
 *     bundlePath: 'dist/index.mjs',
 *   },
 *   view: { src: MyPanel },
 *   host: { src: './src/host.ts' },
 * })
 *
 * // Use in vite.config.ts:
 * // plugins: [reactDevToolsPlus({ plugins: [MyPlugin()] })]
 * ```
 */

// ============================================================================
// Type Exports
// 类型导出
// ============================================================================

export {
  defineDevToolsPlugin,
  isDevToolsPlugin,
  isLegacyPluginComponent,
} from './define'

// ============================================================================
// Plugin Definition API
// 插件定义 API
// ============================================================================

export {
  // Non-hook API
  createRpcClient,
  getPluginOptions,
  usePluginEvent,
  usePluginOptions,
  // React hooks
  usePluginRpc,
} from './hooks'

// ============================================================================
// Host Plugin API
// 宿主插件 API
// ============================================================================

export {
  defineHostPlugin,
  getRegisteredHostPlugins,
  unregisterHostPlugin,
} from './host'

// ============================================================================
// View Hooks API
// 视图 Hooks API
// ============================================================================

export type {
  // Inject position types
  AdvancedInjectConfig,
  ColorPalette,
  // Component tree types
  ComponentTreeNode,
  DefinePluginConfig,

  DevToolsPluginFC,

  DevToolsPluginInstance,
  // Plugin props
  DevToolsPluginProps,

  DevToolsTheme,
  FetchInterceptHandler,
  // Host plugin types
  HostPluginConfig,
  HostPluginContext,
  // HTML inject types (new)
  HtmlInjectConfig,
  InjectFunction,
  InjectPosition,
  LegacyPluginComponent,
  // Legacy types (backward compatibility)
  LegacyPluginMeta,
  // Network interceptor types
  NetworkInterceptor,

  NormalizedInjectConfig,

  // Plugin extend config (for user customization)
  PluginExtendConfig,
  PluginHostConfig,
  // Plugin definition types (new API)
  PluginMeta,

  // RPC types
  PluginRpcClient,
  PluginServerConfig,

  PluginViewConfig,
  ResolvedPluginConfig,
  SimpleInjectPosition,
  // Theme types
  ThemeMode,

  XHRInterceptHandler,
} from './types'

// ============================================================================
// Legacy API (for backward compatibility)
// 旧 API（向后兼容）
// ============================================================================

/**
 * @deprecated Use PluginMeta instead
 */
export type { LegacyPluginMeta as DevToolsPluginMeta } from './types'

/**
 * @deprecated Use DevToolsPluginInstance instead
 */
export type { LegacyPluginComponent as DevToolsPluginComponent } from './types'
