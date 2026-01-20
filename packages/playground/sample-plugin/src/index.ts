/**
 * Sample DevTools Plugin
 * 示例 DevTools 插件
 *
 * 这个插件展示了如何使用新的插件 API 创建独立打包的插件
 *
 * 新 API 特性：
 * - 可调用格式：plugins: [SamplePlugin()]
 * - 支持选项：plugins: [SamplePlugin({ showDebug: true })]
 * - 所有配置内置于插件中
 */

import { defineDevToolsPlugin } from '@react-devtools-plus/api'
import SamplePanel from './SamplePanel'

// Re-export the panel component for browser loading
// 重新导出面板组件供浏览器加载
export { default as SamplePanel } from './SamplePanel'

/**
 * Sample Plugin Options
 * 示例插件选项
 */
export interface SamplePluginOptions {
  /** 是否显示调试信息 */
  showDebug?: boolean
}

/**
 * 使用新的 defineDevToolsPlugin API 定义插件
 *
 * 新 API 将所有配置（元数据、视图、宿主脚本、服务端）整合在一起，
 * 用户只需简单调用即可：plugins: [SamplePlugin()]
 */
export const SamplePlugin = defineDevToolsPlugin<SamplePluginOptions>({
  meta: {
    name: 'sample-plugin',
    title: 'Sample Plugin',
    icon: 'ph:puzzle-piece-fill',
    // npm 包元数据（用于加载打包组件）
    packageName: '@react-devtools-plus/sample-plugin',
    exportName: 'SamplePlugin',
    // viewExportName 指定浏览器加载时使用的组件导出名
    viewExportName: 'SamplePanel',
    bundlePath: 'dist/index.mjs',
  },
  view: {
    src: SamplePanel,
  },
  // 默认选项
  defaultOptions: {
    showDebug: false,
  },
  // 未来可以添加：
  // host: { src: './src/host.ts' },
  // server: { middleware: './src/server.ts' },
})

// 同时作为默认导出
export default SamplePlugin
