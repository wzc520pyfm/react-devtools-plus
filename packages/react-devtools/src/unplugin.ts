/**
 * React DevTools Unplugin
 *
 * A modular implementation supporting both Vite and Webpack with:
 * - Webpack 4/5 compatibility
 * - webpack-dev-server 3/4+ compatibility
 * - React 17/18+ compatibility
 */

import type { UnpluginFactory } from 'unplugin'
import type { PreviewServer, ResolvedConfig, ViteDevServer } from 'vite'
import type { ReactDevToolsPluginOptions, ResolvedPluginConfig } from './config/types.js'
import fs from 'node:fs'
import path from 'node:path'
import { bold, cyan, green } from 'kolorist'
import { createUnplugin } from 'unplugin'
import {
  generateConfigScriptTag,
  generateCSSScriptTags,
  generateDevToolsHookScriptTag,
  generateOverlayLoaderCode,
  generateReactGlobalsESMCode,
  generateScanInitCJSCode,
  generateScanInitESMCode,
  generateScanScriptTag,
} from './codegen'
import {
  normalizeBasePath,
  resolvePluginConfig,
  validatePluginOptions,
} from './config/normalize.js'
import { DIR_OVERLAY } from './dir.js'
import {
  createOutputConfig,
  createRollupInput,
  findOverlayBundle,
  getViteModeAndCommand,
  setupDevServerMiddlewares,
  setupPreviewServerMiddlewares,
  updateHtmlWithOverlayPath,
} from './integrations/vite.js'
import {
  getWebpackContext,
  getWebpackModeAndCommand,
  injectBabelPlugin,
  injectDevToolsEntries,
  setupWebpackDevServerMiddlewares,
} from './integrations/webpack.js'
import { createPluginsMiddleware } from './middleware/plugins.js'
import { shouldProcessFile, transformSourceCode } from './utils/babel-transform.js'
import {
  DEVTOOLS_OPTIONS_ID,
  getClientPath,
  getPluginPath,
  OVERLAY_CHUNK_NAME,
  OVERLAY_ENTRY_ID,
  RESOLVED_OPTIONS_ID,
  resolveOverlayPath,
  VIRTUAL_PATH_PREFIX,
} from './utils/paths.js'

// Use 'any' for Compiler to support both Webpack 4 and 5 types
type Compiler = any

/**
 * Print DevTools URLs to console
 * 打印 DevTools URL到控制台
 */
function printDevToolsUrls(urls: string[]) {
  const panelShortcut = process.platform === 'darwin' ? 'Option(⌥)+Shift(⇧)+D' : 'Alt(⌥)+Shift(⇧)+D'
  const visibilityShortcut = process.platform === 'darwin' ? 'Option(⌥)+Shift(⇧)+R' : 'Alt(⌥)+Shift(⇧)+R'
  const colorUrl = (value: string) => cyan(value.replace(/:(\d+)\//, (_, port) => `:${bold(port)}/`))

  for (const url of urls) {
    const devtoolsUrl = url.endsWith('/') ? `${url}__react_devtools__/` : `${url}/__react_devtools__/`
    console.log(`  ${green('➜')}  ${bold('React DevTools')}: Open ${colorUrl(devtoolsUrl)} to view component tree`)
    console.log(`  ${green('➜')}  ${bold('React DevTools')}: Press ${cyan(panelShortcut)} to toggle panel, ${cyan(visibilityShortcut)} to show/hide overlay`)
  }
}

/**
 * Wrap Vite server's printUrls method
 * 包装 Vite 服务器的 printUrls 方法
 */
function wrapPrintUrls(server: ViteDevServer | PreviewServer) {
  const originalPrintUrls = server.printUrls
  server.printUrls = () => {
    originalPrintUrls()
    const urls = server.resolvedUrls
    if (urls) {
      printDevToolsUrls(urls.local)
    }
  }
}

/**
 * Exclude HTML files from Webpack unplugin processing
 * 从 Webpack unplugin 处理中排除 HTML 文件
 */
function excludeHtmlFromUnplugin(compiler: Compiler) {
  compiler.hooks.normalModuleFactory.tap('unplugin-react-devtools', (nmf: any) => {
    nmf.hooks.afterResolve.tap('unplugin-react-devtools', (data: any) => {
      if (data.resource && (data.resource.endsWith('.html') || data.resource.endsWith('.htm'))) {
        if (data.loaders && Array.isArray(data.loaders)) {
          data.loaders = data.loaders.filter((loader: any) => {
            const loaderPath = typeof loader === 'string'
              ? loader
              : (loader.loader || loader.path || loader.request || '')
            return !loaderPath.includes('unplugin')
          })
        }
      }
    })
  })
}

/**
 * Unplugin factory
 * Unplugin 工厂函数
 */
const unpluginFactory: UnpluginFactory<ReactDevToolsPluginOptions> = (options = {}) => {
  // Validate options
  validatePluginOptions(options)

  // Plugin state
  const reactDevtoolsPath = getPluginPath()
  let viteConfig: ResolvedConfig | undefined
  let pluginConfig: ResolvedPluginConfig | undefined
  let isWebpackContext = false

  return {
    name: 'unplugin-react-devtools',
    enforce: 'pre',

    // Include JSX/TSX files for transformation
    transformInclude(id) {
      if (id.endsWith('.html') || id.endsWith('.htm'))
        return false
      if (id.match(/\.[jt]sx$/))
        return true
      return false
    },

    loadInclude(id) {
      if (isWebpackContext)
        return false
      return true
    },

    // ============================================================
    // Vite Hooks
    // ============================================================
    vite: {
      apply(config, env) {
        const mode = env.mode || (config as any).mode || 'development'
        const command = env.command
        const tempConfig = resolvePluginConfig(options, process.cwd(), mode, command)
        return tempConfig.isEnabled
      },

      configResolved(resolved) {
        viteConfig = resolved
        const { mode, command } = getViteModeAndCommand(resolved)
        pluginConfig = resolvePluginConfig(
          options,
          resolved.root || process.cwd(),
          mode,
          command,
        )

        // Allow overlay directory in dev server
        if (resolved.server) {
          resolved.server.fs.allow = [
            ...(resolved.server.fs.allow || []),
            DIR_OVERLAY,
            path.resolve(DIR_OVERLAY, '..'),
          ]
        }
      },

      config(config, env) {
        if (env.command !== 'build') {
          return {}
        }

        const mode = env.mode || (config as any).mode || 'development'
        const command = env.command
        const tempConfig = resolvePluginConfig(options, config.root || process.cwd(), mode, command)

        if (!tempConfig.isEnabled) {
          return {}
        }

        const overlayMainPath = path.join(DIR_OVERLAY, 'react-devtools-overlay.mjs')
        if (!fs.existsSync(overlayMainPath)) {
          return {}
        }

        const existingInput = config.build?.rollupOptions?.input
        const existingOutput = config.build?.rollupOptions?.output

        const outputConfig = Array.isArray(existingOutput)
          ? existingOutput.map(createOutputConfig)
          : existingOutput
            ? createOutputConfig(existingOutput)
            : createOutputConfig({})

        const input = createRollupInput(
          existingInput,
          OVERLAY_ENTRY_ID,
          config.root || process.cwd(),
        )

        return {
          build: {
            ...config.build,
            rollupOptions: {
              ...config.build?.rollupOptions,
              input,
              output: outputConfig,
            },
          },
        }
      },

      configureServer(server: ViteDevServer) {
        if (!pluginConfig)
          return

        const servePath = getClientPath(reactDevtoolsPath)
        setupDevServerMiddlewares(server, pluginConfig, servePath)

        // Serve plugins manifest
        server.middlewares.use(createPluginsMiddleware(pluginConfig, (filePath) => {
          if (process.platform === 'win32') {
            return `/@fs/${filePath.replace(/\\/g, '/')}`
          }
          return `/@fs${filePath}`
        }))

        wrapPrintUrls(server)
      },

      configurePreviewServer(server: PreviewServer) {
        if (!pluginConfig)
          return

        const servePath = getClientPath(reactDevtoolsPath)
        setupPreviewServerMiddlewares(server, pluginConfig, servePath)
        wrapPrintUrls(server)
      },

      async resolveId(id, importer) {
        if (id === DEVTOOLS_OPTIONS_ID) {
          return RESOLVED_OPTIONS_ID
        }

        if (id === OVERLAY_ENTRY_ID) {
          const overlayMainPath = path.join(DIR_OVERLAY, 'react-devtools-overlay.mjs')
          return fs.existsSync(overlayMainPath) ? overlayMainPath : null
        }

        // Resolve React Scan virtual module
        if (id === '__react-devtools-scan__') {
          return '\0__react-devtools-scan__'
        }

        // Resolve React globals virtual module
        if (id === '__react-devtools-globals__') {
          return '\0__react-devtools-globals__'
        }

        // Handle react-dom/client import from our globals module
        // For React 16/17, this module doesn't exist, so provide a fallback
        if (id === 'react-dom/client' && importer?.includes('__react-devtools-globals__')) {
          // Check if react-dom/client exists in the project
          try {
            const projectRoot = viteConfig?.root || process.cwd()
            // Try to find react-dom/client in node_modules
            const reactDomPath = path.join(projectRoot, 'node_modules', 'react-dom', 'client.js')
            if (fs.existsSync(reactDomPath)) {
              // Module exists (React 18/19), let Vite handle it
              return null
            }
          }
          catch {
            // Ignore errors
          }
          // Module doesn't exist (React 16/17), use fallback
          return '\0__react-devtools-react-dom-client-fallback__'
        }

        const normalizedId = id.startsWith('@id/') ? id.replace('@id/', '') : id
        return resolveOverlayPath(normalizedId, DIR_OVERLAY, reactDevtoolsPath)
      },

      async load(id) {
        if (id === RESOLVED_OPTIONS_ID) {
          if (!viteConfig || !pluginConfig) {
            return null
          }
          return `export default ${JSON.stringify({
            base: viteConfig.base || '/',
            enabled: pluginConfig.isEnabled,
          })}`
        }

        // Load React Scan virtual module
        if (id === '\0__react-devtools-scan__') {
          if (!pluginConfig?.scan) {
            return 'export const initScan = () => {};'
          }
          return generateScanInitESMCode(pluginConfig.scan)
        }

        // Load React globals virtual module
        if (id === '\0__react-devtools-globals__') {
          return generateReactGlobalsESMCode({
            tryReactDOMClient: true,
            dispatchReadyEvent: true,
          })
        }

        // Fallback for react-dom/client when it doesn't exist (React 16/17)
        if (id === '\0__react-devtools-react-dom-client-fallback__') {
          return `
// Fallback module for react-dom/client (React 16/17)
// createRoot doesn't exist in React 16/17
export const createRoot = undefined;
export const hydrateRoot = undefined;
`
        }

        return null
      },

      transform(code, id, transformOptions) {
        if (transformOptions?.ssr)
          return null

        if (!isWebpackContext && !viteConfig)
          return null

        if (!pluginConfig)
          return null

        const filename = id.split('?', 2)[0]

        if (!shouldProcessFile(filename))
          return null

        return transformSourceCode(
          code,
          filename,
          pluginConfig.injectSource,
          pluginConfig.projectRoot,
          pluginConfig.sourcePathMode,
        )
      },

      transformIndexHtml(html, ctx) {
        if (!pluginConfig)
          return html

        const base = normalizeBasePath(viteConfig?.base)
        const isProduction = !!ctx.bundle
        const scriptSrc = isProduction
          ? ((): string | null => {
              const overlayBundleName = findOverlayBundle(ctx.bundle!)
              if (!overlayBundleName) {
                return `${base}@id/${VIRTUAL_PATH_PREFIX}main.tsx`
              }
              const assetPath = `${base}${overlayBundleName}`
              return assetPath
            })()
          : `${base}@id/${VIRTUAL_PATH_PREFIX}main.tsx`

        if (!scriptSrc) {
          return html
        }

        const tags: Array<{
          tag: string
          attrs?: Record<string, string | boolean>
          children?: string
          injectTo?: 'body' | 'head' | 'head-prepend' | 'body-prepend'
        }> = []

        // 1. Config injection (for singleSpa/micro-frontend scenarios)
        const configTag = generateConfigScriptTag({
          clientUrl: pluginConfig.clientUrl,
          rootSelector: pluginConfig.rootSelector,
          theme: pluginConfig.theme,
          assets: pluginConfig.assets,
          launchEditor: pluginConfig.launchEditor,
        })
        if (configTag) {
          tags.push(configTag)
        }

        // 2. CSS styles
        tags.push(...generateCSSScriptTags(DIR_OVERLAY, base, isProduction))

        // 3. DevTools Hook (must be first, before React loads)
        tags.push(generateDevToolsHookScriptTag())

        // 4. React Scan (if configured)
        if (pluginConfig.scan) {
          tags.push(generateScanScriptTag(base, pluginConfig.scan))
        }

        // 5. React globals setup
        tags.push({
          tag: 'script',
          attrs: {
            type: 'module',
            src: `${base}@id/__react-devtools-globals__`,
          },
          injectTo: 'head',
        })

        // 6. Overlay loader with globals ready check
        tags.push({
          tag: 'script',
          attrs: {
            type: 'module',
          },
          children: generateOverlayLoaderCode(scriptSrc),
          injectTo: 'body',
        })

        return {
          html,
          tags,
        }
      },

      async closeBundle() {
        if (!viteConfig || !pluginConfig || viteConfig.command !== 'build')
          return

        const outputDir = viteConfig.build.outDir || 'dist'
        const htmlPath = path.resolve(viteConfig.root, outputDir, 'index.html')

        if (!fs.existsSync(htmlPath)) {
          return
        }

        const overlayBundleName = await (async () => {
          const assetsDir = path.resolve(viteConfig.root, outputDir)
          const files = fs.readdirSync(assetsDir)
          for (const file of files) {
            if (file.includes(OVERLAY_CHUNK_NAME) && file.endsWith('.js')) {
              return file
            }
          }
          return null
        })()

        if (!overlayBundleName) {
          return
        }

        const base = normalizeBasePath(viteConfig.base)
        updateHtmlWithOverlayPath(htmlPath, overlayBundleName, base)
      },
    },

    // ============================================================
    // Webpack Hooks
    // ============================================================
    webpack(compiler: Compiler) {
      isWebpackContext = true
      excludeHtmlFromUnplugin(compiler)

      const { mode, command } = getWebpackModeAndCommand(compiler)
      const projectRoot = getWebpackContext(compiler)

      pluginConfig = resolvePluginConfig(options, projectRoot, mode, command)

      if (!pluginConfig?.isEnabled) {
        return
      }

      // Setup dev server middlewares
      if (command === 'serve' && pluginConfig) {
        const servePath = getClientPath(reactDevtoolsPath)
        setupWebpackDevServerMiddlewares(compiler, pluginConfig, servePath)

        // Build scan init code if scan is enabled
        let scanInitCode: string | undefined
        if (pluginConfig.scan) {
          scanInitCode = generateScanInitCJSCode(pluginConfig.scan)
        }

        // Inject all DevTools entries
        const overlayPath = path.join(DIR_OVERLAY, 'react-devtools-overlay.mjs')
        injectDevToolsEntries(
          compiler,
          overlayPath,
          projectRoot,
          DIR_OVERLAY,
          scanInitCode,
          pluginConfig.clientUrl,
          pluginConfig.rootSelector,
          pluginConfig.theme,
          pluginConfig.assets,
          pluginConfig.launchEditor,
        )

        // Inject Babel plugin (for data-source-path)
        if (pluginConfig.injectSource) {
          injectBabelPlugin(
            compiler,
            pluginConfig.projectRoot,
            pluginConfig.sourcePathMode,
          )
        }
      }
    },
  }
}

export const unplugin = createUnplugin(unpluginFactory)

export default unplugin

type MakeFunctionParamsOptional<T extends (...args: any) => any>
  = (...args: Partial<Parameters<T>>) => ReturnType<T>

// Export for named imports
export const vite = unplugin.vite as MakeFunctionParamsOptional<typeof unplugin.vite>
export const webpack = unplugin.webpack as MakeFunctionParamsOptional<typeof unplugin.webpack>

// Export types
export type { ReactDevToolsPluginOptions }
