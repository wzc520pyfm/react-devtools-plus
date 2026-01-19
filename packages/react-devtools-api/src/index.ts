/**
 * @react-devtools-plus/api
 *
 * Public API for React DevTools Plus plugins.
 * This package provides browser-safe utilities for plugin authors.
 *
 * React DevTools Plus 插件的公共 API。
 * 此包为插件作者提供浏览器安全的工具函数。
 *
 * @example
 * ```typescript
 * import { defineDevToolsPlugin } from '@react-devtools-plus/api'
 *
 * export const MyPlugin = defineDevToolsPlugin(MyPanel, {
 *   packageName: '@my-org/devtools-plugin',
 *   exportName: 'MyPlugin',
 *   bundlePath: 'dist/index.mjs',
 * })
 * ```
 */

import type { ComponentType } from 'react'

/**
 * Plugin metadata for locating and loading the plugin bundle
 * 用于定位和加载插件 bundle 的元数据
 */
export interface DevToolsPluginMeta {
  /** npm package name / npm 包名 */
  packageName: string
  /** Export name from the module / 模块的导出名 */
  exportName: string
  /** Path to the ESM bundle within the package / 包内 ESM bundle 的路径 */
  bundlePath: string
}

/**
 * A React component with DevTools plugin metadata attached
 * 附加了 DevTools 插件元数据的 React 组件
 */
export type DevToolsPluginComponent<T extends ComponentType<any> = ComponentType<any>>
  = T & { __devtools_source__: DevToolsPluginMeta }

/**
 * Define a DevTools plugin component with metadata
 * 定义带有元数据的 DevTools 插件组件
 *
 * This function attaches metadata to a React component that allows
 * the DevTools to dynamically load the plugin from its npm package.
 *
 * 此函数将元数据附加到 React 组件上，使 DevTools 能够
 * 从其 npm 包动态加载插件。
 *
 * @param component - The React component to use as the plugin panel
 * @param meta - Plugin metadata for loading the component in the browser
 * @returns The component with attached metadata
 *
 * @example
 * ```typescript
 * import { defineDevToolsPlugin } from '@react-devtools-plus/api'
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
): DevToolsPluginComponent<T> {
  return Object.assign(component, {
    __devtools_source__: meta,
  })
}
