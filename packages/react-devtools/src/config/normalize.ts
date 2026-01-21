/**
 * Configuration normalization and validation
 * 配置规范化和验证
 */

import type {
  DevToolsPlugin,
  DevToolsPluginInstance,
  LegacyUserPlugin,
  ReactDevToolsPluginOptions,
  ResolvedInstanceConfig,
  ResolvedPluginConfig,
  ScanConfig,
  SerializedPlugin,
  SerializedView,
  UserPlugin,
} from './types'
import path from 'node:path'

/**
 * Check if a value is a new plugin instance (callable function with __isDevToolsPlugin)
 * 检查值是否为新的插件实例（带 __isDevToolsPlugin 的可调用函数）
 */
function isPluginInstance(plugin: UserPlugin): plugin is DevToolsPluginInstance {
  return typeof plugin === 'function' && (plugin as any).__isDevToolsPlugin === true
}

/**
 * Check if a value is a resolved instance config (result of calling plugin factory)
 * 检查值是否为已解析的插件配置（调用插件工厂的结果）
 *
 * ResolvedInstanceConfig has view.type and view.src as object or string
 */
function isResolvedInstanceConfig(plugin: UserPlugin): plugin is ResolvedInstanceConfig {
  if (typeof plugin !== 'object' || plugin === null)
    return false
  const p = plugin as any
  // Must have name, title, view with type
  return typeof p.name === 'string'
    && typeof p.title === 'string'
    && p.view
    && typeof p.view.type === 'string'
    && (p.view.type === 'component' || p.view.type === 'iframe')
}

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
 *
 * Legacy format: { name, view: { title, icon, src } }
 * New format: { name, title, icon, view: { type?, src } }
 */
function isLegacyPlugin(plugin: UserPlugin): plugin is LegacyUserPlugin {
  // Legacy has view.title/view.icon/view.src, new API has top-level title
  return 'view' in plugin && plugin.view && 'title' in plugin.view
}

/**
 * Check if a URL is an external URL (http/https)
 * 检查 URL 是否是外部 URL
 */
function isExternalUrl(src: string): boolean {
  return src.startsWith('http://') || src.startsWith('https://')
}

/**
 * Resolve plugin path (handle package-relative paths)
 * 解析插件路径（处理包相对路径）
 */
function resolvePluginPath(src: string, projectRoot: string): string {
  // If it's a node_modules package path (e.g., '@my-org/plugin/src/host.ts')
  if (src.includes('/') && !src.startsWith('./') && !src.startsWith('../') && !path.isAbsolute(src)) {
    // This is a package path, resolve from node_modules
    try {
      const packageName = src.startsWith('@')
        ? src.split('/').slice(0, 2).join('/')
        : src.split('/')[0]
      const packagePath = require.resolve(`${packageName}/package.json`, { paths: [projectRoot] })
      const packageDir = path.dirname(packagePath)
      const relativePath = src.replace(packageName, '').replace(/^\//, '')
      return path.join(packageDir, relativePath)
    }
    catch {
      // If resolution fails, return as-is
      return src
    }
  }

  // Relative path
  if (src.startsWith('./') || src.startsWith('../')) {
    return path.resolve(projectRoot, src)
  }

  // Already absolute or other format
  return src
}

/**
 * Normalize a plugin instance (new callable API) to serialized format
 * 将插件实例（新的可调用 API）规范化为序列化格式
 */
function normalizePluginInstance(instance: DevToolsPluginInstance, projectRoot: string): SerializedPlugin {
  // Call the instance to get resolved config
  const resolved: ResolvedInstanceConfig = instance()

  // Process view
  let serializedView: SerializedView
  if (resolved.view.type === 'iframe') {
    serializedView = {
      type: 'iframe',
      src: resolved.view.src as string,
    }
  }
  else {
    // Component view
    if (typeof resolved.view.src === 'object') {
      // Package metadata
      serializedView = {
        type: 'component',
        src: resolved.view.src,
      }
    }
    else {
      // String path - resolve it
      serializedView = {
        type: 'component',
        src: resolvePluginPath(resolved.view.src, projectRoot),
      }
    }
  }

  // Build serialized plugin
  const serialized: SerializedPlugin = {
    name: resolved.name,
    title: resolved.title,
    icon: resolved.icon,
    view: serializedView,
  }

  // Add host config if present
  if (resolved.host) {
    serialized.host = {
      src: resolvePluginPath(resolved.host.src, projectRoot),
      inject: resolved.host.inject,
    }
  }

  // Add server config if present
  if (resolved.server?.middleware) {
    serialized.server = {
      middleware: resolvePluginPath(resolved.server.middleware, projectRoot),
    }
  }

  // Add options if present
  if (resolved.options) {
    serialized.options = resolved.options
  }

  return serialized
}

/**
 * Normalize a resolved instance config to serialized format
 * 将已解析的插件配置规范化为序列化格式
 */
function normalizeResolvedConfig(resolved: ResolvedInstanceConfig, projectRoot: string): SerializedPlugin {
  // Process view
  let serializedView: SerializedView
  if (resolved.view.type === 'iframe') {
    serializedView = {
      type: 'iframe',
      src: resolved.view.src as string,
    }
  }
  else {
    // Component view
    if (typeof resolved.view.src === 'object') {
      // Package metadata
      serializedView = {
        type: 'component',
        src: resolved.view.src,
      }
    }
    else {
      // String path - resolve it
      serializedView = {
        type: 'component',
        src: resolvePluginPath(resolved.view.src, projectRoot),
      }
    }
  }

  // Build serialized plugin
  const serialized: SerializedPlugin = {
    name: resolved.name,
    title: resolved.title,
    icon: resolved.icon,
    view: serializedView,
  }

  // Add host config if present
  if (resolved.host) {
    serialized.host = {
      src: resolvePluginPath(resolved.host.src, projectRoot),
      inject: resolved.host.inject,
    }
  }

  // Add server config if present
  if (resolved.server?.middleware) {
    serialized.server = {
      middleware: resolvePluginPath(resolved.server.middleware, projectRoot),
    }
  }

  // Add options if present
  if (resolved.options) {
    serialized.options = resolved.options
  }

  return serialized
}

/**
 * Normalize a single plugin to serialized format
 * 将单个插件规范化为序列化格式
 *
 * Handles:
 * - New callable API: SamplePlugin() - function with __isDevToolsPlugin
 * - Resolved config: SamplePlugin() result - object with view.type
 * - Object format: { name, title, icon, view: { type?, src } }
 * - Legacy format: { name, view: { title, icon, src } }
 */
export function normalizePlugin(plugin: UserPlugin, projectRoot: string): SerializedPlugin {
  // New callable API: SamplePlugin()
  if (isPluginInstance(plugin)) {
    return normalizePluginInstance(plugin, projectRoot)
  }

  // Resolved config: result of calling plugin factory like SamplePlugin()
  if (isResolvedInstanceConfig(plugin)) {
    return normalizeResolvedConfig(plugin, projectRoot)
  }

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
      name: legacyPlugin.name,
      title: legacyPlugin.view.title || legacyPlugin.name,
      icon: legacyPlugin.view.icon,
      view: {
        type: 'component',
        src,
      },
    }
  }

  // Object format: { name, title, icon, view: { type?, src } }
  const newPlugin = plugin as DevToolsPlugin

  // Validate view
  if (!newPlugin.view?.src) {
    throw new Error(
      `[React DevTools] Plugin "${newPlugin.name}" must have view.src defined.`,
    )
  }

  const { view } = newPlugin
  let serializedView: SerializedView

  // Determine view type
  const viewType = view.type || (
    typeof view.src === 'string' && isExternalUrl(view.src) ? 'iframe' : 'component'
  )

  if (viewType === 'iframe') {
    // Iframe view
    if (typeof view.src !== 'string') {
      throw new TypeError(
        `[React DevTools] Plugin "${newPlugin.name}" iframe view.src must be a URL string.`,
      )
    }
    serializedView = {
      type: 'iframe',
      src: view.src,
    }
  }
  else {
    // Component view
    if (typeof view.src === 'function') {
      // Component reference - extract metadata
      const meta = view.src.__devtools_source__
      if (!meta) {
        throw new Error(
          `[React DevTools] Plugin "${newPlugin.name}" view.src is a component without __devtools_source__ metadata. `
          + `Use defineDevToolsPlugin() to wrap your component.`,
        )
      }
      serializedView = {
        type: 'component',
        src: {
          packageName: meta.packageName,
          exportName: meta.exportName,
          bundlePath: meta.bundlePath,
        },
      }
    }
    else if (typeof view.src === 'object' && view.src !== null) {
      // Already resolved metadata object (from calling a plugin instance like SamplePlugin())
      const meta = view.src as { packageName: string, exportName: string, bundlePath: string }
      serializedView = {
        type: 'component',
        src: {
          packageName: meta.packageName,
          exportName: meta.exportName,
          bundlePath: meta.bundlePath,
        },
      }
    }
    else {
      // String format: local path
      let srcPath = view.src as string
      // Resolve relative paths to absolute
      if (srcPath.startsWith('./') || srcPath.startsWith('../')) {
        srcPath = path.resolve(projectRoot, srcPath)
      }
      serializedView = {
        type: 'component',
        src: srcPath,
      }
    }
  }

  return {
    name: newPlugin.name,
    title: newPlugin.title,
    icon: newPlugin.icon,
    view: serializedView,
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

  // Extract host plugins (plugins with host scripts)
  const hostPlugins = plugins
    .filter(p => p.host)
    .map(p => ({
      name: p.name,
      src: p.host!.src,
      inject: p.host!.inject,
      options: p.options,
    }))

  // Extract server plugins (plugins with server middleware)
  const serverPlugins = plugins
    .filter(p => p.server?.middleware)
    .map(p => ({
      name: p.name,
      middleware: p.server!.middleware!,
      options: p.options,
    }))

  return {
    plugins,
    hostPlugins,
    serverPlugins,
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
