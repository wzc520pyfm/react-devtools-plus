/**
 * Network Plugin
 * 网络插件
 *
 * Monitors and records all network requests (fetch, XHR, resources) in your application.
 * 监控和记录应用中的所有网络请求（fetch、XHR、资源）。
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { NetworkPlugin } from '@react-devtools-plus/plugin-network'
 *
 * export default defineConfig({
 *   plugins: [
 *     reactDevToolsPlus({
 *       plugins: [
 *         // Zero config
 *         NetworkPlugin(),
 *
 *         // With options
 *         NetworkPlugin({
 *           ignore: ['/api/health', /\.hot-update\./],
 *           maxRequests: 1000,
 *           recordBody: true,
 *         }),
 *       ],
 *     }),
 *   ],
 * })
 * ```
 */

import type { NetworkPluginOptions } from './types'
import { defineDevToolsPlugin } from '@react-devtools-plus/api'
import NetworkPanel from './Panel'

// Re-export the panel component for browser loading
// 重新导出面板组件供浏览器加载
export { default as NetworkPanel } from './Panel'

// Re-export types
export type { NetworkPluginOptions, NetworkRequest, NetworkStats } from './types'

/**
 * Network monitoring plugin for React DevTools Plus
 *
 * Features:
 * - Intercepts fetch and XHR requests
 * - Monitors resource loading (images, scripts, etc.)
 * - Records request/response details
 * - Filters and search capabilities
 *
 * 功能：
 * - 拦截 fetch 和 XHR 请求
 * - 监控资源加载（图片、脚本等）
 * - 记录请求/响应详情
 * - 过滤和搜索功能
 */
export const NetworkPlugin = defineDevToolsPlugin<NetworkPluginOptions>({
  meta: {
    name: 'network-inspector',
    title: 'Network',
    icon: 'lucide:network',
    packageName: '@react-devtools-plus/plugin-network',
    exportName: 'NetworkPlugin',
    // viewExportName 指定浏览器加载时使用的组件导出名
    viewExportName: 'NetworkPanel',
    bundlePath: 'dist/index.mjs',
  },
  view: {
    src: NetworkPanel,
  },
  host: {
    src: './src/host.ts',
    inject: 'head', // Inject early to catch all requests
  },
  defaultOptions: {
    maxRequests: 500,
    recordBody: true,
  },
})

export default NetworkPlugin
