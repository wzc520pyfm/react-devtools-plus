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
 * import { defineDevToolsPlugin, type DevToolsPluginProps } from '@react-devtools-plus/api'
 *
 * function MyPanel({ tree, selectedNodeId, theme }: DevToolsPluginProps) {
 *   return <div>My Plugin</div>
 * }
 *
 * export const MyPlugin = defineDevToolsPlugin(MyPanel, {
 *   packageName: '@my-org/devtools-plugin',
 *   exportName: 'MyPlugin',
 *   bundlePath: 'dist/index.mjs',
 * })
 * ```
 */

import type { ComponentType, FC } from 'react'

// ============================================================================
// Plugin Props Types
// ============================================================================

/**
 * Theme mode
 * 主题模式
 */
export type ThemeMode = 'light' | 'dark'

/**
 * Color palette with shades
 * 颜色调色板
 */
export interface ColorPalette {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950: string
}

/**
 * Theme object passed to plugins
 * 传递给插件的主题对象
 */
export interface DevToolsTheme {
  /** Current theme mode / 当前主题模式 */
  mode: ThemeMode
  /** Color palettes / 颜色调色板 */
  colors: {
    primary: ColorPalette
    success: ColorPalette
    warning: ColorPalette
    error: ColorPalette
    info: ColorPalette
    neutral: ColorPalette
  }
}

/**
 * Component tree node (simplified)
 * 组件树节点（简化版）
 */
export interface ComponentTreeNode {
  id: number
  name: string
  children?: ComponentTreeNode[]
  [key: string]: any
}

/**
 * Props passed to DevTools plugin components
 * 传递给 DevTools 插件组件的 props
 *
 * @example
 * ```typescript
 * import type { DevToolsPluginProps } from '@react-devtools-plus/api'
 *
 * export default function MyPlugin({ tree, selectedNodeId, theme }: DevToolsPluginProps) {
 *   return (
 *     <div>
 *       <p>Selected: {selectedNodeId ?? 'None'}</p>
 *       <p>Theme: {theme.mode}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export interface DevToolsPluginProps {
  /** Component tree data / 组件树数据 */
  tree: ComponentTreeNode | null
  /** Currently selected node ID / 当前选中的节点 ID */
  selectedNodeId: string | null
  /** Theme configuration / 主题配置 */
  theme: DevToolsTheme
}

/**
 * DevTools plugin component type
 * DevTools 插件组件类型
 */
export type DevToolsPluginFC = FC<DevToolsPluginProps>

// ============================================================================
// Plugin Definition Types
// ============================================================================

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
export type DevToolsPluginComponent<T extends ComponentType<DevToolsPluginProps> = ComponentType<DevToolsPluginProps>>
  = T & { __devtools_source__?: DevToolsPluginMeta }

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
 * @param component - The React component to use as the plugin panel (must accept DevToolsPluginProps)
 * @param meta - Plugin metadata for loading the component in the browser
 * @returns The component with attached metadata
 *
 * @example
 * ```typescript
 * import { defineDevToolsPlugin, type DevToolsPluginProps } from '@react-devtools-plus/api'
 *
 * function MyPanel({ tree, selectedNodeId, theme }: DevToolsPluginProps) {
 *   return <div>Theme: {theme.mode}</div>
 * }
 *
 * export const MyPlugin = defineDevToolsPlugin(MyPanel, {
 *   packageName: '@my-org/devtools-plugin',
 *   exportName: 'MyPlugin',
 *   bundlePath: 'dist/index.mjs',
 * })
 * ```
 */
export function defineDevToolsPlugin<T extends ComponentType<DevToolsPluginProps>>(
  component: T,
  meta?: DevToolsPluginMeta,
): DevToolsPluginComponent<T> {
  return Object.assign(component, {
    __devtools_source__: meta,
  })
}
