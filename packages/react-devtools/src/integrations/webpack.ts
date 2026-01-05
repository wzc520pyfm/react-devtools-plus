/**
 * Webpack-specific integration logic
 *
 * This module handles Webpack 4/5 compatibility and webpack-dev-server 3/4+ compatibility.
 * Uses the compat layer for version detection and the codegen module for code generate.
 */

import type { ResolvedPluginConfig, SourcePathMode } from '../config/types'
import fs from 'node:fs'
import path from 'node:path'
import { generateConfigInjectionCode, generateGlobalsWithCSSCode } from '../codegen'
import {
  DevServerMiddlewareAdapter,
  isDevServerV3,
  isWebpack4,
} from '../compat'
import { createAssetsMiddleware, createGraphMiddleware, createOpenInEditorMiddleware, createPluginFileMiddleware, createPluginsMiddleware, getWebpackModuleGraph, serveClient, setupWebpackModuleGraph } from '../middleware'
import { createSourceAttributePlugin } from '../utils/babel-transform'

type Compiler = any

/**
 * Setup Webpack dev server middlewares
 * 设置 Webpack 开发服务器中间件
 *
 * Automatically detects webpack-dev-server version and applies middlewares accordingly.
 */
export function setupWebpackDevServerMiddlewares(
  compiler: Compiler,
  config: ResolvedPluginConfig,
  clientPath: string,
) {
  if (!compiler.options.devServer) {
    compiler.options.devServer = {}
  }

  const devServerOptions = compiler.options.devServer as any

  // Setup webpack module graph collection
  setupWebpackModuleGraph(compiler, config.projectRoot)

  // Define middlewares to be applied
  // ORDER MATTERS! Specific API routes must come before the client static file serving
  // because the client middleware (sirv) handles SPA fallback (returns index.html for 404s)
  // which would shadow our API routes if placed earlier.
  const middlewares = [
    {
      name: 'react-devtools-plugins-manifest',
      // Mount globally so middleware handles path matching (same as Vite)
      middleware: createPluginsMiddleware(config, (filePath) => {
        // Map absolute file path to /__react_devtools__/file?path=...
        // Use encodeURIComponent to handle special characters in path
        return `/__react_devtools__/file?path=${encodeURIComponent(filePath)}`
      }),
    },
    {
      name: 'react-devtools-plugin-file',
      // Mount globally to debug why path matching fails.
      // The middleware itself handles path checking.
      middleware: createPluginFileMiddleware(),
    },
    {
      name: 'react-devtools-graph',
      // Graph middleware for module dependency visualization (must be before client serving)
      middleware: createGraphMiddleware(
        getWebpackModuleGraph(),
        '/',
      ),
    },
    {
      name: 'react-devtools-open-in-editor',
      // Mount globally so middleware handles path matching for /__open-in-editor
      middleware: createOpenInEditorMiddleware(
        config.projectRoot,
        config.sourcePathMode,
        config.launchEditor,
      ),
    },
    {
      name: 'react-devtools-assets',
      // Mount globally for assets API
      middleware: createAssetsMiddleware({
        root: config.projectRoot,
        publicDir: 'public',
        baseUrl: '/',
      }),
    },
    {
      name: 'react-devtools-client',
      path: '/__react_devtools__',
      middleware: serveClient(clientPath),
    },
  ]

  // Apply middlewares using adapter
  DevServerMiddlewareAdapter.apply(devServerOptions, compiler, middlewares)
}

/**
 * Get Webpack mode and command
 * 获取 Webpack 模式和命令
 *
 * Priority for mode detection:
 * 1. Webpack compiler.options.mode (explicit configuration)
 * 2. NODE_ENV environment variable (commonly used in Node.js ecosystem)
 * 3. Default to 'development'
 */
export function getWebpackModeAndCommand(compiler: Compiler): {
  mode: string
  command: 'build' | 'serve'
} {
  // Consider both webpack mode and NODE_ENV for environment detection
  const mode = compiler.options.mode || process.env.NODE_ENV || 'development'
  // Webpack doesn't have a clear "serve" vs "build" distinction like Vite
  // We'll infer it from the presence of devServer config OR development mode
  // This is needed for frameworks like Umi that have their own dev server
  const command = (compiler.options.devServer || mode === 'development') ? 'serve' : 'build'

  return { mode, command }
}

/**
 * Get Webpack project root (context)
 */
export function getWebpackContext(compiler: Compiler): string {
  return compiler.context || process.cwd()
}

/**
 * Create cache directory for DevTools initialization files
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
 * Inject all DevTools entries to Webpack
 *
 * Injection order (critical for proper functioning):
 * 1. React Scan init (must be before React runs)
 * 2. React globals init (setup window.React/ReactDOM)
 * 3. Overlay
 * 4. User's app entry
 */
export function injectDevToolsEntries(
  compiler: Compiler,
  overlayPath: string,
  projectRoot: string,
  overlayDir: string,
  scanInitCode?: string,
  clientUrl?: string,
  rootSelector?: string,
  theme?: { mode?: 'auto' | 'light' | 'dark', primaryColor?: string },
  assets?: { files?: string[] },
  launchEditor?: string,
) {
  const cacheDir = ensureCacheDir(projectRoot)
  const filesToInject: string[] = []

  // 1. Config injection (for singleSpa/micro-frontend scenarios)
  const configCode = generateConfigInjectionCode({ clientUrl, rootSelector, theme, assets, launchEditor })
  if (configCode) {
    const configPath = writeInitFile(cacheDir, 'devtools-config.js', configCode)
    filesToInject.push(configPath)
  }

  // 2. React Scan init (if enabled) - MUST be first, before React runs
  if (scanInitCode) {
    const scanInitPath = writeInitFile(cacheDir, 'scan-init.js', scanInitCode)
    filesToInject.push(scanInitPath)
  }

  // 3. React globals initialization - setup window.React/ReactDOM and CSS
  const globalsInitCode = generateGlobalsWithCSSCode(overlayDir)
  const globalsInitPath = writeInitFile(cacheDir, 'react-globals-init.js', globalsInitCode)
  filesToInject.push(globalsInitPath)

  // 4. Overlay
  filesToInject.push(overlayPath)

  // Modify webpack entry
  const originalEntry = compiler.options.entry
  const useWebpack4Format = isWebpack4(compiler)

  if (useWebpack4Format) {
    // Webpack 4: Don't use async function, resolve entry synchronously or use callback
    if (typeof originalEntry === 'function') {
      // If original entry is a function, wrap it
      compiler.options.entry = () => {
        const result = originalEntry()
        // Handle both sync and Promise results
        if (result && typeof result.then === 'function') {
          return result.then((entries: any) => {
            return transformEntries(entries, filesToInject, true)
          })
        }
        return transformEntries(result, filesToInject, true)
      }
    }
    else {
      // If original entry is not a function, transform it directly
      compiler.options.entry = transformEntries(originalEntry, filesToInject, true)
    }
  }
  else {
    // Webpack 5: Can use async function
    compiler.options.entry = async () => {
      const entries = typeof originalEntry === 'function'
        ? await originalEntry()
        : originalEntry

      return transformEntries(entries, filesToInject, false)
    }
  }
}

/**
 * Transform webpack entries to inject DevTools files
 */
function transformEntries(
  entries: any,
  filesToInject: string[],
  useWebpack4Format: boolean,
): any {
  // Handle string entry
  if (typeof entries === 'string') {
    if (useWebpack4Format) {
      // Webpack 4: Return array directly (not wrapped in object)
      return [...filesToInject, entries]
    }
    else {
      // Webpack 5: Return object with import array
      return {
        main: { import: [...filesToInject, entries] },
      }
    }
  }

  // Handle array entry
  if (Array.isArray(entries)) {
    if (useWebpack4Format) {
      // Webpack 4: Return array directly
      return [...filesToInject, ...entries]
    }
    else {
      // Webpack 5: Return object with import array
      return {
        main: { import: [...filesToInject, ...entries] },
      }
    }
  }

  // Handle object entry
  if (typeof entries === 'object' && entries !== null) {
    return transformObjectEntries(entries, filesToInject, useWebpack4Format)
  }

  return entries
}

/**
 * Transform object-style webpack entries
 */
function transformObjectEntries(
  entries: Record<string, any>,
  filesToInject: string[],
  useWebpack4Format: boolean,
): Record<string, any> {
  const newEntries = { ...entries }
  const keys = Object.keys(newEntries)
  const mainKey = keys.find(k => k === 'main' || k === 'app' || k === 'index') || keys[0]

  if (!mainKey) {
    return newEntries
  }

  const currentEntry = newEntries[mainKey]

  if (useWebpack4Format) {
    // Webpack 4: entries can be string or array
    newEntries[mainKey] = transformWebpack4Entry(currentEntry, filesToInject)
  }
  else {
    // Webpack 5: entries can be string or array, or descriptor object
    newEntries[mainKey] = transformWebpack5Entry(currentEntry, filesToInject)
  }

  return newEntries
}

/**
 * Transform entry for Webpack 4 format
 */
function transformWebpack4Entry(currentEntry: any, filesToInject: string[]): string[] {
  if (typeof currentEntry === 'string') {
    return [...filesToInject, currentEntry]
  }
  if (Array.isArray(currentEntry)) {
    return [...filesToInject, ...currentEntry]
  }
  return filesToInject
}

/**
 * Transform entry for Webpack 5 format
 */
function transformWebpack5Entry(
  currentEntry: any,
  filesToInject: string[],
): { import: string[], [key: string]: any } {
  let importFiles: string[] = []
  let descriptor: Record<string, any> = {}

  if (typeof currentEntry === 'string') {
    importFiles = [currentEntry]
  }
  else if (Array.isArray(currentEntry)) {
    importFiles = [...currentEntry]
  }
  else if (typeof currentEntry === 'object' && currentEntry?.import) {
    importFiles = Array.isArray(currentEntry.import)
      ? [...currentEntry.import]
      : [currentEntry.import]
    descriptor = currentEntry
  }

  // Prepend injected files
  importFiles.unshift(...filesToInject)

  return {
    ...descriptor,
    import: importFiles,
  }
}

/**
 * Inject Babel plugin to Webpack config
 */
export function injectBabelPlugin(
  compiler: Compiler,
  projectRoot: string,
  sourcePathMode: SourcePathMode,
) {
  const rules = compiler.options.module?.rules
  if (!rules) {
    return
  }

  const plugin = createSourceAttributePlugin(projectRoot, sourcePathMode)
  rules.forEach(rule => visitRuleAndInjectPlugin(rule, plugin))
}

/**
 * Recursively visit webpack rules and inject Babel plugin
 */
function visitRuleAndInjectPlugin(rule: any, plugin: any) {
  // Handle oneOf rules
  if (rule.oneOf) {
    rule.oneOf.forEach((r: any) => visitRuleAndInjectPlugin(r, plugin))
    return
  }

  // Handle rule.use (array or object)
  if (rule.use) {
    const uses = Array.isArray(rule.use) ? rule.use : [rule.use]
    uses.forEach((use: any) => injectPluginToLoader(use, plugin))
  }

  // Handle rule.loader (shortcut)
  if (rule.loader && rule.loader.includes('babel-loader')) {
    injectPluginToOptions(rule, plugin)
  }
}

/**
 * Inject plugin to a loader configuration
 */
function injectPluginToLoader(use: any, plugin: any) {
  const loaderName = typeof use === 'string' ? use : use.loader
  if (loaderName && loaderName.includes('babel-loader') && typeof use !== 'string') {
    injectPluginToOptions(use, plugin)
  }
}

/**
 * Inject plugin to babel options
 */
function injectPluginToOptions(config: any, plugin: any) {
  if (!config.options) {
    config.options = {}
  }
  if (!config.options.plugins) {
    config.options.plugins = []
  }
  config.options.plugins.push(plugin)
}

export { isDevServerV3, isWebpack4 }
