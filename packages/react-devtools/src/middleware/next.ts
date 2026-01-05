/**
 * Next.js Middleware for React DevTools Plus
 *
 * This module provides a middleware function that can be used with
 * Next.js custom server or API routes to serve DevTools endpoints.
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { ResolvedPluginConfig } from '../config/types'
import fs from 'node:fs'
import path from 'node:path'
import {
  createAssetsMiddleware,
  createGraphMiddleware,
  createOpenInEditorMiddleware,
  createPluginFileMiddleware,
  createPluginsMiddleware,
  getWebpackModuleGraph,
  serveClient,
} from './index'

type NextApiHandler = (req: any, res: any) => Promise<void> | void

/**
 * Create an API route handler for DevTools
 * This can be used in Next.js API routes (pages/api or app/api)
 */
export function createDevToolsApiHandler(
  config: ResolvedPluginConfig,
  clientPath: string,
): NextApiHandler {
  // Create middleware instances
  const middlewares = [
    createPluginsMiddleware(config, (filePath) => {
      return `/__react_devtools__/file?path=${encodeURIComponent(filePath)}`
    }),
    createPluginFileMiddleware(),
    createGraphMiddleware(getWebpackModuleGraph(), '/'),
    createOpenInEditorMiddleware(config.projectRoot, config.sourcePathMode, config.launchEditor),
    createAssetsMiddleware({
      root: config.projectRoot,
      publicDir: 'public',
      baseUrl: '/',
    }),
    serveClient(clientPath),
  ]

  return async (req: any, res: any) => {
    // Try each middleware until one handles the request
    for (const middleware of middlewares) {
      await new Promise<void>((resolve) => {
        let handled = false

        middleware(req, res, () => {
          if (!handled) {
            handled = true
            resolve()
          }
        })

        // Check if response was sent
        if (res.writableEnded || res.headersSent) {
          handled = true
          resolve()
        }
      })

      // If response was sent, stop processing
      if (res.writableEnded || res.headersSent) {
        return
      }
    }

    // No middleware handled the request
    res.statusCode = 404
    res.end('Not found')
  }
}

/**
 * Create a connect-style middleware for Next.js custom server
 */
export function createDevToolsMiddleware(
  config: ResolvedPluginConfig,
  clientPath: string,
): (req: IncomingMessage, res: ServerResponse, next: () => void) => void {
  const handler = createDevToolsApiHandler(config, clientPath)

  return (req, res, next) => {
    // Only handle requests under /__react_devtools__
    if (!req.url?.startsWith('/__react_devtools__')) {
      return next()
    }

    // Remove prefix for internal routing
    const originalUrl = req.url
    req.url = req.url.replace('/__react_devtools__', '') || '/'

    handler(req, res)!.then(() => {
      // Restore URL
      req.url = originalUrl

      // If not handled, call next
      if (!res.writableEnded) {
        next()
      }
    }).catch((err) => {
      console.error('[React DevTools] Middleware error:', err)
      req.url = originalUrl
      next()
    })
  }
}

/**
 * Serve the overlay script file
 */
export function serveOverlayScript(overlayDir: string): (req: IncomingMessage, res: ServerResponse) => boolean {
  const overlayPath = path.join(overlayDir, 'react-devtools-overlay.mjs')

  return (req, res) => {
    if (req.url === '/__react_devtools__/overlay.mjs') {
      if (fs.existsSync(overlayPath)) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
        res.setHeader('Cache-Control', 'no-cache')
        res.end(fs.readFileSync(overlayPath, 'utf-8'))
        return true
      }
    }
    return false
  }
}

export default createDevToolsMiddleware
