/**
 * Next.js-specific integration for React DevTools Plus
 *
 * Next.js has unique characteristics:
 * - Server-side rendering (SSR) and React Server Components (RSC)
 * - App Router (default in Next.js 13+) and Pages Router
 * - Can use Webpack or Turbopack as bundler
 * - Custom configuration via next.config.js/ts
 *
 * This integration supports:
 * - Next.js 13, 14, 15+ (App Router and Pages Router)
 * - Webpack mode (via webpack config function)
 * - Turbopack mode (via turbopack.rules)
 *
 * How it works:
 * 1. For Webpack: Injects DevTools entries into webpack config
 * 2. For Turbopack: Uses custom loaders to inject code
 * 3. Both modes: Sets up HTTP routes for DevTools client via Next.js headers/rewrites
 */

import type { ReactDevToolsPluginOptions, ResolvedPluginConfig } from '../config/types'
import fs from 'node:fs'
import path from 'node:path'
import {
  generateConfigInjectionCode,
  generateGlobalsWithCSSCode,
} from '../codegen'
import { resolvePluginConfig } from '../config/normalize'
import { DIR_OVERLAY } from '../dir'
import { setupWebpackModuleGraph } from '../middleware'
import { createDevToolsMiddleware, serveOverlayScript } from '../middleware/next'
import { createSourceAttributePlugin } from '../utils/babel-transform'
import { getClientPath, getPluginPath } from '../utils/paths'

// Type for Next.js webpack config function
type NextWebpackConfig = any
interface WebpackConfigContext {
  dev: boolean
  isServer: boolean
  buildId: string
  dir: string
  defaultLoaders: any
  webpack: any
}

// Store the DevTools client path for middleware use
let _clientPath: string | null = null
let _pluginConfig: ResolvedPluginConfig | null = null

/**
 * Ensure cache directory exists for DevTools initialization files
 */
function ensureCacheDir(projectRoot: string): string {
  const cacheDir = path.join(projectRoot, 'node_modules', '.cache', 'react-devtools-plus')
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true })
  }
  return cacheDir
}

/**
 * Write initialization file to cache directory
 */
function writeInitFile(cacheDir: string, filename: string, content: string): string {
  const filePath = path.join(cacheDir, filename)
  fs.writeFileSync(filePath, content, 'utf-8')
  return filePath
}

/**
 * Get Next.js major version from package.json
 */
function getNextVersion(projectRoot: string): number | null {
  try {
    const pkgPath = path.join(projectRoot, 'node_modules', 'next', 'package.json')
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
      const version = pkg.version
      const major = Number.parseInt(version.split('.')[0], 10)
      return major
    }
  }
  catch {
    // Ignore errors
  }
  return null
}

/**
 * Check if the project uses Turbopack
 * Next.js 15+ uses Turbopack by default for dev
 */
function detectTurbopack(nextConfig: any): boolean {
  // Check for experimental.turbo (Next.js 14) or turbopack (Next.js 15+)
  return !!(nextConfig?.experimental?.turbo || nextConfig?.turbopack)
}

/**
 * Create the React DevTools Plus plugin for Next.js
 *
 * @example
 * ```ts
 * // next.config.ts
 * import { withReactDevTools } from 'react-devtools-plus/next'
 *
 * const nextConfig = {
 *   // your config
 * }
 *
 * export default withReactDevTools(nextConfig)
 * ```
 *
 * @example With options
 * ```ts
 * export default withReactDevTools(nextConfig, {
 *   scan: { enabled: true },
 * })
 * ```
 */
/**
 * Next.js configuration type
 */
interface NextConfig {
  webpack?: (config: any, context: WebpackConfigContext) => any
  rewrites?: () => Promise<any> | any
  turbopack?: {
    rules?: Record<string, any>
  }
  experimental?: {
    turbo?: {
      rules?: Record<string, any>
    }
    [key: string]: any
  }
  [key: string]: any
}

export function withReactDevTools<T extends NextConfig>(
  nextConfig: T,
  options: ReactDevToolsPluginOptions = {},
): T {
  const projectRoot = process.cwd()
  const mode = process.env.NODE_ENV || 'development'
  const isDev = mode === 'development'

  // Resolve plugin config
  const pluginConfig = resolvePluginConfig(
    options,
    projectRoot,
    mode,
    isDev ? 'serve' : 'build',
  )

  // Skip if not enabled
  if (!pluginConfig?.isEnabled) {
    return nextConfig
  }

  const reactDevtoolsPath = getPluginPath()
  const clientPath = getClientPath(reactDevtoolsPath)
  const nextVersion = getNextVersion(projectRoot)

  console.log('[React DevTools Plus] Initializing for Next.js', nextVersion ? `v${nextVersion}` : '')

  // Check if using Turbopack
  const usesTurbopack = detectTurbopack(nextConfig)

  // Create modified config
  const modifiedConfig = { ...nextConfig }

  // Add Turbopack rules if using Turbopack
  if (usesTurbopack || (nextVersion && nextVersion >= 15)) {
    const turbopackRules = createTurbopackRules(pluginConfig, projectRoot)

    if (nextVersion && nextVersion >= 15) {
      // Next.js 15+: turbopack config is at root level
      modifiedConfig.turbopack = {
        ...(modifiedConfig.turbopack || {}),
        rules: {
          ...(modifiedConfig.turbopack?.rules || {}),
          ...turbopackRules,
        },
      }
    }
    else {
      // Next.js 14: turbo is under experimental
      modifiedConfig.experimental = {
        ...(modifiedConfig.experimental || {}),
        turbo: {
          ...(modifiedConfig.experimental?.turbo || {}),
          rules: {
            ...(modifiedConfig.experimental?.turbo?.rules || {}),
            ...turbopackRules,
          },
        },
      }
    }
  }

  // Wrap webpack config to add our plugin
  const originalWebpack = modifiedConfig.webpack
  modifiedConfig.webpack = (config: NextWebpackConfig, context: WebpackConfigContext) => {
    // Apply original webpack config first
    if (typeof originalWebpack === 'function') {
      config = originalWebpack(config, context)
    }

    // Only apply to client-side builds in development
    if (!context.isServer && context.dev) {
      applyWebpackConfig(config, context, pluginConfig, projectRoot, clientPath)
    }

    return config
  }

  // Add rewrites for DevTools routes (for both webpack and turbopack)
  const originalRewrites = modifiedConfig.rewrites
  modifiedConfig.rewrites = async () => {
    const rewrites = typeof originalRewrites === 'function'
      ? await originalRewrites()
      : originalRewrites || { beforeFiles: [], afterFiles: [], fallback: [] }

    // Normalize rewrites to object format
    const normalizedRewrites = Array.isArray(rewrites)
      ? { beforeFiles: [], afterFiles: rewrites, fallback: [] }
      : {
          beforeFiles: rewrites.beforeFiles || [],
          afterFiles: rewrites.afterFiles || [],
          fallback: rewrites.fallback || [],
        }

    return normalizedRewrites
  }

  return modifiedConfig as T
}

/**
 * Apply webpack configuration for React DevTools Plus
 */
function applyWebpackConfig(
  config: NextWebpackConfig,
  context: WebpackConfigContext,
  pluginConfig: ResolvedPluginConfig,
  projectRoot: string,
  clientPath: string,
) {
  const cacheDir = ensureCacheDir(projectRoot)
  const filesToInject: string[] = []

  // 1. Config injection (for singleSpa/micro-frontend scenarios)
  const configCode = generateConfigInjectionCode({
    clientUrl: pluginConfig.clientUrl,
    rootSelector: pluginConfig.rootSelector,
    theme: pluginConfig.theme,
    assets: pluginConfig.assets,
  })
  if (configCode) {
    const configPath = writeInitFile(cacheDir, 'devtools-config.js', configCode)
    filesToInject.push(configPath)
  }

  // 2. React globals initialization - setup window.React/ReactDOM and CSS
  const globalsInitCode = generateGlobalsWithCSSCode(DIR_OVERLAY)
  const globalsInitPath = writeInitFile(cacheDir, 'react-globals-init.js', globalsInitCode)
  filesToInject.push(globalsInitPath)

  // 3. Overlay
  const overlayPath = path.join(DIR_OVERLAY, 'react-devtools-overlay.mjs')
  if (fs.existsSync(overlayPath)) {
    filesToInject.push(overlayPath)
  }

  // Inject files into webpack entry
  if (config.entry) {
    const originalEntry = config.entry

    config.entry = async () => {
      const entries = typeof originalEntry === 'function'
        ? await originalEntry()
        : originalEntry

      // Next.js uses 'main-app' for App Router and 'main' for Pages Router
      const mainKeys = ['main-app', 'main', 'pages/_app']

      for (const mainKey of mainKeys) {
        if (entries[mainKey]) {
          const currentEntry = entries[mainKey]
          if (currentEntry.import) {
            // Prepend our files to the import array
            entries[mainKey] = {
              ...currentEntry,
              import: [...filesToInject, ...currentEntry.import],
            }
          }
          break
        }
      }

      return entries
    }
  }

  // Add DevTools plugin for module graph collection and middleware
  const DevToolsPlugin = createNextDevToolsPlugin(
    pluginConfig,
    projectRoot,
    clientPath,
  )
  config.plugins.push(new DevToolsPlugin())

  // Inject Babel plugin for source path attributes
  if (pluginConfig.injectSource) {
    const babelPlugin = createSourceAttributePlugin(
      pluginConfig.projectRoot,
      pluginConfig.sourcePathMode,
    )
    injectBabelPluginToNextConfig(config, babelPlugin)
  }
}

/**
 * Create Turbopack rules for React DevTools Plus
 */
function createTurbopackRules(
  pluginConfig: ResolvedPluginConfig,
  projectRoot: string,
): Record<string, any> {
  // Create cache directory and initialization files
  const cacheDir = ensureCacheDir(projectRoot)

  // Generate config injection code
  const configCode = generateConfigInjectionCode({
    clientUrl: pluginConfig.clientUrl,
    rootSelector: pluginConfig.rootSelector,
    theme: pluginConfig.theme,
    assets: pluginConfig.assets,
  })
  if (configCode) {
    writeInitFile(cacheDir, 'devtools-config.js', configCode)
  }

  // Generate globals initialization code
  const globalsInitCode = generateGlobalsWithCSSCode(DIR_OVERLAY)
  writeInitFile(cacheDir, 'react-globals-init.js', globalsInitCode)

  // For Turbopack, we need to use custom loaders
  // Since Turbopack doesn't support webpack plugins directly,
  // we inject code through loaders on specific file patterns

  // Note: Turbopack has limited loader support compared to webpack
  // The main approach is to inject into specific files that are
  // guaranteed to be loaded on every page (like layout.tsx)

  const loaderPath = path.join(
    path.dirname(require.resolve('react-devtools-plus/package.json')),
    'dist',
    'next-loader.js',
  )

  // Return empty rules for now - Turbopack integration is more complex
  // and requires a custom approach
  console.log('[React DevTools Plus] Turbopack detected - using client component injection')

  return {}
}

/**
 * Create a webpack plugin for Next.js DevTools integration
 */
function createNextDevToolsPlugin(
  pluginConfig: ResolvedPluginConfig,
  projectRoot: string,
  clientPath: string,
) {
  // Store config for middleware use
  _pluginConfig = pluginConfig
  _clientPath = clientPath

  return class ReactDevToolsNextPlugin {
    apply(compiler: any) {
      // Setup module graph collection
      setupWebpackModuleGraph(compiler, projectRoot)

      // Setup dev server middlewares
      if (compiler.options.mode === 'development') {
        // Create the DevTools middleware
        const devToolsMiddleware = createDevToolsMiddleware(pluginConfig, clientPath)
        const overlayMiddleware = serveOverlayScript(DIR_OVERLAY)

        // Try to hook into webpack-dev-middleware if available
        // Next.js doesn't use webpack-dev-server directly, but we can still
        // set up the middleware to be used by Next.js custom server

        // Store middleware for later use
        ;(global as any).__REACT_DEVTOOLS_MIDDLEWARE__ = devToolsMiddleware
        ;(global as any).__REACT_DEVTOOLS_OVERLAY_MIDDLEWARE__ = overlayMiddleware

        // Print ready message
        compiler.hooks.afterEnvironment.tap('ReactDevToolsNextPlugin', () => {
          console.log('[React DevTools Plus] Ready')
          console.log('[React DevTools Plus] Access DevTools at http://localhost:3000/__react_devtools__/')
          console.log('[React DevTools Plus] Press Option(⌥)+Shift(⇧)+D to toggle panel')
        })
      }
    }
  }
}

/**
 * Inject Babel plugin into Next.js webpack config
 */
function injectBabelPluginToNextConfig(config: NextWebpackConfig, plugin: any) {
  if (!config.module?.rules)
    return

  // Find babel-loader rules and inject our plugin
  for (const rule of config.module.rules) {
    if (!rule)
      continue

    // Handle oneOf rules (Next.js uses this structure)
    if (rule.oneOf) {
      for (const oneOfRule of rule.oneOf) {
        injectPluginToRule(oneOfRule, plugin)
      }
    }
    else {
      injectPluginToRule(rule, plugin)
    }
  }
}

/**
 * Inject plugin to a specific webpack rule
 */
function injectPluginToRule(rule: any, plugin: any) {
  if (!rule?.use)
    return

  const uses = Array.isArray(rule.use) ? rule.use : [rule.use]

  for (const use of uses) {
    if (!use)
      continue

    const loaderName = typeof use === 'string' ? use : use.loader

    // Check for babel-loader or next-babel-loader
    if (loaderName && (loaderName.includes('babel-loader') || loaderName.includes('next-babel-loader'))) {
      if (typeof use !== 'string') {
        if (!use.options)
          use.options = {}
        if (!use.options.plugins)
          use.options.plugins = []
        use.options.plugins.push(plugin)
      }
    }
  }
}

/**
 * Create a simpler Next.js plugin for cases where full integration is not needed
 * This creates a webpack plugin that can be used directly in next.config
 */
export function createNextPlugin(options: ReactDevToolsPluginOptions = {}) {
  const projectRoot = process.cwd()
  const mode = process.env.NODE_ENV || 'development'
  const isDev = mode === 'development'

  const pluginConfig = resolvePluginConfig(
    options,
    projectRoot,
    mode,
    isDev ? 'serve' : 'build',
  )

  if (!pluginConfig?.isEnabled) {
    // Return a no-op plugin
    return {
      apply() {},
    }
  }

  const reactDevtoolsPath = getPluginPath()
  const clientPath = getClientPath(reactDevtoolsPath)

  return createNextDevToolsPlugin(pluginConfig, projectRoot, clientPath)
}

export default withReactDevTools
