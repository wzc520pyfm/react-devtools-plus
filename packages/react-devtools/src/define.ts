/**
 * Helper function for plugin authors to define DevTools plugins
 * 插件作者使用的辅助函数，用于定义 DevTools 插件
 */

import type { ComponentType } from 'react'
import type { DevToolsPluginMeta } from './config/types'

/**
 * Define a DevTools plugin component with metadata
 * 定义带有元数据的 DevTools 插件组件
 *
 * @param component - The React component to use as the plugin panel
 * @param meta - Plugin metadata for loading the component in the browser
 * @returns The component with attached metadata
 *
 * @example
 * ```typescript
 * // @my-org/devtools-plugin/src/index.ts
 * import { defineDevToolsPlugin } from 'react-devtools-plus'
 * import MyPanel from './MyPanel'
 *
 * export const MyPlugin = defineDevToolsPlugin(MyPanel, {
 *   packageName: '@my-org/devtools-plugin',
 *   exportName: 'MyPlugin',
 *   bundlePath: 'dist/index.mjs',
 * })
 * ```
 */
export function defineDevToolsPlugin<T extends ComponentType<any>>(
  component: T,
  meta: DevToolsPluginMeta,
): T & { __devtools_source__: DevToolsPluginMeta } {
  return Object.assign(component, {
    __devtools_source__: meta,
  })
}
