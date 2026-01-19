/**
 * Configuration normalization and validation
 * 配置规范化和验证
 */

import type {
  ComponentPlugin,
  IframePlugin,
  LegacyUserPlugin,
  ReactDevToolsPluginOptions,
  ResolvedPluginConfig,
  ScanConfig,
  SerializedPlugin,
  UserPlugin,
} from './types'
import path from 'node:path'

/**
 * Normalize base path
 * 规范化基础路径
 */
export function normalizeBasePath(base: string | undefined): string {
  if (!base || base === 'auto') {
    return '/'
  }
  let normalized = base
  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`
  }
  if (normalized !== '/' && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }
  return normalized
}

/**
 * Detect current environment from mode and NODE_ENV
 * 从 mode 和 NODE_ENV 探测当前环境
 *
 * Priority (from highest to lowest):
 * 优先级（从高到低）：
 * 1. mode parameter (from Vite/Webpack config or --mode flag)
 *    mode 参数（来自 Vite/Webpack 配置或 --mode 标志）
 * 2. NODE_ENV environment variable
 *    NODE_ENV 环境变量
 * 3. Default to 'development'
 *    默认为 'development'
 *
 * @param mode - Mode from build tool (Vite mode or Webpack mode)
 * @returns Detected environment name
 */
export function detectEnvironment(mode: string): string {
  // Priority: mode > NODE_ENV > 'development'
  // mode is already resolved from build tool, which considers NODE_ENV
  // mode 已经从构建工具解析，其中已考虑了 NODE_ENV
  if (mode && mode !== 'undefined') {
    return mode
  }

  // Fallback to NODE_ENV
  // 回退到 NODE_ENV
  const nodeEnv = process.env.NODE_ENV
  if (nodeEnv && nodeEnv !== 'undefined') {
    return nodeEnv
  }

  // Default to development
  // 默认为 development
  return 'development'
}

/**
 * Determine if DevTools should be enabled based on environment detection
 * 根据环境探测判断是否应该启用 DevTools
 *
 * @param enabledEnvironments - Configuration for enabled environments
 * @param mode - Mode from build tool
 * @param command - Command type ('build' or 'serve')
 * @returns Whether DevTools should be enabled
 */
export function shouldEnableDevTools(
  enabledEnvironments: ReactDevToolsPluginOptions['enabledEnvironments'],
  mode: string,
  command: 'build' | 'serve',
): boolean {
  // Environment variable override (highest priority)
  // 环境变量覆盖（最高优先级）
  if (process.env.VITE_REACT_DEVTOOLS_ENABLED !== undefined) {
    return process.env.VITE_REACT_DEVTOOLS_ENABLED === 'true'
  }

  // Detect current environment
  // 探测当前环境
  const detectedEnv = detectEnvironment(mode)

  // Explicit false: always disabled
  // 显式 false：总是禁用
  if (enabledEnvironments === false) {
    return false
  }

  // Array of environment names: check if detected environment is in the list
  // 环境名称数组：检查探测到的环境是否在列表中
  if (Array.isArray(enabledEnvironments)) {
    const isInList = enabledEnvironments.includes(detectedEnv)

    return isInList
  }

  // Explicit true or default (undefined): enabled only in serve mode
  // 显式 true 或默认值（undefined）：仅在 serve 模式启用
  return command === 'serve'
}

/**
 * Determine if source code injection should be enabled
 * 判断是否应该启用源码注入
 */
export function shouldInjectSource(
  injectSourceOption: boolean | undefined,
  mode: string,
  command: 'build' | 'serve',
): boolean {
  // If explicitly set, respect the user's choice
  if (injectSourceOption !== undefined) {
    return injectSourceOption
  }

  // Default: inject in development, not in production
  const nodeEnv = process.env.NODE_ENV || mode
  const isProduction = nodeEnv === 'production' || (command === 'build' && mode === 'production')

  return !isProduction
}

/**
 * Normalize scan configuration
 * 规范化 Scan 配置
 */
export function normalizeScanConfig(
  scan: ReactDevToolsPluginOptions['scan'],
  command: 'build' | 'serve',
): ScanConfig | undefined {
  // If scan is false or undefined, return undefined
  if (!scan) {
    return undefined
  }

  // If scan is true, use default configuration
  if (scan === true) {
    return {
      enabled: command === 'serve', // Only enable in dev mode by default
      showToolbar: true,
    }
  }

  // If scan is an object, merge with defaults
  return {
    enabled: scan.enabled ?? (command === 'serve'),
    showToolbar: scan.showToolbar ?? true,
    ...scan,
  }
}

/**
 * Check if a plugin is using the legacy format
 * 检查插件是否使用旧格式
 */
function isLegacyPlugin(plugin: UserPlugin): plugin is LegacyUserPlugin {
  return 'name' in plugin && !('id' in plugin)
}

/**
 * Check if a plugin is an iframe plugin
 * 检查插件是否是 iframe 类型
 */
function isIframePlugin(plugin: UserPlugin): plugin is IframePlugin {
  return 'type' in plugin && plugin.type === 'iframe'
}

/**
 * Normalize a single plugin to serialized format
 * 将单个插件规范化为序列化格式
 *
 * Handles:
 * - Legacy format (name + view.src)
 * - New component plugin (renderer as component or string)
 * - Iframe plugin
 */
export function normalizePlugin(plugin: UserPlugin, projectRoot: string): SerializedPlugin {
  // Legacy format: { name, view: { title, icon, src } }
  if (isLegacyPlugin(plugin)) {
    const legacyPlugin = plugin as LegacyUserPlugin
    if (!legacyPlugin.view?.src) {
      throw new Error(
        `[React DevTools] Legacy plugin "${legacyPlugin.name}" must have view.src defined.`,
      )
    }

    let src = legacyPlugin.view.src
    if (!path.isAbsolute(src)) {
      src = path.resolve(projectRoot, src)
    }

    return {
      id: legacyPlugin.name,
      type: 'component',
      title: legacyPlugin.view.title || legacyPlugin.name,
      icon: legacyPlugin.view.icon,
      renderer: src,
    }
  }

  // Iframe plugin: { type: 'iframe', url, ... }
  if (isIframePlugin(plugin)) {
    return {
      id: plugin.id,
      type: 'iframe',
      title: plugin.title,
      icon: plugin.icon,
      url: plugin.url,
    }
  }

  // Component plugin: { renderer, ... }
  const componentPlugin = plugin as ComponentPlugin

  // Validate that renderer is provided
  if (!componentPlugin.renderer) {
    throw new Error(
      `[React DevTools] Plugin "${componentPlugin.id}" must have a renderer defined.`,
    )
  }

  let rendererValue: SerializedPlugin extends { renderer: infer R } ? R : never

  if (typeof componentPlugin.renderer === 'function') {
    // Component reference - extract metadata
    const meta = componentPlugin.renderer.__devtools_source__
    if (!meta) {
      throw new Error(
        `[React DevTools] Plugin "${componentPlugin.id}" renderer is a component without __devtools_source__ metadata. `
        + `Use defineDevToolsPlugin() to wrap your component.`,
      )
    }
    rendererValue = {
      packageName: meta.packageName,
      exportName: meta.exportName,
      bundlePath: meta.bundlePath,
    }
  }
  else {
    // String format: URL or local path
    let rendererPath = componentPlugin.renderer
    // Resolve relative paths to absolute
    if (rendererPath.startsWith('./') || rendererPath.startsWith('../')) {
      rendererPath = path.resolve(projectRoot, rendererPath)
    }
    rendererValue = rendererPath
  }

  return {
    id: componentPlugin.id,
    type: 'component',
    title: componentPlugin.title,
    icon: componentPlugin.icon,
    renderer: rendererValue,
  }
}

/**
 * Resolve and normalize plugin configuration
 * 解析和规范化插件配置
 */
export function resolvePluginConfig(
  options: ReactDevToolsPluginOptions,
  projectRoot: string,
  mode: string,
  command: 'build' | 'serve',
): ResolvedPluginConfig {
  const enabledEnvironments = options.enabledEnvironments
  const injectSourceOption = options.injectSource
  const sourcePathMode = options.sourcePathMode || 'absolute'

  // Detect environment from mode and NODE_ENV
  // 从 mode 和 NODE_ENV 探测环境
  const detectedEnvironment = detectEnvironment(mode)

  const isEnabled = shouldEnableDevTools(enabledEnvironments, mode, command)
  const injectSource = shouldInjectSource(injectSourceOption, mode, command)
  const scan = normalizeScanConfig(options.scan, command)

  // Normalize plugins to serialized format
  const plugins = (options.plugins || []).map(plugin =>
    normalizePlugin(plugin, projectRoot),
  )

  return {
    plugins,
    appendTo: options.appendTo,
    enabledEnvironments: enabledEnvironments ?? true,
    detectedEnvironment,
    injectSource,
    sourcePathMode,
    projectRoot,
    mode,
    command,
    isEnabled,
    scan,
    clientUrl: options.clientUrl,
    rootSelector: options.rootSelector,
    microFrontend: options.microFrontend,
    theme: options.theme,
    assets: options.assets,
    launchEditor: options.launchEditor,
  }
}

/**
 * Validate plugin options
 * 验证插件配置
 */
export function validatePluginOptions(options: ReactDevToolsPluginOptions): void {
  // Validate sourcePathMode
  if (options.sourcePathMode && !['absolute', 'relative'].includes(options.sourcePathMode)) {
    throw new Error(`[React DevTools] Invalid sourcePathMode: ${options.sourcePathMode}. Must be 'absolute' or 'relative'.`)
  }

  // Validate enabledEnvironments
  if (options.enabledEnvironments !== undefined) {
    const { enabledEnvironments } = options
    if (
      typeof enabledEnvironments !== 'boolean'
      && !Array.isArray(enabledEnvironments)
    ) {
      throw new TypeError('[React DevTools] enabledEnvironments must be a boolean or an array of strings.')
    }
  }

  // Validate appendTo
  if (options.appendTo !== undefined) {
    if (typeof options.appendTo !== 'string' && !(options.appendTo instanceof RegExp)) {
      throw new TypeError('[React DevTools] appendTo must be a string or RegExp.')
    }
  }

  // Validate scan configuration
  if (options.scan !== undefined && typeof options.scan !== 'boolean' && typeof options.scan !== 'object') {
    throw new TypeError('[React DevTools] scan must be a boolean or an object.')
  }

  // Validate microFrontend configuration
  if (options.microFrontend !== undefined) {
    const validModes = ['auto', 'host', 'child', 'standalone']
    if (!validModes.includes(options.microFrontend)) {
      throw new TypeError(`[React DevTools] microFrontend must be one of: ${validModes.join(', ')}. Got: ${options.microFrontend}`)
    }
  }
}
