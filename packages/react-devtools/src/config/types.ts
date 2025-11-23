/**
 * Plugin options type definitions
 * 插件配置类型定义
 */

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
 * Plugin options interface
 * 插件配置接口
 */
export interface ReactDevToolsPluginOptions {
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
}

/**
 * Resolved/normalized plugin configuration
 * 解析后的插件配置
 */
export interface ResolvedPluginConfig {
  appendTo: string | RegExp | undefined
  enabledEnvironments: EnabledEnvironments
  injectSource: boolean
  sourcePathMode: SourcePathMode
  projectRoot: string
  mode: string
  command: 'build' | 'serve'
  isEnabled: boolean
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
