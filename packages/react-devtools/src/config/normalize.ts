/**
 * Configuration normalization and validation
 * 配置规范化和验证
 */

import type { ReactDevToolsPluginOptions, ResolvedPluginConfig, ScanConfig, UserPlugin } from './types'
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
 * Determine if DevTools should be enabled
 * 判断是否应该启用 DevTools
 */
export function shouldEnableDevTools(
  enabledEnvironments: ReactDevToolsPluginOptions['enabledEnvironments'],
  mode: string,
  command: 'build' | 'serve',
): boolean {
  // Environment variable override
  if (process.env.VITE_REACT_DEVTOOLS_ENABLED !== undefined) {
    return process.env.VITE_REACT_DEVTOOLS_ENABLED === 'true'
  }

  // Explicit true: enabled only in serve mode
  if (enabledEnvironments === true) {
    return command === 'serve'
  }

  // Explicit false: always disabled
  if (enabledEnvironments === false) {
    return false
  }

  // Array of environment names: check if current env is in the list
  if (Array.isArray(enabledEnvironments)) {
    const nodeEnv = process.env.NODE_ENV || mode
    return enabledEnvironments.includes(nodeEnv) || enabledEnvironments.includes(mode)
  }

  // Default: enabled only in serve mode
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

  const isEnabled = shouldEnableDevTools(enabledEnvironments, mode, command)
  const injectSource = shouldInjectSource(injectSourceOption, mode, command)
  const scan = normalizeScanConfig(options.scan, command)

  // Normalize plugins
  const plugins = (options.plugins || []).map((plugin): UserPlugin => {
    if (plugin.view && plugin.view.src) {
      let src = plugin.view.src
      if (!path.isAbsolute(src)) {
        src = path.resolve(projectRoot, src)
      }
      return {
        ...plugin,
        view: {
          ...plugin.view,
          src, // Resolved absolute path
        },
      }
    }
    return plugin
  })

  return {
    plugins,
    appendTo: options.appendTo,
    enabledEnvironments: enabledEnvironments ?? true,
    injectSource,
    sourcePathMode,
    projectRoot,
    mode,
    command,
    isEnabled,
    scan,
    clientUrl: options.clientUrl,
    rootSelector: options.rootSelector,
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
}
