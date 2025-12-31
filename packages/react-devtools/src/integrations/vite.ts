/**
 * Vite-specific integration logic
 * Vite 特定的集成逻辑
 */

import type { PreviewServer, ResolvedConfig, ViteDevServer } from 'vite'
import type { ResolvedPluginConfig } from '../config/types'
import fs from 'node:fs'
import path from 'node:path'
import { createAssetsMiddleware, createGraphMiddleware, createOpenInEditorMiddleware, getViteModuleGraph, serveClient } from '../middleware'
import { OVERLAY_CHUNK_NAME } from '../utils/paths'

/**
 * Create Vite output configuration
 * 创建 Vite 输出配置
 */
export function createOutputConfig(baseConfig: any) {
  return {
    ...baseConfig,
    manualChunks: (id: string, options: any, getModuleInfo: any) => {
      if (id.includes(OVERLAY_CHUNK_NAME) || id.includes('overlay')) {
        return OVERLAY_CHUNK_NAME
      }
      if (typeof baseConfig?.manualChunks === 'function') {
        return baseConfig.manualChunks(id, options, getModuleInfo)
      }
      return null
    },
  }
}

/**
 * Create Vite Rollup input configuration
 * 创建 Vite Rollup 输入配置
 */
export function createRollupInput(
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

/**
 * Find overlay bundle in Vite output
 * 在 Vite 输出中查找 overlay bundle
 */
export function findOverlayBundle(bundle: Record<string, any>): string | null {
  for (const [key, chunk] of Object.entries(bundle)) {
    if (chunk?.type === 'chunk' && (key === OVERLAY_CHUNK_NAME || chunk.name === OVERLAY_CHUNK_NAME)) {
      return chunk.fileName
    }
  }
  return null
}

/**
 * Update HTML with overlay bundle path
 * 使用 overlay bundle 路径更新 HTML
 */
export function updateHtmlWithOverlayPath(
  htmlPath: string,
  overlayBundleName: string,
  base: string,
) {
  let htmlContent = fs.readFileSync(htmlPath, 'utf-8')
  const placeholderPath = `${base}assets/react-devtools-overlay.js`
  const virtualPath = `${base}@id/virtual:react-devtools-path:main.tsx`
  const actualPath = `${base}${overlayBundleName}`

  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  htmlContent = htmlContent.replace(new RegExp(escapeRegex(placeholderPath), 'g'), actualPath)
  htmlContent = htmlContent.replace(new RegExp(escapeRegex(virtualPath), 'g'), actualPath)

  fs.writeFileSync(htmlPath, htmlContent, 'utf-8')
}

/**
 * Setup Vite dev server middlewares
 * 设置 Vite 开发服务器中间件
 */
export function setupDevServerMiddlewares(
  server: ViteDevServer,
  config: ResolvedPluginConfig,
  clientPath: string,
) {
  const base = server.config.base || '/'

  // Open in editor middleware
  server.middlewares.use(createOpenInEditorMiddleware(
    config.projectRoot,
    config.sourcePathMode,
  ))

  // Graph middleware for module dependency visualization (must be before client serving)
  server.middlewares.use(createGraphMiddleware(
    getViteModuleGraph(server, config.projectRoot),
    base,
  ))

  // Assets middleware for project files browsing
  server.middlewares.use(createAssetsMiddleware({
    root: config.projectRoot,
    publicDir: server.config.publicDir || 'public',
    baseUrl: base,
  }))

  // Client serving middleware
  server.middlewares.use(`${base}__react_devtools__`, serveClient(clientPath))
}

/**
 * Setup Vite preview server middlewares
 * 设置 Vite 预览服务器中间件
 */
export function setupPreviewServerMiddlewares(
  server: PreviewServer,
  config: ResolvedPluginConfig,
  clientPath: string,
) {
  // Open in editor middleware
  server.middlewares.use(createOpenInEditorMiddleware(
    config.projectRoot,
    config.sourcePathMode,
  ))

  // Client serving middleware
  const base = server.config.base || '/'
  server.middlewares.use(`${base}__react_devtools__`, serveClient(clientPath))
}

/**
 * Get Vite mode and command from config
 * 从配置中获取 Vite 模式和命令
 *
 * Priority for mode detection:
 * 1. Vite config.mode (explicit configuration)
 * 2. NODE_ENV environment variable (commonly used in Node.js ecosystem)
 * 3. Default to 'development'
 */
export function getViteModeAndCommand(viteConfig: ResolvedConfig): {
  mode: string
  command: 'build' | 'serve'
} {
  return {
    // Consider both Vite mode and NODE_ENV for environment detection
    mode: viteConfig.mode || process.env.NODE_ENV || 'development',
    command: viteConfig.command,
  }
}
