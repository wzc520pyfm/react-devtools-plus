/**
 * Webpack-specific integration logic
 * Webpack 特定的集成逻辑
 */

import type { Compiler } from 'webpack'
import type { ResolvedPluginConfig } from '../config/types'
import { createOpenInEditorMiddleware } from '../middleware'

/**
 * Setup Webpack dev server middlewares
 * 设置 Webpack 开发服务器中间件
 */
export function setupWebpackDevServerMiddlewares(
  compiler: Compiler,
  config: ResolvedPluginConfig,
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
    devServer.app?.use('/__open-in-editor', createOpenInEditorMiddleware(
      config.projectRoot,
      config.sourcePathMode,
    ))

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
 * Get Webpack project root (context)
 * 获取 Webpack 项目根目录（context）
 */
export function getWebpackContext(compiler: Compiler): string {
  return compiler.context || process.cwd()
}
