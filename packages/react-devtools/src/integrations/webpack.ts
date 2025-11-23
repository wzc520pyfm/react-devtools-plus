/**
 * Webpack-specific integration logic
 * Webpack 特定的集成逻辑
 */

import type { Compiler } from 'webpack'
import type { ResolvedPluginConfig, SourcePathMode } from '../config/types'
import { createOpenInEditorMiddleware, serveClient } from '../middleware'
import { createSourceAttributePlugin } from '../utils/babel-transform'

/**
 * Setup Webpack dev server middlewares
 * 设置 Webpack 开发服务器中间件
 */
export function setupWebpackDevServerMiddlewares(
  compiler: Compiler,
  config: ResolvedPluginConfig,
  clientPath: string,
) {
  if (!compiler.options.devServer) {
    compiler.options.devServer = {}
  }

  const originalSetupMiddlewares = compiler.options.devServer.setupMiddlewares

  compiler.options.devServer.setupMiddlewares = (middlewares, devServer) => {
    // Call original setupMiddlewares if it exists
    if (originalSetupMiddlewares) {
      middlewares = originalSetupMiddlewares(middlewares, devServer)
    }

    // Add open-in-editor middleware
    // Note: We don't specify 'path' here because createOpenInEditorMiddleware handles path checking internally.
    // If we specify 'path', Express/Connect might strip the prefix from req.url, causing the internal check to fail.
    middlewares.unshift({
      name: 'react-devtools-open-in-editor',
      middleware: createOpenInEditorMiddleware(
        config.projectRoot,
        config.sourcePathMode,
      ),
    })

    // Add client serving middleware
    middlewares.unshift({
      name: 'react-devtools-client',
      path: '/__react_devtools__',
      middleware: serveClient(clientPath),
    })

    return middlewares
  }
}

/**
 * Get Webpack mode and command
 * 获取 Webpack 模式和命令
 */
export function getWebpackModeAndCommand(compiler: Compiler): {
  mode: string
  command: 'build' | 'serve'
} {
  const mode = compiler.options.mode || 'development'
  // Webpack doesn't have a clear "serve" vs "build" distinction like Vite
  // We'll infer it from the presence of devServer config
  const command = compiler.options.devServer ? 'serve' : 'build'

  return { mode, command }
}

/**
 * Inject overlay to Webpack entry
 * 注入 Overlay 到 Webpack 入口
 */
export function injectOverlayToEntry(
  compiler: Compiler,
  overlayPath: string,
) {
  const originalEntry = compiler.options.entry

  compiler.options.entry = async () => {
    const entries = typeof originalEntry === 'function'
      ? await originalEntry()
      : originalEntry

    // Handle string entry
    if (typeof entries === 'string') {
      return {
        main: {
          import: [entries, overlayPath],
        },
      }
    }

    // Handle array entry
    if (Array.isArray(entries)) {
      return {
        main: {
          import: [...entries, overlayPath],
        },
      }
    }

    // Handle object entry
    if (typeof entries === 'object' && entries !== null) {
      const newEntries = { ...entries } as any
      const keys = Object.keys(newEntries)
      const mainKey = keys.find(k => k === 'main' || k === 'app' || k === 'index') || keys[0]

      if (mainKey) {
        const currentEntry = newEntries[mainKey]
        let importFiles: string[] = []
        let descriptor: any = {}

        if (typeof currentEntry === 'string') {
          importFiles = [currentEntry]
        }
        else if (Array.isArray(currentEntry)) {
          importFiles = [...currentEntry]
        }
        else if (typeof currentEntry === 'object' && currentEntry.import) {
          importFiles = Array.isArray(currentEntry.import)
            ? [...currentEntry.import]
            : [currentEntry.import]
          descriptor = currentEntry
        }

        importFiles.push(overlayPath)

        newEntries[mainKey] = {
          ...descriptor,
          import: importFiles,
        }
      }
      return newEntries
    }

    return entries
  }
}

/**
 * Inject Babel plugin to Webpack config
 * 注入 Babel 插件到 Webpack 配置
 */
export function injectBabelPlugin(
  compiler: Compiler,
  projectRoot: string,
  sourcePathMode: SourcePathMode,
) {
  const rules = compiler.options.module.rules as any[]

  const visitRule = (rule: any) => {
    if (rule.oneOf) {
      rule.oneOf.forEach(visitRule)
      return
    }

    // Handle rule.use (array or object)
    if (rule.use) {
      const uses = Array.isArray(rule.use) ? rule.use : [rule.use]
      uses.forEach((use: any) => {
        // Check if loader is babel-loader
        const loaderName = typeof use === 'string' ? use : use.loader
        if (loaderName && loaderName.includes('babel-loader')) {
          if (typeof use !== 'string') {
            if (!use.options)
              use.options = {}
            if (!use.options.plugins)
              use.options.plugins = []

            use.options.plugins.push(createSourceAttributePlugin(projectRoot, sourcePathMode))
          }
        }
      })
    }

    // Handle rule.loader (shortcut)
    if (rule.loader && rule.loader.includes('babel-loader')) {
      if (!rule.options)
        rule.options = {}
      if (!rule.options.plugins)
        rule.options.plugins = []
      rule.options.plugins.push(createSourceAttributePlugin(projectRoot, sourcePathMode))
    }
  }

  rules.forEach(visitRule)
}

/**
 * Get Webpack project root (context)
 * 获取 Webpack 项目根目录（context）
 */
export function getWebpackContext(compiler: Compiler): string {
  return compiler.context || process.cwd()
}
