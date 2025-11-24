/**
 * React DevTools Unplugin (Refactored)
 * React DevTools 通用插件（重构版）
 *
 * This is a modularized version with better separation of concerns
 * 这是一个模块化版本，更好地分离了关注点
 */

import type { UnpluginFactory } from 'unplugin'
import type { PreviewServer, ResolvedConfig, ViteDevServer } from 'vite'
import type { Compiler } from 'webpack'
import type { ReactDevToolsPluginOptions, ResolvedPluginConfig } from './config/types.js'
import fs from 'node:fs'
import path from 'node:path'
import { bold, cyan, green } from 'kolorist'
import { createUnplugin } from 'unplugin'
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
  injectOverlayToEntry,
  injectReactScanToEntry,
  setupWebpackDevServerMiddlewares,
} from './integrations/webpack.js'
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

/**
 * Print DevTools URLs to console
 * 打印 DevTools URL到控制台
 */
function printDevToolsUrls(urls: string[]) {
  const shortcut = process.platform === 'darwin' ? 'Option(⌥)+Shift(⇧)+R' : 'Alt(⌥)+Shift(⇧)+R'
  const colorUrl = (value: string) => cyan(value.replace(/:(\d+)\//, (_, port) => `:${bold(port)}/`))

  for (const url of urls) {
    const devtoolsUrl = url.endsWith('/') ? `${url}__react_devtools__/` : `${url}/__react_devtools__/`
    console.log(`  ${green('➜')}  ${bold('React DevTools')}: Open ${colorUrl(devtoolsUrl)} to view component tree`)
    console.log(`  ${green('➜')}  ${bold('React DevTools')}: Press ${cyan(shortcut)} in the app to toggle the overlay`)
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
  compiler.hooks.normalModuleFactory.tap('unplugin-react-devtools', (nmf) => {
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

        const overlayMainPath = path.join(DIR_OVERLAY, 'main.tsx')
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
        wrapPrintUrls(server)
      },

      configurePreviewServer(server: PreviewServer) {
        if (!pluginConfig)
          return

        const servePath = getClientPath(reactDevtoolsPath)
        setupPreviewServerMiddlewares(server, pluginConfig, servePath)
        wrapPrintUrls(server)
      },

      async resolveId(id) {
        if (id === DEVTOOLS_OPTIONS_ID) {
          return RESOLVED_OPTIONS_ID
        }

        if (id === OVERLAY_ENTRY_ID) {
          const overlayMainPath = path.join(DIR_OVERLAY, 'main.tsx')
          return fs.existsSync(overlayMainPath) ? overlayMainPath : null
        }

        // Resolve React Scan virtual module
        if (id === '__react-devtools-scan__') {
          return '\0__react-devtools-scan__'
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

          const scanOptions = {
            enabled: true,
            showToolbar: pluginConfig.scan.showToolbar ?? false,
            log: pluginConfig.scan.log ?? true,
            animationSpeed: pluginConfig.scan.animationSpeed || 'fast',
            ...pluginConfig.scan,
          }

          return `
            import { initScan, ReactScanInternals, setOptions, getOptions, scan } from 'react-devtools/scan';

            if (typeof window !== 'undefined') {
              window.__REACT_SCAN_INTERNALS__ = ReactScanInternals;
              window.__REACT_SCAN_SET_OPTIONS__ = setOptions;
              window.__REACT_SCAN_GET_OPTIONS__ = getOptions;
              window.__REACT_SCAN_SCAN__ = scan;
            }

            if (ReactScanInternals) {
              ReactScanInternals.runInAllEnvironments = true;
            }

            scan(${JSON.stringify(scanOptions)});
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
        const scriptSrc = ctx.bundle
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

        // Inject React DevTools Hook FIRST (before anything else)
        // We MUST inject this manually to ensure it exists before React loads.
        // Using an IIFE with closure to prevent context loss issues.
        tags.push({
          tag: 'script',
          attrs: {},
          children: `
            if (typeof window !== 'undefined' && !window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
              (function() {
                var renderers = new Map();
                window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
                  __IS_OUR_MOCK__: true,
                  checkDCE: function() {},
                  supportsFiber: true,
                  renderers: renderers,
                  onScheduleFiberRoot: function() {},
                  onCommitFiberRoot: function(rendererID, root, priorityLevel) {
                    // This might be overwritten by bippy
                  },
                  onCommitFiberUnmount: function() {},
                  inject: function(renderer) {
                    var id = Math.random().toString(36).slice(2);
                    renderers.set(id, renderer);
                    return id;
                  }
                };
              })();
            }
          `,
          injectTo: 'head-prepend',
        })

        // Inject React Scan if configured (enable by default and auto-start)
        if (pluginConfig.scan) {
          const scanOptions = {
            enabled: true,
            showToolbar: pluginConfig.scan.showToolbar ?? false,
            ...pluginConfig.scan,
          }

          tags.push({
            tag: 'script',
            attrs: {
              type: 'module',
            },
            children: `
              import '${base}@id/__react-devtools-scan__';
            `,
            injectTo: 'head-prepend',
          })
        }

        // Inject Overlay
        tags.push({
          tag: 'script',
          attrs: {
            type: 'module',
            src: scriptSrc,
          },
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

        // Inject React Scan (before overlay, so it initializes first)
        if (pluginConfig.scan) {
          const scanOptions = {
            enabled: true,
            showToolbar: pluginConfig.scan.showToolbar ?? false,
            log: pluginConfig.scan.log ?? true,
            animationSpeed: pluginConfig.scan.animationSpeed || 'fast',
            showOutlines: true, // Force show outlines
            ...pluginConfig.scan,
          }

          const scanInitCode = `
            import { initScan, ReactScanInternals, setOptions, getOptions, scan } from 'react-devtools/scan';

            if (typeof window !== 'undefined') {
              window.__REACT_SCAN_INTERNALS__ = ReactScanInternals;
              window.__REACT_SCAN_SET_OPTIONS__ = setOptions;
              window.__REACT_SCAN_GET_OPTIONS__ = getOptions;
              window.__REACT_SCAN_SCAN__ = scan;
            }

            // Ensure we run in all environments
            if (ReactScanInternals) {
              ReactScanInternals.runInAllEnvironments = true;
            }

            initScan(${JSON.stringify(scanOptions)});
          `

          injectReactScanToEntry(compiler, scanInitCode, projectRoot)
        }

        // Inject overlay
        const overlayPath = path.join(DIR_OVERLAY, 'main.tsx')
        injectOverlayToEntry(compiler, overlayPath)

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

// Export for named imports
export const vite = unplugin.vite
export const webpack = unplugin.webpack

// Export types
export type { ReactDevToolsPluginOptions }
