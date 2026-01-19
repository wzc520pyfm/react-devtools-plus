/**
 * React DevTools Plugin
 *
 * A universal plugin for Vite and Webpack that provides:
 * - Component tree inspection
 * - React Scan performance monitoring
 * - Source code location tracking
 * - Open in editor functionality
 *
 * Supports:
 * - Webpack 4/5
 * - webpack-dev-server 3/4+
 * - React 17/18+
 * - Vite 4+
 *
 * @example
 * ```ts
 * // Vite
 * import ReactDevTools from 'react-devtools-plus'
 * export default defineConfig({
 *   plugins: [
 *     ReactDevTools(),
 *   ],
 * })
 *
 * // Webpack
 * import { webpack as ReactDevTools } from 'react-devtools
 * module.exports = {
 *   plugins: [
 *     ReactDevTools(),
 *   ],
 * }
 * ```
 */

export type {
  ComponentPlugin,
  DevToolsPlugin,
  DevToolsPluginComponent,
  DevToolsPluginMeta,
  EnabledEnvironments,
  IframePlugin,
  ResolvedPluginConfig,
  ScanConfig,
  SerializedComponentPlugin,
  SerializedIframePlugin,
  SerializedPlugin,
  SerializedRendererMeta,
  SourcePathMode,
  UserPlugin,
} from './config/types.js'

// Plugin definition helper for plugin authors
export { defineDevToolsPlugin } from './define.js'

export { default, vite, webpack } from './unplugin.js'
export type { ReactDevToolsPluginOptions } from './unplugin.js'
