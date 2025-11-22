import type { NodePath } from '@babel/core'
import type { JSXOpeningElement } from '@babel/types'
import type { UnpluginFactory } from 'unplugin'
import type { PreviewServer, ResolvedConfig, ViteDevServer } from 'vite'
import type { Compiler } from 'webpack'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { transformSync, types } from '@babel/core'
import { bold, cyan, green } from 'kolorist'
import sirv from 'sirv'
import { createUnplugin } from 'unplugin'
import { normalizePath } from 'vite'
import { DIR_OVERLAY } from './dir.js'

// Constants
const OVERLAY_ENTRY_ID = '\0react-devtools-overlay-entry'
const OVERLAY_CHUNK_NAME = 'react-devtools-overlay'
const VIRTUAL_PATH_PREFIX = 'virtual:react-devtools-path:'
const DEVTOOLS_OPTIONS_ID = 'virtual:react-devtools-options'
const RESOLVED_OPTIONS_ID = `\0${DEVTOOLS_OPTIONS_ID}`
const STANDALONE_FLAG = '__REACT_DEVTOOLS_OVERLAY_STANDALONE__'

// Utility functions
function getPluginPath() {
  const currentPath = normalizePath(path.dirname(fileURLToPath(import.meta.url)))
  return currentPath.replace(/\/dist$/, '/src')
}

function getClientPath(reactDevtoolsPath: string) {
  const clientPath = path.resolve(reactDevtoolsPath, '../../react-devtools-client')
  const oldClientPath = path.resolve(reactDevtoolsPath, '../client')
  const clientDistPath = path.resolve(clientPath, 'dist')

  return (fs.existsSync(clientDistPath) && fs.existsSync(path.resolve(clientDistPath, 'index.html')))
    ? clientDistPath
    : oldClientPath
}

function normalizeBasePath(base: string | undefined): string {
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

function isOverlayPath(id: string): boolean {
  return id.includes(OVERLAY_CHUNK_NAME) || id.includes(DIR_OVERLAY)
}

function resolveOverlayPath(normalizedId: string, reactDevtoolsPath: string): string | null {
  if (!normalizedId.startsWith(VIRTUAL_PATH_PREFIX)) {
    return null
  }

  const pathPart = normalizedId.replace(VIRTUAL_PATH_PREFIX, '')
  const basePath = pathPart.replace(/\.mjs$/, '')
  const hasExtension = /\.(?:tsx?|jsx?)$/.test(basePath)

  const paths = [
    hasExtension ? path.join(DIR_OVERLAY, basePath) : path.join(DIR_OVERLAY, `${basePath}.tsx`),
    path.join(DIR_OVERLAY, hasExtension ? basePath.replace(/\.tsx$/, '.ts') : `${basePath}.ts`),
    path.join(reactDevtoolsPath, 'overlay', pathPart),
  ]

  for (const p of paths) {
    if (fs.existsSync(p)) {
      return normalizePath(p)
    }
  }

  return normalizePath(path.join(reactDevtoolsPath, 'overlay', pathPart))
}

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
  enabledEnvironments?: boolean | string[]
}

function shouldEnableDevTools(
  enabledEnvironments: boolean | string[] | undefined,
  mode: string,
  command: 'build' | 'serve',
): boolean {
  if (process.env.VITE_REACT_DEVTOOLS_ENABLED !== undefined) {
    return process.env.VITE_REACT_DEVTOOLS_ENABLED === 'true'
  }

  if (enabledEnvironments === true) {
    return command === 'serve'
  }

  if (enabledEnvironments === false) {
    return false
  }

  if (Array.isArray(enabledEnvironments)) {
    const nodeEnv = process.env.NODE_ENV || mode
    return enabledEnvironments.includes(nodeEnv) || enabledEnvironments.includes(mode)
  }

  return command === 'serve'
}

// Vite-specific utilities
function createOutputConfig(baseConfig: any) {
  return {
    ...baseConfig,
    manualChunks: (id: string, options: any, getModuleInfo: any) => {
      if (isOverlayPath(id)) {
        return OVERLAY_CHUNK_NAME
      }
      if (typeof baseConfig?.manualChunks === 'function') {
        return baseConfig.manualChunks(id, options, getModuleInfo)
      }
      return null
    },
  }
}

function createRollupInput(
  existingInput: any,
  overlayInput: string,
  root: string,
): any {
  if (existingInput) {
    if (Array.isArray(existingInput)) {
      return [...existingInput, overlayInput]
    }
    if (typeof existingInput === 'object') {
      return {
        ...existingInput,
        [OVERLAY_CHUNK_NAME]: overlayInput,
      }
    }
  }

  // When input is not set, Vite uses index.html as default
  const indexHtmlPath = path.resolve(root, 'index.html')
  if (fs.existsSync(indexHtmlPath)) {
    return {
      main: indexHtmlPath,
      [OVERLAY_CHUNK_NAME]: overlayInput,
    }
  }

  return overlayInput
}

function findOverlayBundle(bundle: Record<string, any>): string | null {
  for (const [key, chunk] of Object.entries(bundle)) {
    if (chunk?.type === 'chunk' && (key === OVERLAY_CHUNK_NAME || chunk.name === OVERLAY_CHUNK_NAME)) {
      return chunk.fileName
    }
  }
  return null
}

function updateHtmlWithOverlayPath(
  htmlPath: string,
  overlayBundleName: string,
  base: string,
) {
  let htmlContent = fs.readFileSync(htmlPath, 'utf-8')
  const placeholderPath = `${base}assets/react-devtools-overlay.js`
  const virtualPath = `${base}@id/${VIRTUAL_PATH_PREFIX}main.tsx`
  const actualPath = `${base}${overlayBundleName}`

  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  htmlContent = htmlContent.replace(new RegExp(escapeRegex(placeholderPath), 'g'), actualPath)
  htmlContent = htmlContent.replace(new RegExp(escapeRegex(virtualPath), 'g'), actualPath)

  fs.writeFileSync(htmlPath, htmlContent, 'utf-8')
}

const unpluginFactory: UnpluginFactory<ReactDevToolsPluginOptions> = (options = {}) => {
  const reactDevtoolsPath = getPluginPath()
  const pluginOptions = options
  const enabledEnvironments = options?.enabledEnvironments
  let viteConfig: ResolvedConfig | undefined
  let webpackMode: string = 'development'
  let isWebpackContext = false

  // Filter function to exclude HTML files and other non-JS files
  const shouldProcessFile = (id: string): boolean => {
    // Exclude HTML files
    if (id.endsWith('.html') || id.endsWith('.htm')) {
      return false
    }
    // Exclude other asset files
    if (/\.(?:css|scss|sass|less|styl|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i.test(id)) {
      return false
    }
    return true
  }

  function serveClient(servePath: string) {
    return sirv(servePath, {
      single: true,
      dev: true,
    })
  }

  function printDevToolsUrls(urls: string[]) {
    const shortcut = process.platform === 'darwin' ? 'Option(⌥)+Shift(⇧)+R' : 'Alt(⌥)+Shift(⇧)+R'
    const colorUrl = (value: string) => cyan(value.replace(/:(\d+)\//, (_, port) => `:${bold(port)}/`))

    for (const url of urls) {
      const devtoolsUrl = url.endsWith('/') ? `${url}__react_devtools__/` : `${url}/__react_devtools__/`
      console.log(`  ${green('➜')}  ${bold('React DevTools')}: Open ${colorUrl(devtoolsUrl)} to view component tree`)
      console.log(`  ${green('➜')}  ${bold('React DevTools')}: Press ${cyan(shortcut)} in the app to toggle the overlay`)
    }
  }

  function setupServerMiddleware(middlewares: any, base: string, servePath: string) {
    middlewares.use(`${base}__react_devtools__`, serveClient(servePath))
  }

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

  function excludeHtmlFromUnplugin(compilerInstance: Compiler) {
    compilerInstance.hooks.normalModuleFactory.tap('unplugin-react-devtools', (nmf) => {
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

  // Babel plugin factory for injecting source attributes
  function createSourceAttributePlugin() {
    return function sourceAttributePlugin() {
      return {
        name: 'source-attribute',
        visitor: {
          JSXOpeningElement(path: NodePath<JSXOpeningElement>) {
            const loc = path.node.loc
            if (!loc)
              return

            // Get the filename from the plugin state
            const filename = (this as any).file?.opts?.filename || ''
            if (!filename)
              return

            // Add data-source-path attribute to JSX elements
            path.node.attributes.push(
              types.jsxAttribute(
                types.jsxIdentifier('data-source-path'),
                types.stringLiteral(`${filename}:${loc.start.line}:${loc.start.column}`),
              ),
            )
          },
        },
      }
    }
  }

  function transformSourceCode(code: string, id: string) {
    // Only process JSX/TSX files
    if (!id.match(/\.[jt]sx$/)) {
      return null
    }

    try {
      const result = transformSync(code, {
        filename: id,
        presets: [
          ['@babel/preset-react', { runtime: 'automatic' }],
          '@babel/preset-typescript',
        ],
        plugins: [
          createSourceAttributePlugin(),
        ],
        ast: true,
        sourceMaps: true,
        configFile: false,
        babelrc: false,
      })

      if (!result?.code)
        return null

      return {
        code: result.code,
        map: result.map,
      }
    }
    catch (error) {
      console.error('[React DevTools] Babel transform error:', error)
      return null
    }
  }

  return {
    name: 'unplugin-react-devtools',
    enforce: 'pre', // Use 'pre' to transform before other plugins
    // Include JSX/TSX files for source code transformation
    transformInclude(id) {
      // Don't process HTML files
      if (id.endsWith('.html') || id.endsWith('.htm'))
        return false

      // Process JSX/TSX files for source code location injection
      if (id.match(/\.[jt]sx$/))
        return true

      return false
    },
    loadInclude(id) {
      if (isWebpackContext)
        return false
      return true
    },
    // Vite hooks
    vite: {
      apply(config, env) {
        return shouldEnableDevTools(
          enabledEnvironments,
          env.mode || config.mode || 'development',
          env.command,
        )
      },
      configResolved(resolved) {
        viteConfig = resolved
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

        const currentMode = env.mode || config.mode || 'development'
        const isEnabled = shouldEnableDevTools(enabledEnvironments, currentMode, env.command)

        if (!isEnabled) {
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

        const input = createRollupInput(existingInput, OVERLAY_ENTRY_ID, config.root || process.cwd())

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
        const base = server.config.base || '/'
        const servePath = getClientPath(reactDevtoolsPath)
        setupServerMiddleware(server.middlewares, base, servePath)
        wrapPrintUrls(server)
      },
      configurePreviewServer(server: PreviewServer) {
        const base = server.config.base || '/'
        const servePath = getClientPath(reactDevtoolsPath)
        setupServerMiddleware(server.middlewares, base, servePath)
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

        const normalizedId = id.startsWith('@id/') ? id.replace('@id/', '') : id
        return resolveOverlayPath(normalizedId, reactDevtoolsPath)
      },
      async load(id) {
        if (id === RESOLVED_OPTIONS_ID) {
          if (!viteConfig) {
            return null
          }
          const enabled = shouldEnableDevTools(
            enabledEnvironments,
            viteConfig.mode || 'development',
            viteConfig.command,
          )
          return `export default ${JSON.stringify({
            base: viteConfig.base || '/',
            enabled,
          })}`
        }
        return null
      },
      transform(code, id, options) {
        if (options?.ssr)
          return null

        const filename = id.split('?', 2)[0]

        // First, try to inject source location information
        const sourceTransformResult = transformSourceCode(code, filename)
        let transformedCode = sourceTransformResult?.code || code
        const transformedMap = sourceTransformResult?.map || null

        // Then, handle overlay injection if needed
        const appendTo = pluginOptions.appendTo
        if (appendTo) {
          const matches = typeof appendTo === 'string'
            ? filename.endsWith(appendTo)
            : appendTo instanceof RegExp && appendTo.test(filename)

          if (matches) {
            transformedCode = `import '${VIRTUAL_PATH_PREFIX}overlay.ts';\n${transformedCode}`
          }
        }

        // Return transformed result if any transformation occurred
        if (sourceTransformResult || appendTo) {
          return {
            code: transformedCode,
            map: transformedMap,
          }
        }

        return null
      },
      transformIndexHtml(html, ctx) {
        if (pluginOptions.appendTo)
          return

        if (!viteConfig) {
          return html
        }

        const enabled = shouldEnableDevTools(
          enabledEnvironments,
          viteConfig.mode || 'development',
          viteConfig.command,
        )

        if (!enabled)
          return html

        const base = viteConfig.base || '/'
        const scriptSrc = viteConfig.command === 'build'
          ? `${base}assets/react-devtools-overlay.js`
          : `${base}@id/${VIRTUAL_PATH_PREFIX}main.tsx`

        return {
          html,
          tags: [
            {
              tag: 'script',
              injectTo: 'head',
              children: `window.${STANDALONE_FLAG} = true;`,
            },
            {
              tag: 'script',
              injectTo: 'head',
              attrs: { type: 'module', src: scriptSrc },
            },
          ],
        }
      },
      generateBundle(options, bundle) {
        if (viteConfig?.command === 'build') {
          const overlayBundleName = findOverlayBundle(bundle)
          if (overlayBundleName) {
            ;(this as any).__overlayBundleName = overlayBundleName
          }
        }
      },
      writeBundle(options, bundle) {
        if (viteConfig?.command !== 'build')
          return

        const overlayBundleName = (this as any).__overlayBundleName
        if (!overlayBundleName)
          return

        const outDir = options.dir || viteConfig.build?.outDir || 'dist'
        const htmlPath = path.resolve(outDir, 'index.html')

        if (fs.existsSync(htmlPath)) {
          updateHtmlWithOverlayPath(htmlPath, overlayBundleName, viteConfig.base || '/')
        }
      },
    },
    // Webpack hooks
    webpack(compiler: Compiler) {
      isWebpackContext = true
      const mode = compiler.options.mode || 'development'
      webpackMode = mode

      const isEnabled = shouldEnableDevTools(
        enabledEnvironments,
        mode,
        compiler.options.mode === 'production' ? 'build' : 'serve',
      )

      console.log('[React DevTools] Plugin loaded, mode:', mode, 'enabled:', isEnabled)

      if (!isEnabled) {
        console.log('[React DevTools] Plugin disabled for this environment')
        return
      }

      // Apply HTML exclusion to main and child compilers
      excludeHtmlFromUnplugin(compiler)

      compiler.hooks.compilation.tap('unplugin-react-devtools', (compilation, params: any) => {
        const childCompiler = params?.compiler || compilation.compiler
        if (childCompiler !== compiler) {
          excludeHtmlFromUnplugin(childCompiler)
        }
      })

      // Add entry for overlay
      const overlayMainPath = path.join(DIR_OVERLAY, 'main.tsx')
      console.log('[React DevTools] Overlay path:', overlayMainPath, 'exists:', fs.existsSync(overlayMainPath))
      if (!fs.existsSync(overlayMainPath)) {
        console.warn('[React DevTools] Overlay file not found at:', overlayMainPath)
        return
      }

      // Inject entry
      const originalEntry = compiler.options.entry
      const overlayEntryDescriptor = {
        import: [overlayMainPath],
        filename: `${OVERLAY_CHUNK_NAME}.js`,
      }

      if (typeof originalEntry === 'function') {
        const originalEntryFn = originalEntry as () => Promise<any>
        compiler.options.entry = async () => {
          const result = await originalEntryFn()
          if (typeof result === 'string' || Array.isArray(result)) {
            return {
              main: result,
              [OVERLAY_CHUNK_NAME]: overlayEntryDescriptor,
            }
          }
          return {
            ...result,
            [OVERLAY_CHUNK_NAME]: overlayEntryDescriptor,
          }
        }
      }
      else if (typeof originalEntry === 'string' || Array.isArray(originalEntry)) {
        compiler.options.entry = {
          main: originalEntry,
          [OVERLAY_CHUNK_NAME]: overlayEntryDescriptor,
        } as any
      }
      else if (typeof originalEntry === 'object') {
        compiler.options.entry = {
          ...originalEntry,
          [OVERLAY_CHUNK_NAME]: overlayEntryDescriptor,
        } as any
      }

      console.log('[React DevTools] Overlay entry injected')

      // Configure output to generate separate chunk for overlay
      if (!compiler.options.output) {
        ;(compiler.options as any).output = {}
      }
      if (!compiler.options.optimization) {
        ;(compiler.options as any).optimization = {}
      }
      if (!compiler.options.optimization.splitChunks) {
        ;(compiler.options.optimization as any).splitChunks = {}
      }

      // Configure webpack to serve DevTools client
      if (compiler.options.devServer) {
        const originalSetupMiddlewares = compiler.options.devServer.setupMiddlewares
        compiler.options.devServer.setupMiddlewares = (middlewares, server) => {
          if (originalSetupMiddlewares) {
            originalSetupMiddlewares(middlewares, server)
          }

          const base = normalizeBasePath(compiler.options.output?.publicPath as string)
          const servePath = getClientPath(reactDevtoolsPath)
          const devtoolsPath = `${base}__react_devtools__`

          console.log('[React DevTools] Setting up devServer middleware at:', devtoolsPath, 'serving from:', servePath)
          server.app?.use(devtoolsPath, serveClient(servePath))

          return middlewares
        }
      }

      const htmlPlugin = compiler.options.plugins?.find(
        (p: any) => p?.constructor?.name === 'HtmlWebpackPlugin',
      ) as any

      compiler.hooks.compilation.tap('unplugin-react-devtools', (compilation) => {
        const HtmlWebpackPluginClass = htmlPlugin?.constructor
        if (!HtmlWebpackPluginClass || typeof HtmlWebpackPluginClass.getHooks !== 'function') {
          return
        }

        HtmlWebpackPluginClass.getHooks(compilation).alterAssetTagGroups.tap(
          'unplugin-react-devtools',
          (data: any) => {
            // Prevent duplicate injection
            if (data.headTags?.some((tag: any) =>
              tag.tagName === 'script' && (
                tag.innerHTML?.includes(STANDALONE_FLAG)
                || tag.attributes?.src?.includes(OVERLAY_CHUNK_NAME)
              ),
            )) {
              return data
            }

            const standaloneScript = {
              tagName: 'script',
              voidTag: false,
              meta: { plugin: 'unplugin-react-devtools' },
              attributes: { type: 'text/javascript' },
              innerHTML: `window.${STANDALONE_FLAG} = true;`,
            }

            if (data.headTags) {
              data.headTags.unshift(standaloneScript)
            }

            return data
          },
        )
      })
    },
    // Shared resolveId for both Vite and Webpack
    resolveId(id) {
      // Exclude HTML files and other non-processable files
      if (!shouldProcessFile(id)) {
        return null
      }

      if (id === DEVTOOLS_OPTIONS_ID) {
        return RESOLVED_OPTIONS_ID
      }

      if (id === OVERLAY_ENTRY_ID) {
        const overlayMainPath = path.join(DIR_OVERLAY, 'main.tsx')
        return fs.existsSync(overlayMainPath) ? overlayMainPath : null
      }

      const normalizedId = id.startsWith('@id/') ? id.replace('@id/', '') : id
      return resolveOverlayPath(normalizedId, reactDevtoolsPath)
    },
    // Shared load for both Vite and Webpack
    load(id) {
      // Exclude HTML files and other non-processable files
      if (!shouldProcessFile(id)) {
        return null
      }

      if (id === RESOLVED_OPTIONS_ID) {
        const enabled = shouldEnableDevTools(
          enabledEnvironments,
          webpackMode,
          webpackMode === 'production' ? 'build' : 'serve',
        )
        return `export default ${JSON.stringify({
          base: '/',
          enabled,
        })}`
      }
      return null
    },
    // Shared transform for both Vite and Webpack
    transform(code, id) {
      const filename = id.split('?', 2)[0]

      // Transform JSX/TSX files to inject source location
      return transformSourceCode(code, filename)
    },
  }
}

export const unplugin = createUnplugin(unpluginFactory)

// Export for Vite
export const vite = unplugin.vite

// Export for Webpack - unplugin.webpack returns a function that takes options
export const webpack = unplugin.webpack

// Default export (Vite for backward compatibility)
export default unplugin.vite

// Also export the factory for advanced usage
export { unpluginFactory }
