import { Badge, Checkbox, Input } from '@react-devtools-plus/ui'
import { useCallback, useEffect, useMemo, useState } from 'react'

// Helper to get API base path (works for both Vite/Webpack and Next.js)
function getApiBasePath(): string {
  // For Next.js: use the DevTools client URL as base
  const pathname = window.location.pathname.replace(/#.*$/, '').replace(/\/$/, '')
  return pathname || '/__react_devtools__'
}

// Check if running in Next.js environment (iframe loaded from custom path like /devtools)
function isNextJsEnvironment(): boolean {
  const pathname = window.location.pathname.replace(/#.*$/, '').replace(/\/$/, '')
  // If the pathname is not /__react_devtools__, we're likely in Next.js with a custom route
  return pathname !== '' && pathname !== '/__react_devtools__'
}

// Fetch API with smart path detection
async function fetchApi(endpoint: string): Promise<Response> {
  const basePath = getApiBasePath()

  // In Next.js, use the custom basePath directly to avoid 404 logs
  if (isNextJsEnvironment()) {
    const response = await fetch(`${basePath}${endpoint}`)
    if (response.ok) {
      return response
    }
    // Fallback to standard path if custom path fails
    const fallbackResponse = await fetch(`/__react_devtools__${endpoint}`)
    if (fallbackResponse.ok) {
      return fallbackResponse
    }
    throw new Error('Failed to fetch from all API endpoints')
  }

  // Standard Vite/Webpack environment
  const response = await fetch(`/__react_devtools__${endpoint}`)
  if (response.ok) {
    return response
  }

  // Fallback to basePath
  const fallbackResponse = await fetch(`${basePath}${endpoint}`)
  if (fallbackResponse.ok) {
    return fallbackResponse
  }

  throw new Error('Failed to fetch from all API endpoints')
}

// Asset types
type AssetType = 'image' | 'font' | 'video' | 'audio' | 'text' | 'json' | 'wasm' | 'other'

interface AssetInfo {
  path: string
  type: AssetType
  publicPath: string
  relativePath: string
  filePath: string
  size: number
  mtime: number
}

interface ImageMeta {
  width: number
  height: number
  orientation?: number
  type?: string
  mimeType?: string
}

// Default static asset extensions (excluding source code files)
const DEFAULT_ASSET_EXTENSIONS = [
  // Images
  'png',
  'jpg',
  'jpeg',
  'gif',
  'svg',
  'webp',
  'avif',
  'ico',
  'bmp',
  'tiff',
  // Videos
  'mp4',
  'webm',
  'ogv',
  'mov',
  'avi',
  // Audio
  'mp3',
  'wav',
  'ogg',
  'flac',
  'aac',
  // Fonts
  'woff',
  'woff2',
  'eot',
  'ttf',
  'otf',
  // Documents
  'pdf',
  'md',
  // Data
  'json',
  'yaml',
  'yml',
  'toml',
]

// Get assets config from DevTools runtime config
function getAssetsConfig(): { files?: string[] } {
  if (typeof window !== 'undefined' && (window as any).__REACT_DEVTOOLS_CONFIG__?.assets) {
    return (window as any).__REACT_DEVTOOLS_CONFIG__.assets
  }
  return {}
}

// Format file size
function formatSize(bytes: number): string {
  if (bytes < 1024)
    return `${bytes} B`
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

// Format relative time
function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0)
    return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'just now'
}

// Get file extension
function getExtension(path: string): string {
  return path.split('.').pop()?.toLowerCase() || ''
}

// Calculate aspect ratio
function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const ratio = gcd(width, height)
  if (ratio > 3)
    return `${width / ratio}:${height / ratio}`
  return ''
}

// Asset preview component
function AssetPreview({ asset, textContent, detail = false }: { asset: AssetInfo, textContent?: string, detail?: boolean }) {
  if (asset.type === 'image') {
    return (
      <img
        src={asset.publicPath}
        alt={asset.path}
        className="max-h-full max-w-full object-contain"
      />
    )
  }

  if (asset.type === 'video') {
    return (
      <video
        src={asset.publicPath}
        autoPlay={detail}
        controls={detail}
        muted
        className="max-h-full max-w-full"
      />
    )
  }

  if (asset.type === 'audio') {
    if (!detail) {
      return (
        <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      )
    }
    return <audio src={asset.publicPath} controls className="w-full" />
  }

  if (asset.type === 'font') {
    return (
      <div className="text-2xl text-gray-700 dark:text-gray-300" style={{ fontFamily: `url(${asset.publicPath})` }}>
        Aa Bb Cc
      </div>
    )
  }

  if (asset.type === 'text' && textContent) {
    return (
      <pre className="max-h-48 w-full overflow-auto whitespace-pre-wrap break-all p-2 text-xs text-gray-600 font-mono dark:text-gray-400">
        {textContent}
      </pre>
    )
  }

  // Default icon for other types
  return (
    <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  )
}

// Asset grid item component
function AssetGridItem({ asset, onClick }: { asset: AssetInfo, onClick: () => void }) {
  const displayName = asset.path.split('/').pop() || asset.path

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 overflow-hidden rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <div className="h-24 w-24 flex items-center justify-center overflow-hidden border border-gray-200 rounded bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
        <AssetPreview asset={asset} />
      </div>
      <div className="w-full truncate text-center text-xs text-gray-600 dark:text-gray-400">
        {displayName}
      </div>
    </button>
  )
}

// Asset details drawer component
function AssetDetails({ asset, onClose }: { asset: AssetInfo, onClose: () => void }) {
  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null)
  const [textContent, setTextContent] = useState<string>('')

  useEffect(() => {
    // Fetch image meta for images
    if (asset.type === 'image') {
      fetchApi(`/api/assets/image-meta?path=${encodeURIComponent(asset.filePath)}`)
        .then(res => res.json())
        .then(data => setImageMeta(data))
        .catch(() => setImageMeta(null))
    }

    // Fetch text content for text files
    if (asset.type === 'text') {
      fetchApi(`/api/assets/text-content?path=${encodeURIComponent(asset.filePath)}&limit=2000`)
        .then(res => res.json())
        .then(data => setTextContent(data.content || ''))
        .catch(() => setTextContent(''))
    }
  }, [asset])

  const aspectRatio = useMemo(() => {
    if (imageMeta?.width && imageMeta?.height) {
      return calculateAspectRatio(imageMeta.width, imageMeta.height)
    }
    return ''
  }, [imageMeta])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const supportsPreview = ['image', 'text', 'video', 'audio', 'font'].includes(asset.type)

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-neutral-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <span className="text-sm text-gray-900 font-medium dark:text-gray-100">Details</span>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 transition-colors dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Preview */}
        {supportsPreview && (
          <>
            <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              <span>Preview</span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="mb-4 max-h-72 overflow-auto border border-gray-200 rounded-lg bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center justify-center">
                <AssetPreview asset={asset} textContent={textContent} detail />
              </div>
            </div>
          </>
        )}

        {/* Details */}
        <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          <span>Details</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        </div>

        <table className="w-full table-fixed text-sm">
          <tbody>
            <tr>
              <td className="w-24 flex-shrink-0 whitespace-nowrap py-1.5 pr-4 text-right align-top text-gray-500">Filepath</td>
              <td className="py-1.5">
                <div className="break-all text-xs text-gray-900 font-mono dark:text-gray-100">{asset.filePath}</div>
              </td>
            </tr>
            <tr>
              <td className="w-24 flex-shrink-0 whitespace-nowrap py-1.5 pr-4 text-right align-top text-gray-500">Public Path</td>
              <td className="py-1.5">
                <div className="flex flex-wrap items-start gap-1">
                  <span className="break-all text-xs text-gray-900 font-mono dark:text-gray-100">{asset.publicPath}</span>
                  <div className="flex flex-shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(asset.publicPath)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Copy"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <a
                      href={asset.publicPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Open in Browser"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td className="w-24 flex-shrink-0 whitespace-nowrap py-1.5 pr-4 text-right align-top text-gray-500">Type</td>
              <td className="py-1.5 text-gray-900 capitalize dark:text-gray-100">{asset.type}</td>
            </tr>
            {imageMeta?.width && imageMeta?.height && (
              <tr>
                <td className="w-24 flex-shrink-0 whitespace-nowrap py-1.5 pr-4 text-right align-top text-gray-500">Image Size</td>
                <td className="py-1.5 text-gray-900 dark:text-gray-100">
                  {imageMeta.width}
                  {' '}
                  x
                  {' '}
                  {imageMeta.height}
                </td>
              </tr>
            )}
            {aspectRatio && (
              <tr>
                <td className="w-24 flex-shrink-0 whitespace-nowrap py-1.5 pr-4 text-right align-top text-gray-500">Aspect Ratio</td>
                <td className="py-1.5 text-gray-900 dark:text-gray-100">{aspectRatio}</td>
              </tr>
            )}
            <tr>
              <td className="w-24 flex-shrink-0 whitespace-nowrap py-1.5 pr-4 text-right align-top text-gray-500">File size</td>
              <td className="py-1.5 text-gray-900 dark:text-gray-100">{formatSize(asset.size)}</td>
            </tr>
            <tr>
              <td className="w-24 flex-shrink-0 whitespace-nowrap py-1.5 pr-4 text-right align-top text-gray-500">Last modified</td>
              <td className="break-words py-1.5 text-gray-900 dark:text-gray-100">
                {new Date(asset.mtime).toLocaleString()}
                {' '}
                <span className="text-gray-500">
                  (
                  {formatTimeAgo(asset.mtime)}
                  )
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Actions */}
        <div className="mb-2 mt-4 flex items-center gap-2 text-xs text-gray-500">
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          <span>Actions</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        </div>

        <div className="flex gap-2">
          <a
            href={asset.publicPath}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md bg-primary-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-primary-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
        </div>

        {/* Code Snippets for images */}
        {asset.type === 'image' && (
          <>
            <div className="mb-2 mt-4 flex items-center gap-2 text-xs text-gray-500">
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              <span>Code Snippet</span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="rounded-md bg-gray-100 p-3 dark:bg-gray-800">
              <div className="mb-2 text-xs text-gray-500">Plain Image</div>
              <pre className="overflow-auto whitespace-pre-wrap break-all text-xs text-gray-700 font-mono dark:text-gray-300">
                {imageMeta?.width
                  ? `<img\n  width="${imageMeta.width}"\n  height="${imageMeta.height}"\n  src="${asset.publicPath}"\n/>`
                  : `<img src="${asset.publicPath}" />`}
              </pre>
              <button
                type="button"
                onClick={() => handleCopy(imageMeta?.width
                  ? `<img width="${imageMeta.width}" height="${imageMeta.height}" src="${asset.publicPath}" />`
                  : `<img src="${asset.publicPath}" />`)}
                className="mt-2 text-xs text-primary-500 hover:text-primary-600"
              >
                Copy to clipboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export function AssetsPage() {
  const [assets, setAssets] = useState<AssetInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<AssetInfo | null>(null)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [filteredExtensions, setFilteredExtensions] = useState<string[]>([])
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  // Fetch assets
  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetchApi('/api/assets')
      if (response.ok) {
        const data = await response.json()
        setAssets(data)

        // Get all available extensions from assets
        const allExtensions = [...new Set(data.map((a: AssetInfo) => getExtension(a.path)).filter(Boolean))] as string[]

        // Determine which extensions to show by default
        const assetsConfig = getAssetsConfig()
        let defaultShown: string[]

        if (assetsConfig.files && assetsConfig.files.length > 0) {
          // User configured specific extensions - use them
          defaultShown = allExtensions.filter(ext => assetsConfig.files!.includes(ext))
        }
        else {
          // No config - use DEFAULT_ASSET_EXTENSIONS
          defaultShown = allExtensions.filter(ext => DEFAULT_ASSET_EXTENSIONS.includes(ext))
        }

        setFilteredExtensions(defaultShown)
      }
    }
    catch (e) {
      console.error('[Assets] Failed to fetch assets:', e)
    }
    finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  // Get unique extensions
  const uniqueExtensions = useMemo(() => {
    return [...new Set(assets.map(a => getExtension(a.path)).filter(Boolean))]
  }, [assets])

  // Filter assets
  const filteredAssets = useMemo(() => {
    let result = assets

    // Filter by search
    if (search) {
      const lowerSearch = search.toLowerCase()
      result = result.filter(a => a.path.toLowerCase().includes(lowerSearch))
    }

    // Filter by extension
    result = result.filter((a) => {
      const ext = getExtension(a.path)
      return !ext || filteredExtensions.includes(ext)
    })

    return result
  }, [assets, search, filteredExtensions])

  // Group by folder
  const assetsByFolder = useMemo(() => {
    const groups: Record<string, AssetInfo[]> = {}

    filteredAssets.forEach((asset) => {
      const parts = asset.relativePath.split('/')
      const folder = parts.length > 1 ? `${parts.slice(0, -1).join('/')}/` : '/'

      if (!groups[folder])
        groups[folder] = []
      groups[folder].push(asset)
    })

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredAssets])

  const toggleExtension = (ext: string) => {
    setFilteredExtensions((prev) => {
      if (prev.includes(ext)) {
        return prev.filter(e => e !== ext)
      }
      return [...prev, ext]
    })
  }

  const handleRefresh = async () => {
    try {
      setLoading(true)
      const response = await fetchApi('/api/assets/refresh')
      if (response.ok) {
        const data = await response.json()
        setAssets(data)
      }
    }
    catch (e) {
      console.error('[Assets] Failed to refresh assets:', e)
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex overflow-hidden bg-base">
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-700">
          <div className="flex flex-1 items-center gap-3">
            {/* Search */}
            <div className="relative max-w-md flex-1">
              <Input
                size="sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                prefix={(
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
                allowClear
                onClear={() => setSearch('')}
                block
              />
            </div>

            {/* Stats */}
            <div className="text-sm text-gray-500">
              {search && (
                <span>
                  {filteredAssets.length}
                  {' '}
                  matched ·
                  {' '}
                </span>
              )}
              <span>
                {assets.length}
                {' '}
                assets in total
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="relative rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                title="Filter by extension"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                {filteredExtensions.length > 0 && (
                  <span className="absolute -bottom-1 -right-2">
                    <Badge color="primary" size="sm" count={filteredExtensions.length} />
                  </span>
                )}
              </button>

              {/* Filter dropdown */}
              {showFilterMenu && (
                <div className="absolute right-0 z-10 mt-1 w-48 border border-gray-200 rounded-md bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  {uniqueExtensions.map(ext => (
                    <div
                      key={ext}
                      className="px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Checkbox
                        label={ext}
                        checked={filteredExtensions.includes(ext)}
                        onChange={() => toggleExtension(ext)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* View toggle */}
            <button
              type="button"
              onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
              className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              title={view === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
            >
              {view === 'grid'
                ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  )
                : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  )}
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              title="Refresh"
            >
              <svg className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Assets grid */}
        <div className="flex-1 overflow-auto p-4">
          {loading && assets.length === 0
            ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-gray-500">Loading assets...</div>
                </div>
              )
            : filteredAssets.length === 0
              ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <svg className="mb-3 h-12 w-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>No assets found</span>
                  </div>
                )
              : view === 'grid'
                ? (
                    <div className="space-y-6">
                      {assetsByFolder.map(([folder, items]) => (
                        <div key={folder}>
                          <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-sm text-gray-900 font-medium dark:text-gray-100">{folder}</h3>
                            <span className="text-xs text-gray-500">
                              {items.length}
                              {' '}
                              items
                            </span>
                          </div>
                          <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-2">
                            {items.map(asset => (
                              <AssetGridItem
                                key={asset.filePath}
                                asset={asset}
                                onClick={() => setSelectedAsset(asset)}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredAssets.map(asset => (
                        <button
                          key={asset.filePath}
                          type="button"
                          onClick={() => setSelectedAsset(asset)}
                          className="w-full flex items-center gap-3 px-2 py-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <div className="h-10 w-10 flex flex-shrink-0 items-center justify-center overflow-hidden border border-gray-200 rounded bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                            <AssetPreview asset={asset} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm text-gray-900 dark:text-gray-100">{asset.path}</div>
                            <div className="text-xs text-gray-500">{formatSize(asset.size)}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
        </div>
      </div>

      {/* Details drawer */}
      {selectedAsset && (
        <div className="w-80 border-l border-gray-200 dark:border-gray-700">
          <AssetDetails asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
        </div>
      )}
    </div>
  )
}
