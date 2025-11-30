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
 * import ReactDevTools from 'react-devtools'
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
  EnabledEnvironments,
  ResolvedPluginConfig,
  ScanConfig,
  SourcePathMode,
} from './config/types.js'

export { default, vite, webpack } from './unplugin.js'
export type { ReactDevToolsPluginOptions } from './unplugin.js'

// Export middleware for manual integration (e.g. Next.js API Routes)
export { createPluginsMiddleware, createPluginFileMiddleware, serveClient, createOpenInEditorMiddleware } from './middleware/index.js'
export { resolvePluginConfig } from './config/normalize.js'
export { getClientPath } from './utils/paths.js'
