/**
 * Sample DevTools Plugin
 * 示例 DevTools 插件
 *
 * 这个插件展示了如何使用新的插件 API 创建完整的插件：
 * - View (UI): 显示插件面板
 * - Host Script: 在宿主应用中运行，提供 RPC 方法和事件
 *
 * 新 API 特性：
 * - 可调用格式：plugins: [SamplePlugin()]
 * - 支持选项：plugins: [SamplePlugin({ showDebug: true })]
 * - 所有配置内置于插件中
 * - Host Script 支持 RPC 通信
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
  // 宿主脚本配置
  // 在宿主应用主线程中运行，提供 RPC 方法和事件
  host: {
    src: './src/host.ts',
    // ========================================
    // 简单注入位置:
    // ========================================
    // inject: 'body',           // 在 body 末尾注入
    // inject: 'head',           // 在 head 末尾注入
    // inject: 'head-prepend',   // 在 head 开头注入（最早执行，适合网络拦截）
    // inject: 'body-prepend',   // 在 body 开头注入
    // inject: 'idle',           // 使用 requestIdleCallback 延迟注入

    // ========================================
    // 函数式注入（精确控制）:
    // ========================================
    // inject: (html, scriptTag) => {
    //   // 在 React 脚本之后注入
    //   return html.replace(
    //     /(<script[^>]*src="[^"]*react[^"]*"[^>]*><\/script>)/i,
    //     `$1\n${scriptTag}`
    //   )
    // },
    //
    // inject: (html, scriptTag) => {
    //   // 在 importmap 之前注入
    //   return html.replace(
    //     /(<script[^>]*type="importmap")/i,
    //     `${scriptTag}\n$1`
    //   )
    // },

    inject: 'body', // 默认在 body 末尾注入
  },

  // ========================================
  // HTML 内容注入（importmap、link、meta 等）
  // ========================================
  // htmlInject: [
  //   // 注入 importmap
  //   {
  //     tag: 'script',
  //     attrs: { type: 'importmap' },
  //     children: JSON.stringify({
  //       imports: {
  //         'lodash': 'https://cdn.jsdelivr.net/npm/lodash-es/+esm',
  //       }
  //     }),
  //     inject: 'head-prepend',
  //   },
  //
  //   // 注入样式表
  //   {
  //     tag: 'link',
  //     attrs: { rel: 'stylesheet', href: '/my-plugin.css' },
  //     inject: 'head',
  //   },
  //
  //   // 使用函数精确定位
  //   {
  //     tag: 'meta',
  //     attrs: { name: 'my-plugin-version', content: '1.0.0' },
  //     inject: (html, content) => {
  //       // 在 viewport meta 之后注入
  //       return html.replace(
  //         /(<meta[^>]*name="viewport"[^>]*>)/i,
  //         `$1\n${content}`
  //       )
  //     },
  //   },
  // ],
  // 默认选项
  defaultOptions: {
    showDebug: false,
  },
})

// 同时作为默认导出
export default SamplePlugin
