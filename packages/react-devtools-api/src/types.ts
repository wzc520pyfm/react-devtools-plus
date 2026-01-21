/**
 * Type definitions for React DevTools Plus Plugin API
 * React DevTools Plus 插件 API 类型定义
 */

import type { ComponentType, FC } from 'react'

// ============================================================================
// Theme Types
// 主题类型
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

// ============================================================================
// Component Tree Types
// 组件树类型
// ============================================================================

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

// ============================================================================
// Plugin Props Types
// 插件 Props 类型
// ============================================================================

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
// Plugin Definition Types (New API)
// 插件定义类型（新 API）
// ============================================================================

/**
 * Plugin metadata
 * 插件元数据
 */
export interface PluginMeta {
  /** Plugin unique identifier / 插件唯一标识 */
  name: string
  /** Plugin display title / 插件显示标题 */
  title: string
  /** Plugin icon (Iconify format) / 插件图标（Iconify 格式） */
  icon?: string
  /** npm package name (for bundled plugins) / npm 包名（用于打包插件） */
  packageName?: string
  /**
   * Export name of the plugin factory from the module
   * 模块中插件工厂的导出名
   * @deprecated Use viewExportName for specifying the view component export
   */
  exportName?: string
  /**
   * Export name of the view component from the module
   * 视图组件在模块中的导出名
   *
   * This should be the name of the React component export, not the plugin factory.
   * If not provided, falls back to exportName (for backward compatibility).
   *
   * @example
   * // In your plugin package:
   * export const MyPanel = (props) => <div>...</div>  // viewExportName: 'MyPanel'
   * export default MyPanel                            // viewExportName: 'default'
   */
  viewExportName?: string
  /** Path to ESM bundle / ESM bundle 路径 */
  bundlePath?: string
}

/**
 * Plugin view configuration
 * 插件视图配置
 */
export interface PluginViewConfig {
  /**
   * View type (auto-detected if not provided)
   * 视图类型（如果未提供则自动检测）
   */
  type?: 'component' | 'iframe'
  /**
   * View source
   * - React Component
   * - Local path: './src/Panel.tsx'
   * - iframe URL: 'https://...'
   *
   * 视图源
   * - React 组件
   * - 本地路径
   * - iframe URL
   */
  src: ComponentType<DevToolsPluginProps> | string
}

/**
 * Simple injection position
 * 简单注入位置
 */
export type SimpleInjectPosition = 'head' | 'head-prepend' | 'body' | 'body-prepend' | 'idle'

/**
 * Injection function for custom positioning
 * 自定义定位的注入函数
 *
 * Receives the HTML string and the content to inject (script tag, importmap, etc.)
 * Returns the modified HTML string
 *
 * @param html - The original HTML string
 * @param content - The content to inject (e.g., `<script src="..."></script>`)
 * @returns The modified HTML string with content injected
 *
 * @example
 * ```typescript
 * // Inject after a specific script
 * inject: (html, content) => {
 *   return html.replace(
 *     /(<script[^>]*src="[^"]*react[^"]*"[^>]*><\/script>)/i,
 *     `$1\n${content}`
 *   )
 * }
 *
 * // Inject before importmap
 * inject: (html, content) => {
 *   return html.replace(
 *     /(<script[^>]*type="importmap")/i,
 *     `${content}\n$1`
 *   )
 * }
 * ```
 */
export type InjectFunction = (html: string, content: string) => string

/**
 * Injection position - can be simple string or custom function
 * 注入位置 - 可以是简单字符串或自定义函数
 *
 * Simple positions (backward compatible):
 * - 'head': Inject at end of <head>
 * - 'head-prepend': Inject at start of <head> (earliest execution)
 * - 'body': Inject at end of <body>
 * - 'body-prepend': Inject at start of <body>
 * - 'idle': Inject with requestIdleCallback
 *
 * Custom function for precise control:
 * - Receives (html: string, content: string) and returns modified HTML
 */
export type InjectPosition = SimpleInjectPosition | InjectFunction

// ============================================================================
// HTML Inject Types (for importmap, link, meta, etc.)
// HTML 注入类型（用于 importmap、link、meta 等）
// ============================================================================

/**
 * HTML content injection configuration
 * HTML 内容注入配置
 *
 * Allows injecting arbitrary HTML content like importmap, link, meta, style, etc.
 * 允许注入任意 HTML 内容，如 importmap、link、meta、style 等。
 *
 * @example
 * ```typescript
 * // Inject an importmap
 * {
 *   tag: 'script',
 *   attrs: { type: 'importmap' },
 *   children: JSON.stringify({ imports: { 'lodash': '/lodash.js' } }),
 *   inject: 'head-prepend'
 * }
 *
 * // Inject a stylesheet link
 * {
 *   tag: 'link',
 *   attrs: { rel: 'stylesheet', href: '/my-plugin.css' },
 *   inject: 'head'
 * }
 *
 * // Inject using custom function
 * {
 *   tag: 'meta',
 *   attrs: { name: 'my-plugin', content: 'v1.0' },
 *   inject: (html, content) => html.replace('</head>', `${content}\n</head>`)
 * }
 * ```
 */
export interface HtmlInjectConfig {
  /**
   * HTML tag name
   * HTML 标签名
   *
   * @example 'script', 'link', 'meta', 'style'
   */
  tag: string

  /**
   * Tag attributes
   * 标签属性
   *
   * @example { type: 'importmap' }, { rel: 'stylesheet', href: '/style.css' }
   */
  attrs?: Record<string, string | boolean>

  /**
   * Tag inner content (for non-self-closing tags)
   * 标签内部内容（用于非自闭合标签）
   *
   * @example JSON.stringify({ imports: {...} }) for importmap
   */
  children?: string

  /**
   * Injection position - simple string or custom function
   * 注入位置 - 简单字符串或自定义函数
   *
   * @default 'head'
   */
  inject?: InjectPosition
}

// Keep for internal use and backward compatibility
/**
 * Advanced injection configuration (internal normalized format)
 * @internal
 */
export interface AdvancedInjectConfig {
  target: 'head' | 'body'
  position?: 'before' | 'after' | 'prepend' | 'append'
  selector?: string
  selectLast?: boolean
  idle?: boolean
  fallback?: 'prepend' | 'append'
}

/**
 * Plugin host script configuration
 * 插件宿主脚本配置
 *
 * Host scripts run in the host application's main thread
 * 宿主脚本运行在宿主应用的主线程中
 */
export interface PluginHostConfig {
  /**
   * Host script path (relative to plugin package)
   * 宿主脚本路径（相对于插件包）
   *
   * @example './src/host.ts'
   */
  src: string
  /**
   * Injection position and timing
   * 注入位置和时机
   *
   * Simple values (backward compatible):
   * - 'head': Inject at end of <head>
   * - 'head-prepend': Inject at start of <head> (earliest, good for network interception)
   * - 'body': Inject at end of <body> (good for DOM manipulation)
   * - 'body-prepend': Inject at start of <body>
   * - 'idle': Inject during requestIdleCallback
   *
   * Advanced configuration for precise control:
   * ```typescript
   * inject: {
   *   target: 'head',
   *   position: 'after',
   *   selector: 'script[src*="react"]'
   * }
   * ```
   *
   * @default 'head'
   */
  inject?: InjectPosition
}

/**
 * Plugin server configuration
 * 插件服务端配置
 *
 * Server middleware runs in Vite/Webpack Dev Server
 * 服务端中间件运行在 Vite/Webpack Dev Server 中
 */
export interface PluginServerConfig {
  /**
   * Middleware path (relative to plugin package)
   * 中间件路径（相对于插件包）
   *
   * Should export a Connect-style middleware function
   *
   * @example './src/server.ts'
   */
  middleware?: string
}

/**
 * Full plugin definition configuration
 * 完整的插件定义配置
 */
export interface DefinePluginConfig<TOptions = Record<string, any>> {
  /** Plugin metadata / 插件元数据 */
  meta: PluginMeta
  /** View configuration / 视图配置 */
  view: PluginViewConfig
  /** Host script configuration (optional) / 宿主脚本配置（可选） */
  host?: PluginHostConfig
  /** Server configuration (optional) / 服务端配置（可选） */
  server?: PluginServerConfig
  /**
   * Additional HTML content to inject (importmap, link, meta, style, etc.)
   * 额外的 HTML 内容注入（importmap、link、meta、style 等）
   *
   * @example
   * ```typescript
   * htmlInject: [
   *   // Inject importmap
   *   {
   *     tag: 'script',
   *     attrs: { type: 'importmap' },
   *     children: JSON.stringify({ imports: { 'lodash': '/lodash.js' } }),
   *     inject: 'head-prepend'
   *   },
   *   // Inject stylesheet
   *   {
   *     tag: 'link',
   *     attrs: { rel: 'stylesheet', href: '/plugin.css' },
   *     inject: 'head'
   *   }
   * ]
   * ```
   */
  htmlInject?: HtmlInjectConfig[]
  /**
   * Default options / 默认选项
   * Will be merged with user-provided options
   */
  defaultOptions?: TOptions
}

/**
 * Resolved plugin configuration (internal use)
 * 解析后的插件配置（内部使用）
 */
/**
 * Normalized inject config (internal format)
 * 规范化的注入配置（内部格式）
 */
export interface NormalizedInjectConfig {
  /** Target container */
  target: 'head' | 'body'
  /** Position within target */
  position: 'before' | 'after' | 'prepend' | 'append'
  /** CSS selector (deprecated, prefer injectFn) */
  selector?: string
  /** Use last match if multiple */
  selectLast?: boolean
  /** Use requestIdleCallback */
  idle?: boolean
  /** Fallback position */
  fallback: 'prepend' | 'append'
  /** Custom injection function (takes precedence over other options) */
  injectFn?: InjectFunction
}

export interface ResolvedPluginConfig {
  name: string
  title: string
  icon?: string
  view: {
    type: 'component' | 'iframe'
    src: string | {
      packageName: string
      exportName: string
      bundlePath: string
    }
  }
  host?: {
    src: string
    /**
     * Injection position (simple or function)
     * Will be normalized to injectConfig by the plugin system
     */
    inject?: InjectPosition
    /**
     * Normalized inject configuration (computed by plugin system)
     * @internal
     */
    injectConfig?: NormalizedInjectConfig
  }
  server?: {
    middleware?: string
  }
  /** HTML content to inject (importmap, link, meta, etc.) */
  htmlInject?: HtmlInjectConfig[]
  options?: Record<string, any>
}

/**
 * Plugin instance (returned by defineDevToolsPlugin)
 * 插件实例（由 defineDevToolsPlugin 返回）
 */
export interface DevToolsPluginInstance<TOptions = Record<string, any>> {
  /** Plugin marker / 插件标记 */
  __isDevToolsPlugin: true
  /** Plugin name for identification / 插件名称用于标识 */
  __pluginName: string
  /** Get resolved config without options / 无选项获取解析后的配置 */
  (): ResolvedPluginConfig
  /** Get resolved config with options / 带选项获取解析后的配置 */
  (options: Partial<TOptions>): ResolvedPluginConfig
}

// ============================================================================
// Plugin Extend Config (for user customization)
// 插件扩展配置（用于用户自定义）
// ============================================================================

/**
 * Plugin extend configuration
 * 插件扩展配置
 *
 * Allows users to extend an existing plugin with custom overrides.
 * This is useful for:
 * - Avoiding name conflicts when using multiple instances of the same plugin
 * - Customizing the injection position of host scripts
 * - Overriding plugin title, icon, or other options
 *
 * 允许用户使用自定义覆盖来扩展现有插件。
 * 这对于以下场景很有用：
 * - 使用同一插件的多个实例时避免名称冲突
 * - 自定义宿主脚本的注入位置
 * - 覆盖插件标题、图标或其他选项
 *
 * @example
 * ```typescript
 * // Basic usage - override name to avoid conflicts
 * plugins: [
 *   { extend: SamplePlugin, name: 'sample-plugin-1' },
 *   { extend: SamplePlugin, name: 'sample-plugin-2' },
 * ]
 *
 * // Override host injection position
 * plugins: [
 *   {
 *     extend: NetworkPlugin,
 *     name: 'my-network',
 *     host: { inject: 'head-prepend' },
 *   },
 * ]
 *
 * // Full customization
 * plugins: [
 *   {
 *     extend: SamplePlugin,
 *     name: 'custom-sample',
 *     title: 'My Custom Plugin',
 *     icon: 'lucide:star',
 *     host: { inject: 'body' },
 *     options: { showDebug: true },
 *   },
 * ]
 * ```
 */
export interface PluginExtendConfig<TOptions = Record<string, any>> {
  /**
   * The base plugin to extend
   * 要扩展的基础插件
   *
   * This should be a plugin instance created by `defineDevToolsPlugin`.
   * You can pass it directly (not called) or call it with base options.
   *
   * @example
   * ```typescript
   * // Pass plugin instance directly
   * { extend: SamplePlugin, name: 'custom' }
   *
   * // Or call it with base options first
   * { extend: SamplePlugin({ debug: true }), name: 'custom' }
   * ```
   */
  extend: DevToolsPluginInstance<TOptions> | ResolvedPluginConfig

  /**
   * Override plugin name (identifier)
   * 覆盖插件名称（标识符）
   *
   * This is required when you need to use the same plugin multiple times
   * to avoid name conflicts.
   */
  name?: string

  /**
   * Override plugin display title
   * 覆盖插件显示标题
   */
  title?: string

  /**
   * Override plugin icon (Iconify format)
   * 覆盖插件图标（Iconify 格式）
   */
  icon?: string

  /**
   * Override host script configuration
   * 覆盖宿主脚本配置
   *
   * Only the properties you specify will be overridden.
   * For example, if you only set `inject`, the `src` will remain unchanged.
   */
  host?: {
    /**
     * Override injection position
     * 覆盖注入位置
     */
    inject?: InjectPosition
  }

  /**
   * Merge additional options with the plugin's default options
   * 将附加选项与插件的默认选项合并
   *
   * These options will be merged with any base options passed to `extend`.
   */
  options?: Partial<TOptions>
}

// ============================================================================
// Legacy API Types (for backward compatibility)
// 旧 API 类型（向后兼容）
// ============================================================================

/**
 * Legacy plugin metadata
 * 旧版插件元数据
 * @deprecated Use DefinePluginConfig instead
 */
export interface LegacyPluginMeta {
  /** npm package name / npm 包名 */
  packageName: string
  /** Export name from the module / 模块的导出名 */
  exportName: string
  /** Path to the ESM bundle within the package / 包内 ESM bundle 的路径 */
  bundlePath: string
}

/**
 * Legacy plugin component with metadata
 * 旧版带元数据的插件组件
 * @deprecated Use defineDevToolsPlugin with full config instead
 */
export type LegacyPluginComponent<T extends ComponentType<DevToolsPluginProps> = ComponentType<DevToolsPluginProps>>
  = T & { __devtools_source__?: LegacyPluginMeta }

// ============================================================================
// Host Plugin Types
// 宿主插件类型
// ============================================================================

/**
 * Host plugin configuration
 * 宿主插件配置
 */
export interface HostPluginConfig {
  /** Plugin name (must match meta.name) / 插件名称（必须与 meta.name 一致） */
  name: string

  /**
   * RPC methods exposed to View layer
   * 暴露给 View 层的 RPC 方法
   */
  rpc?: Record<string, (...args: any[]) => any | Promise<any>>

  /**
   * Plugin initialization
   * 插件初始化
   *
   * Can return a cleanup function that will be called when the plugin is unregistered.
   * 可以返回一个清理函数，在插件注销时调用。
   */
  setup?: (ctx: HostPluginContext) => void | (() => void) | Promise<void | (() => void)>

  /**
   * Plugin teardown
   * 插件卸载
   */
  teardown?: () => void
}

/**
 * Host plugin context
 * 宿主插件上下文
 */
export interface HostPluginContext {
  /**
   * Emit event to View layer
   * 向 View 层发送事件
   */
  emit: (eventName: string, data?: any) => void

  /**
   * Get plugin options (passed by user)
   * 获取插件选项（用户传入）
   */
  getOptions: <T = Record<string, any>>() => T

  /**
   * Network interceptor
   * 网络拦截器
   */
  network: NetworkInterceptor

  /**
   * DevTools capabilities
   * DevTools 能力
   */
  devtools: {
    /** Get current component tree / 获取当前组件树 */
    getTree: () => ComponentTreeNode | null
    /** Get currently selected node ID / 获取当前选中节点 ID */
    getSelectedNodeId: () => string | null
    /** Highlight a component / 高亮组件 */
    highlightNode: (fiberId: string) => void
    /** Hide highlight / 隐藏高亮 */
    hideHighlight: () => void
  }
}

// ============================================================================
// Network Interceptor Types
// 网络拦截器类型
// ============================================================================

/**
 * Network interceptor
 * 网络拦截器
 */
export interface NetworkInterceptor {
  /**
   * Intercept fetch requests
   * 拦截 fetch 请求
   */
  onFetch: (handler: FetchInterceptHandler) => () => void

  /**
   * Intercept XMLHttpRequest
   * 拦截 XMLHttpRequest
   */
  onXHR: (handler: XHRInterceptHandler) => () => void

  /**
   * Monitor resource loading (using PerformanceObserver)
   * 监控资源加载（使用 PerformanceObserver）
   */
  onResource: (handler: (entry: PerformanceResourceTiming) => void) => () => void
}

/**
 * Fetch intercept handler
 * Fetch 拦截处理器
 */
export interface FetchInterceptHandler {
  /**
   * Called before request is sent
   * 请求发送前调用
   *
   * @returns Modified request, mock response, or void
   */
  onRequest?: (request: Request) => Request | Response | void | Promise<Request | Response | void>

  /**
   * Called after response is received
   * 响应接收后调用
   *
   * @returns Modified response or void
   */
  onResponse?: (response: Response, request: Request) => Response | void | Promise<Response | void>

  /**
   * Called when request fails
   * 请求失败时调用
   */
  onError?: (error: Error, request: Request) => void
}

/**
 * XHR intercept handler
 * XHR 拦截处理器
 */
export interface XHRInterceptHandler {
  /**
   * Called when XHR.open() is called
   * 调用 XHR.open() 时触发
   */
  onOpen?: (method: string, url: string, xhr: XMLHttpRequest) => void

  /**
   * Called when XHR.send() is called
   * 调用 XHR.send() 时触发
   */
  onSend?: (body: any, xhr: XMLHttpRequest) => void

  /**
   * Called when XHR load event fires
   * XHR load 事件触发时调用
   */
  onLoad?: (xhr: XMLHttpRequest) => void

  /**
   * Called when XHR error event fires
   * XHR error 事件触发时调用
   */
  onError?: (xhr: XMLHttpRequest) => void
}

// ============================================================================
// Plugin RPC Types
// 插件 RPC 类型
// ============================================================================

/**
 * Plugin RPC client (used in View layer)
 * 插件 RPC 客户端（在 View 层使用）
 */
export interface PluginRpcClient {
  /**
   * Call RPC method registered in Host script
   * 调用 Host 脚本中注册的 RPC 方法
   */
  call: <T = any>(method: string, ...args: any[]) => Promise<T>

  /**
   * Listen to events emitted from Host script
   * 监听 Host 脚本发送的事件
   *
   * @returns Unsubscribe function
   */
  on: (eventName: string, handler: (data: any) => void) => () => void

  /**
   * Listen to event once
   * 一次性监听事件
   *
   * @returns Unsubscribe function
   */
  once: (eventName: string, handler: (data: any) => void) => () => void
}
