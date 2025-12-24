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

import fs from 'node:fs'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'

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

// Asset types for scanning
const ASSET_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.svg',
  '.ico',
  '.bmp',
  '.mp4',
  '.webm',
  '.ogg',
  '.mp3',
  '.wav',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.otf',
  '.pdf',
  '.txt',
  '.md',
  '.json',
]

// Scan directory for assets
function scanAssets(dir: string, basePath: string = '', projectRoot: string = process.cwd()): any[] {
  const assets: any[] = []

  if (!fs.existsSync(dir)) {
    return assets
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relativePath = path.join(basePath, entry.name)

    if (entry.isDirectory()) {
      // Skip node_modules and hidden directories
      if (entry.name === 'node_modules' || entry.name.startsWith('.') || entry.name === '.next') {
        continue
      }
      assets.push(...scanAssets(fullPath, relativePath, projectRoot))
    }
    else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase()
      if (ASSET_EXTENSIONS.includes(ext)) {
        try {
          const stats = fs.statSync(fullPath)
          // For public folder, publicPath is the file path without 'public/' prefix
          const isPublic = basePath.startsWith('public')
          const publicPath = isPublic ? `/${relativePath.replace(/^public[/\\]/, '')}` : ''

          assets.push({
            path: relativePath,
            type: getAssetType(ext),
            publicPath,
            relativePath,
            filePath: fullPath,
            size: stats.size,
            mtime: stats.mtime.getTime(),
          })
        }
        catch {
          // Skip files we can't stat
        }
      }
    }
  }

  return assets
}

function getAssetType(ext: string): string {
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.bmp'].includes(ext)) {
    return 'image'
  }
  if (['.mp4', '.webm', '.ogg'].includes(ext)) {
    return 'video'
  }
  if (['.mp3', '.wav'].includes(ext)) {
    return 'audio'
  }
  if (['.woff', '.woff2', '.ttf', '.eot', '.otf'].includes(ext)) {
    return 'font'
  }
  return 'other'
}

// Handle assets API requests
function handleAssetsApi(requestPath: string, url: URL): NextResponse {
  const projectRoot = process.cwd()

  // Main assets list
  if (requestPath === 'api/assets') {
    try {
      // Scan public directory and src directory
      const publicAssets = scanAssets(path.join(projectRoot, 'public'), 'public', projectRoot)
      const srcAssets = scanAssets(path.join(projectRoot, 'src'), 'src', projectRoot)
      const appAssets = scanAssets(path.join(projectRoot, 'app'), 'app', projectRoot)

      const assets = [...publicAssets, ...srcAssets, ...appAssets]

      return new NextResponse(JSON.stringify(assets), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }
    catch (e) {
      return new NextResponse(JSON.stringify({ error: 'Failed to scan assets' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // Refresh assets
  if (requestPath === 'api/assets/refresh') {
    try {
      const publicAssets = scanAssets(path.join(projectRoot, 'public'), 'public', projectRoot)
      const srcAssets = scanAssets(path.join(projectRoot, 'src'), 'src', projectRoot)
      const appAssets = scanAssets(path.join(projectRoot, 'app'), 'app', projectRoot)

      const assets = [...publicAssets, ...srcAssets, ...appAssets]

      return new NextResponse(JSON.stringify(assets), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }
    catch (e) {
      return new NextResponse(JSON.stringify({ error: 'Failed to refresh assets' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // Image metadata
  if (requestPath === 'api/assets/image-meta') {
    const filepath = url.searchParams.get('path')
    if (!filepath) {
      return new NextResponse(JSON.stringify({ error: 'Missing path parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    try {
      const fullPath = path.join(projectRoot, filepath)
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath)
        return new NextResponse(JSON.stringify({
          size: stats.size,
          mtime: stats.mtime.toISOString(),
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }
      return new NextResponse(JSON.stringify(null), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
    catch (e) {
      return new NextResponse(JSON.stringify({ error: 'Failed to get image meta' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // Text content
  if (requestPath === 'api/assets/text-content') {
    const filepath = url.searchParams.get('path')
    const limit = Number.parseInt(url.searchParams.get('limit') || '500', 10)
    if (!filepath) {
      return new NextResponse(JSON.stringify({ error: 'Missing path parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    try {
      const fullPath = path.join(projectRoot, filepath)
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8').slice(0, limit)
        return new NextResponse(JSON.stringify({ content }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }
      return new NextResponse(JSON.stringify({ content: null }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
    catch (e) {
      return new NextResponse(JSON.stringify({ error: 'Failed to get text content' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  return new NextResponse('Not found', { status: 404 })
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

    // Handle open-in-editor request
    // This opens the specified file in the user's editor (Cursor by default)
    if (requestPath === 'api/open-in-editor' || requestPath.startsWith('__open-in-editor')) {
      const projectRoot = process.cwd()
      const url = new URL(request.url)
      const file = url.searchParams.get('file')

      if (!file) {
        return new NextResponse('Missing file parameter', { status: 400 })
      }

      try {
        const { openFileInEditor } = await import('./middleware/open-in-editor')
        await openFileInEditor(file, projectRoot, 'relative')
        return new NextResponse('OK', {
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }
      catch (error: any) {
        console.error('[React DevTools] Failed to open editor:', error.message)
        return new NextResponse('Failed to open editor', { status: 500 })
      }
    }

    // Handle plugins manifest request
    // Return empty array for now - plugins are not yet supported in Next.js
    if (requestPath === 'plugins-manifest.json') {
      return new NextResponse(JSON.stringify([]), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // Handle module graph API request
    // Read module graph from file (written by webpack compilation)
    if (requestPath === '__react_devtools_api__/graph' || requestPath === 'api/graph') {
      const projectRoot = process.cwd()
      const graphPath = path.join(projectRoot, '.next', 'cache', 'react-devtools', 'module-graph.json')

      try {
        if (fs.existsSync(graphPath)) {
          const graphData = JSON.parse(fs.readFileSync(graphPath, 'utf-8'))
          return new NextResponse(JSON.stringify(graphData), {
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Access-Control-Allow-Origin': '*',
            },
          })
        }
      }
      catch {
        // Fall through to return empty data
      }

      // Return empty data if no cached graph exists
      return new NextResponse(JSON.stringify({
        modules: [],
        root: projectRoot,
        message: 'Module graph data not yet available. Please wait for webpack compilation to complete.',
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // Handle assets API request
    // Assets scanning requires filesystem access which works in Next.js API routes
    if (requestPath === 'api/assets' || requestPath.startsWith('api/assets/')) {
      return handleAssetsApi(requestPath, url)
    }

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
