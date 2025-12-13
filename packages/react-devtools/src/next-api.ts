/**
 * Next.js API Route Handler for React DevTools Plus
 *
 * This module exports a ready-to-use API route handler that serves
 * the DevTools client and overlay files. Users just need to create
 * a catch-all route file with a single line of code.
 *
 * @example
 * ```ts
 * // app/__react_devtools__/[[...path]]/route.ts
 * export { GET } from 'react-devtools-plus/next/api'
 * ```
 */

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// MIME types for common file extensions
const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  return mimeTypes[ext] || 'application/octet-stream'
}

function findPackageDir(): string | null {
  const possiblePaths = [
    path.join(process.cwd(), 'node_modules', 'react-devtools-plus'),
  ]

  try {
    const pkgPath = require.resolve('react-devtools-plus/package.json')
    possiblePaths.unshift(path.dirname(pkgPath))
  }
  catch {
    // Ignore
  }

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      const pkgJsonPath = path.join(p, 'package.json')
      if (fs.existsSync(pkgJsonPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'))
          if (pkg.name === 'react-devtools-plus') {
            return p
          }
        }
        catch {
          // Continue
        }
      }
    }
  }

  return null
}

/**
 * GET handler for DevTools API routes
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  try {
    const params = await context.params
    const pathSegments = params.path || []
    const requestPath = pathSegments.join('/')

    // Detect the base path from the request URL
    const url = new URL(request.url)
    const fullPath = url.pathname
    const basePath = requestPath ? fullPath.replace(`/${requestPath}`, '') : fullPath.replace(/\/$/, '')

    const packageDir = findPackageDir()
    if (!packageDir) {
      return new NextResponse('react-devtools-plus package not found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      })
    }

    // Handle overlay.mjs
    if (requestPath === 'overlay.mjs') {
      const overlayPaths = [
        path.join(packageDir, 'src', 'overlay', 'react-devtools-overlay.mjs'),
        path.join(packageDir, 'dist', 'overlay', 'react-devtools-overlay.mjs'),
      ]

      for (const overlayPath of overlayPaths) {
        if (fs.existsSync(overlayPath)) {
          const content = fs.readFileSync(overlayPath, 'utf-8')
          return new NextResponse(content, {
            headers: {
              'Content-Type': 'application/javascript; charset=utf-8',
              'Cache-Control': 'no-cache',
            },
          })
        }
      }

      return new NextResponse('Overlay not found', { status: 404 })
    }

    // Handle overlay.css
    if (requestPath === 'overlay.css') {
      const cssPaths = [
        path.join(packageDir, 'src', 'overlay', 'react-devtools-overlay.css'),
        path.join(packageDir, 'dist', 'overlay', 'react-devtools-overlay.css'),
      ]

      for (const cssPath of cssPaths) {
        if (fs.existsSync(cssPath)) {
          const content = fs.readFileSync(cssPath, 'utf-8')
          return new NextResponse(content, {
            headers: {
              'Content-Type': 'text/css; charset=utf-8',
              'Cache-Control': 'no-cache',
            },
          })
        }
      }
    }

    // Serve DevTools client files
    const clientDir = path.join(packageDir, 'client')
    if (!fs.existsSync(clientDir)) {
      return new NextResponse('DevTools client not found', { status: 404 })
    }

    let filePath = path.join(clientDir, requestPath || 'index.html')

    // SPA fallback
    if (!requestPath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(clientDir, 'index.html')
    }

    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 })
    }

    const mimeType = getMimeType(filePath)

    // Fix relative paths in HTML using detected basePath
    if (filePath.endsWith('.html')) {
      let htmlContent = fs.readFileSync(filePath, 'utf-8')
      // Replace both relative paths and hardcoded /__react_devtools__ paths
      htmlContent = htmlContent.replace(/src="\.\/assets\//g, `src="${basePath}/assets/`)
      htmlContent = htmlContent.replace(/href="\.\/assets\//g, `href="${basePath}/assets/`)
      htmlContent = htmlContent.replace(/src="\/__react_devtools__\/assets\//g, `src="${basePath}/assets/`)
      htmlContent = htmlContent.replace(/href="\/__react_devtools__\/assets\//g, `href="${basePath}/assets/`)
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'no-cache',
        },
      })
    }

    // For binary files, use Uint8Array
    const content = new Uint8Array(fs.readFileSync(filePath))

    return new NextResponse(content, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'no-cache',
      },
    })
  }
  catch (error) {
    console.error('[React DevTools] API error:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

