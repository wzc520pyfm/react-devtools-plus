/**
 * Sample DevTools Plugin
 * 示例 DevTools 插件
 *
 * 这个插件展示了如何使用插件 API 创建独立打包的插件
 */

import { defineDevToolsPlugin } from '@react-devtools-plus/api'
import SamplePanel from './SamplePanel'

/**
 * 导出带有元数据的插件组件
 *
 * defineDevToolsPlugin 会将以下元数据附加到组件上：
 * - packageName: npm 包名，用于定位 node_modules 中的包
 * - exportName: 导出名称，用于从模块中获取正确的导出
 * - bundlePath: ESM bundle 在包内的路径
 */
export const SamplePlugin = defineDevToolsPlugin(SamplePanel, {
  packageName: '@react-devtools-plus/sample-plugin',
  exportName: 'SamplePlugin',
  bundlePath: 'dist/index.mjs',
})

// 同时作为默认导出
export default SamplePlugin
