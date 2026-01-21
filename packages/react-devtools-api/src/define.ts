/**
 * Plugin Definition API
 * 插件定义 API
 */

import type { ComponentType } from 'react'
import type {
  DefinePluginConfig,
  DevToolsPluginInstance,
  DevToolsPluginProps,
  InjectPosition,
  LegacyPluginComponent,
  LegacyPluginMeta,
  PluginMeta,
  PluginViewConfig,
  ResolvedPluginConfig,
} from './types'

/**
 * Check if a string is an external URL
 * 检查字符串是否为外部 URL
 */
function isExternalUrl(src: string): boolean {
  return src.startsWith('http://') || src.startsWith('https://')
}

/**
 * Resolve plugin-relative path to full path
 * 解析插件相对路径为完整路径
 */
function resolvePluginPath(relativePath: string, packageName?: string): string {
  // If it's a relative path and we have a package name, prefix with package name
  if ((relativePath.startsWith('./') || relativePath.startsWith('../')) && packageName) {
    // Transform './src/host.ts' -> 'package-name/src/host.ts'
    return `${packageName}/${relativePath.replace(/^\.\//, '')}`
  }
  return relativePath
}

/**
 * Resolve view configuration
 * 解析视图配置
 */
function resolveViewConfig(
  view: PluginViewConfig,
  meta: PluginMeta,
): ResolvedPluginConfig['view'] {
  // iframe type
  if (view.type === 'iframe' || (typeof view.src === 'string' && isExternalUrl(view.src))) {
    return {
      type: 'iframe',
      src: view.src as string,
    }
  }

  // Component type (React component)
  if (typeof view.src === 'function') {
    // Bundled component - needs package metadata
    // Use viewExportName for the component export, fallback to exportName for backward compatibility
    const viewExportName = meta.viewExportName || meta.exportName
    if (!meta.packageName || !viewExportName || !meta.bundlePath) {
      throw new Error(
        `[${meta.name}] Bundled component requires packageName, viewExportName (or exportName), and bundlePath in meta`,
      )
    }
    return {
      type: 'component',
      src: {
        packageName: meta.packageName,
        exportName: viewExportName,
        bundlePath: meta.bundlePath,
      },
    }
  }

  // Local path (string)
  return {
    type: 'component',
    src: resolvePluginPath(view.src, meta.packageName),
  }
}

/**
 * Define a DevTools plugin (New API)
 * 定义 DevTools 插件（新 API）
 *
 * This is the recommended way to define plugins. It allows you to configure
 * all aspects of the plugin (view, host script, server middleware) in one place.
 *
 * @example
 * ```typescript
 * // Simple plugin (view only)
 * export const MyPlugin = defineDevToolsPlugin({
 *   meta: {
 *     name: 'my-plugin',
 *     title: 'My Plugin',
 *     icon: 'lucide:puzzle',
 *     packageName: '@my-org/devtools-plugin',
 *     exportName: 'MyPlugin',
 *     bundlePath: 'dist/index.mjs',
 *   },
 *   view: {
 *     src: MyPanel,
 *   },
 * })
 *
 * // Full plugin (view + host + server)
 * export const FullPlugin = defineDevToolsPlugin({
 *   meta: {
 *     name: 'full-plugin',
 *     title: 'Full Plugin',
 *     icon: 'lucide:layers',
 *     packageName: '@my-org/devtools-full-plugin',
 *     exportName: 'FullPlugin',
 *     bundlePath: 'dist/index.mjs',
 *   },
 *   view: {
 *     src: FullPanel,
 *   },
 *   host: {
 *     src: './src/host.ts',
 *     inject: 'head',
 *   },
 *   server: {
 *     middleware: './src/server.ts',
 *   },
 *   defaultOptions: {
 *     enabled: true,
 *   },
 * })
 *
 * // Usage in vite.config.ts:
 * plugins: [
 *   reactDevToolsPlus({
 *     plugins: [
 *       MyPlugin(),
 *       FullPlugin({ enabled: true }),
 *     ],
 *   }),
 * ]
 * ```
 */
export function defineDevToolsPlugin<TOptions extends Record<string, any> = Record<string, any>>(
  config: DefinePluginConfig<TOptions>,
): DevToolsPluginInstance<TOptions>

/**
 * Define a DevTools plugin (Legacy API - for backward compatibility)
 * 定义 DevTools 插件（旧 API - 向后兼容）
 *
 * @deprecated Use the new config-based API instead
 *
 * @example
 * ```typescript
 * // Legacy usage (still supported)
 * export const MyPlugin = defineDevToolsPlugin(MyPanel, {
 *   packageName: '@my-org/devtools-plugin',
 *   exportName: 'MyPlugin',
 *   bundlePath: 'dist/index.mjs',
 * })
 * ```
 */
export function defineDevToolsPlugin<T extends ComponentType<DevToolsPluginProps>>(
  component: T,
  meta?: LegacyPluginMeta,
): LegacyPluginComponent<T>

/**
 * Implementation
 */
export function defineDevToolsPlugin<TOptions extends Record<string, any> = Record<string, any>>(
  configOrComponent: DefinePluginConfig<TOptions> | ComponentType<DevToolsPluginProps>,
  legacyMeta?: LegacyPluginMeta,
): DevToolsPluginInstance<TOptions> | LegacyPluginComponent<any> {
  // Legacy API: defineDevToolsPlugin(Component, meta)
  if (typeof configOrComponent === 'function') {
    const component = configOrComponent as ComponentType<DevToolsPluginProps>
    return Object.assign(component, {
      __devtools_source__: legacyMeta,
    }) as LegacyPluginComponent<any>
  }

  // New API: defineDevToolsPlugin({ meta, view, host, server })
  const config = configOrComponent as DefinePluginConfig<TOptions>
  const { meta, view, host, server, defaultOptions } = config

  // Create plugin factory function
  const pluginFactory = (options?: Partial<TOptions>): ResolvedPluginConfig => {
    // Merge options with defaults
    const mergedOptions = defaultOptions || options
      ? { ...defaultOptions, ...options }
      : undefined

    // Resolve view configuration
    const resolvedView = resolveViewConfig(view, meta)

    // Resolve host configuration
    const resolvedHost = host
      ? {
          src: resolvePluginPath(host.src, meta.packageName),
          inject: host.inject || ('head' as InjectPosition),
        }
      : undefined

    // Resolve server configuration
    const resolvedServer = server
      ? {
          middleware: server.middleware
            ? resolvePluginPath(server.middleware, meta.packageName)
            : undefined,
        }
      : undefined

    return {
      name: meta.name,
      title: meta.title,
      icon: meta.icon,
      view: resolvedView,
      host: resolvedHost,
      server: resolvedServer,
      htmlInject: config.htmlInject,
      options: mergedOptions,
    }
  }

  // Mark as plugin instance
  const instance = pluginFactory as DevToolsPluginInstance<TOptions>
  instance.__isDevToolsPlugin = true
  instance.__pluginName = meta.name

  return instance
}

/**
 * Check if a value is a DevTools plugin instance
 * 检查值是否为 DevTools 插件实例
 */
export function isDevToolsPlugin(value: any): value is DevToolsPluginInstance {
  return typeof value === 'function' && value.__isDevToolsPlugin === true
}

/**
 * Check if a value is a legacy plugin component
 * 检查值是否为旧版插件组件
 */
export function isLegacyPluginComponent(value: any): value is LegacyPluginComponent {
  return typeof value === 'function' && '__devtools_source__' in value
}
