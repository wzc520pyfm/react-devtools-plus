/**
 * Plugin options type definitions
 * 插件配置类型定义
 */

import type { ReactDevtoolsScanOptions } from '@react-devtools-plus/scan'
import type { ComponentType } from 'react'

/**
 * Source path mode for code location injection
 * 源码路径模式
 */
export type SourcePathMode = 'absolute' | 'relative'

/**
 * Environment configuration
 * 环境配置
 */
export type EnabledEnvironments = boolean | string[]

/**
 * React Scan configuration
 * React Scan 配置
 */
export interface ScanConfig extends ReactDevtoolsScanOptions {
  /**
   * Enable React Scan integration
   * @default false
   */
  enabled?: boolean

  /**
   * Show the scan toolbar
   * @default false
   */
  showToolbar?: boolean

  /**
   * Show render outlines
   * @default true
   */
  showOutlines?: boolean

  /**
   * Enable logging
   * @default false
   */
  log?: boolean
}

/**
 * User Plugin View Configuration (Legacy)
 * 用户插件视图配置（旧版）
 */
export interface UserPluginView {
  /**
   * Sidebar label
   * 侧边栏标题
   */
  title: string

  /**
   * Sidebar icon (Lucide icon name or SVG string)
   * 侧边栏图标
   */
  icon: string

  /**
   * Path to the React component file
   * React 组件文件路径
   */
  src: string
}

/**
 * Legacy User Plugin Configuration
 * 旧版用户插件配置（向后兼容）
 */
export interface LegacyUserPlugin {
  /**
   * Plugin unique name
   * 插件唯一名称
   */
  name: string

  /**
   * Plugin view configuration
   * 插件视图配置
   */
  view?: UserPluginView
}

// ============================================================================
// New Plugin API Types
// 新插件 API 类型
// ============================================================================

/**
 * Plugin metadata attached to component
 * 附加在组件上的插件元数据
 */
export interface DevToolsPluginMeta {
  /**
   * npm package name
   * npm 包名
   */
  packageName: string

  /**
   * Export name (e.g., 'default', 'MyPlugin')
   * 导出名称
   */
  exportName: string

  /**
   * Path to ESM bundle within the package
   * ESM bundle 在包内的路径
   */
  bundlePath: string
}

/**
 * Component with devtools metadata
 * 带有 devtools 元数据的组件
 */
export type DevToolsPluginComponent = ComponentType<any> & {
  __devtools_source__?: DevToolsPluginMeta
}

/**
 * Base plugin properties
 * 基础插件属性
 */
export interface BaseDevToolsPlugin {
  /**
   * Plugin unique identifier
   * 插件唯一标识符
   */
  id: string

  /**
   * Plugin display title
   * 插件显示标题
   */
  title: string

  /**
   * Plugin icon (Iconify format like 'ph:rocket' or SVG string)
   * 插件图标（Iconify 格式如 'ph:rocket' 或 SVG 字符串）
   */
  icon?: string
}

/**
 * Component type plugin - renders a React component
 * 组件类型插件 - 渲染 React 组件
 */
export interface ComponentPlugin extends BaseDevToolsPlugin {
  /**
   * Plugin type (optional, defaults to 'component')
   * 插件类型（可选，默认为 'component'）
   */
  type?: 'component'

  /**
   * Plugin renderer - supports:
   * - Component with __devtools_source__ metadata
   * - URL string: 'https://cdn.example.com/plugin.js'
   * - Local path: './dist/plugins/my-plugin.js'
   *
   * 插件渲染器 - 支持：
   * - 带 __devtools_source__ 元数据的组件
   * - URL 字符串
   * - 本地路径
   */
  renderer: DevToolsPluginComponent | string
}

/**
 * Iframe type plugin - embeds external application
 * iframe 类型插件 - 嵌入外部应用
 */
export interface IframePlugin extends BaseDevToolsPlugin {
  /**
   * Plugin type
   * 插件类型
   */
  type: 'iframe'

  /**
   * URL to embed in iframe
   * iframe 中嵌入的 URL
   */
  url: string
}

/**
 * DevTools Plugin (new API)
 * DevTools 插件（新 API）
 */
export type DevToolsPlugin = ComponentPlugin | IframePlugin

/**
 * User Plugin - supports both new and legacy formats
 * 用户插件 - 支持新旧两种格式
 */
export type UserPlugin = DevToolsPlugin | LegacyUserPlugin

// ============================================================================
// Serialized Plugin Types (for transmission to browser)
// 序列化插件类型（用于传输到浏览器）
// ============================================================================

/**
 * Serialized renderer metadata
 * 序列化的渲染器元数据
 */
export interface SerializedRendererMeta {
  packageName: string
  exportName: string
  bundlePath: string
}

/**
 * Serialized component plugin
 * 序列化的组件插件
 */
export interface SerializedComponentPlugin {
  id: string
  type: 'component'
  title: string
  icon?: string
  renderer: SerializedRendererMeta | string
}

/**
 * Serialized iframe plugin
 * 序列化的 iframe 插件
 */
export interface SerializedIframePlugin {
  id: string
  type: 'iframe'
  title: string
  icon?: string
  url: string
}

/**
 * Serialized plugin (for JSON transmission)
 * 序列化插件（用于 JSON 传输）
 */
export type SerializedPlugin = SerializedComponentPlugin | SerializedIframePlugin

/**
 * Plugin options interface
 * 插件配置接口
 */
export interface ReactDevToolsPluginOptions {
  /**
   * Custom plugins
   * 自定义插件
   */
  plugins?: UserPlugin[]

  /**
   * Insert overlay script by appending to files that match this filter.
   * When not provided, the script will be injected into index.html automatically.
   */
  appendTo?: string | RegExp

  /**
   * Enable DevTools in specific environments.
   * - When not provided (default), DevTools will be enabled in dev mode (`vite dev`) and disabled in build mode (`vite build`).
   * - When set to `true`, same as default behavior (enabled in serve, disabled in build).
   * - When set to `false`, DevTools will be disabled in all environments.
   * - When set to an array of environment names (e.g., `['development', 'test']`),
   *   DevTools will be enabled in those environments during build mode.
   * - Environment is determined by `process.env.NODE_ENV` or Vite's `--mode` flag.
   *
   * @example
   * // Default: enabled in dev mode, disabled in build mode
   * ReactDevTools()
   *
   * // Enable only in dev and test environments (including build mode)
   * ReactDevTools({ enabledEnvironments: ['development', 'test'] })
   *
   * // Disable in all environments
   * ReactDevTools({ enabledEnvironments: false })
   */
  enabledEnvironments?: EnabledEnvironments

  /**
   * Enable source code location injection into HTML attributes.
   * - When `true` (default in development), injects `data-source-path` attributes into JSX elements
   * - When `false`, disables HTML attribute injection (falls back to Fiber._debugSource only)
   * - Automatically disabled in production builds
   *
   * @default true in development, false in production
   *
   * @example
   * // Disable source code injection
   * ReactDevTools({ injectSource: false })
   *
   * // Enable source code injection (default)
   * ReactDevTools({ injectSource: true })
   */
  injectSource?: boolean

  /**
   * Configure the path format for source code location injection.
   * - 'absolute': Use absolute file paths (e.g., /Users/.../project/src/App.tsx)
   * - 'relative': Use relative paths including project folder name (e.g., project/src/App.tsx)
   * - Only applies when `injectSource` is enabled
   *
   * @default 'absolute'
   *
   * @example
   * // Use absolute paths (default)
   * ReactDevTools({ sourcePathMode: 'absolute' })
   *
   * // Use relative paths (shorter, better for monorepos)
   * ReactDevTools({ sourcePathMode: 'relative' })
   */
  sourcePathMode?: SourcePathMode

  /**
   * React Scan integration configuration
   *
   * @example
   * // Enable React Scan with default settings
   * ReactDevTools({ scan: { enabled: true } })
   *
   * // Enable with custom configuration
   * ReactDevTools({
   *   scan: {
   *     enabled: true,
   *     showToolbar: true,
   *     animationSpeed: 'fast',
   *   }
   * })
   */
  scan?: ScanConfig | boolean

  /**
   * Custom URL for the DevTools client panel.
   * This is useful for micro-fronted scenarios (like singleSpa) where the
   * DevTools server runs on a different port than the host application.
   *
   * @example
   * // For singleSpa where child app runs on port 8080
   * ReactDevTools({ clientUrl: 'http://localhost:8080/__react_devtools__/' })
   */
  clientUrl?: string

  /**
   * CSS selector for the root container of your React app.
   * This is useful for micro-fronted scenarios (like singleSpa) where multiple
   * React apps are running on the same page and you only want to inspect one.
   *
   * @example
   * // Only inspect the React app mounted to #my-app-root
   * ReactDevTools({ rootSelector: '#my-app-root' })
   *
   * // Or use a class selector
   * ReactDevTools({ rootSelector: '.my-app-container' })
   */
  rootSelector?: string

  /**
   * Micro-frontend mode configuration.
   * Controls how DevTools behaves in micro-frontend architectures.
   *
   * - 'auto' (default): Automatically detect if DevTools is already initialized.
   *   If another instance exists, skip initialization.
   * - 'host': This app is the host/parent app. Always initialize DevTools.
   *   Use this in the main shell application.
   * - 'child': This app is a child/sub app. Only initialize if no DevTools exists.
   *   Use this in micro-frontend sub-applications.
   * - 'standalone': Always initialize DevTools regardless of other instances.
   *   Useful for isolated development of child apps.
   *
   * @default 'auto'
   *
   * @example
   * // Host application (always show DevTools)
   * ReactDevTools({ microFrontend: 'host' })
   *
   * // Child application (defer to host if exists)
   * ReactDevTools({ microFrontend: 'child' })
   *
   * // Standalone development mode
   * ReactDevTools({ microFrontend: 'standalone' })
   */
  microFrontend?: 'auto' | 'host' | 'child' | 'standalone'

  /**
   * Theme configuration
   * 主题配置
   */
  theme?: {
    /**
     * Theme mode
     * @default 'auto'
     */
    mode?: 'auto' | 'light' | 'dark'
    /**
     * Primary color
     * @default 'react'
     */
    primaryColor?: string
  }

  /**
   * Assets panel configuration
   * Assets 面板配置
   */
  assets?: {
    /**
     * File extensions to show in the assets panel
     * When not provided, shows common static assets (images, fonts, etc.)
     * 在 assets 面板中显示的文件扩展名
     *
     * @example
     * // Only show images and videos
     * assets: { files: ['png', 'jpg', 'svg', 'mp4'] }
     *
     * // Show all supported types
     * assets: { files: ['png', 'jpg', 'svg', 'ico', 'gif', 'webp', 'mp4', 'mp3', 'woff2', 'json', 'md'] }
     */
    files?: string[]
  }

  /**
   * Configure which editor to open when clicking on source locations.
   * 配置点击源码位置时打开的编辑器
   *
   * @default 'vscode'
   *
   * @example
   * // Use VS Code (default)
   * ReactDevTools({ launchEditor: 'vscode' })
   *
   * // Use Cursor
   * ReactDevTools({ launchEditor: 'cursor' })
   *
   * // Use WebStorm
   * ReactDevTools({ launchEditor: 'webstorm' })
   *
   * // Other supported editors: 'sublime', 'atom', 'phpstorm', 'idea', 'pycharm', etc.
   */
  launchEditor?: string
}

/**
 * Resolved/normalized plugin configuration
 * 解析后的插件配置
 */
export interface ResolvedPluginConfig {
  plugins: SerializedPlugin[]
  appendTo: string | RegExp | undefined
  enabledEnvironments: EnabledEnvironments
  /**
   * Detected environment from mode and NODE_ENV
   * 从 mode 和 NODE_ENV 探测到的环境
   */
  detectedEnvironment: string
  injectSource: boolean
  sourcePathMode: SourcePathMode
  projectRoot: string
  mode: string
  command: 'build' | 'serve'
  isEnabled: boolean
  scan?: ScanConfig
  clientUrl?: string
  rootSelector?: string
  microFrontend?: 'auto' | 'host' | 'child' | 'standalone'
  theme?: {
    mode?: 'auto' | 'light' | 'dark'
    primaryColor?: string
  }
  assets?: {
    files?: string[]
  }
  launchEditor?: string
}

/**
 * Build tool context
 * 构建工具上下文
 */
export type BuildTool = 'vite' | 'webpack'

/**
 * Plugin context
 * 插件上下文
 */
export interface PluginContext {
  tool: BuildTool
  config: ResolvedPluginConfig
  reactDevtoolsPath: string
}
