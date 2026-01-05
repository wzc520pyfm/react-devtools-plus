/**
 * JetBrains IDEs that use the `open?file=` URL format
 */
const JETBRAINS_EDITORS = [
  'webstorm',
  'phpstorm',
  'idea',
  'intellij',
  'pycharm',
  'rubymine',
  'goland',
  'clion',
  'rider',
  'appcode',
  'datagrip',
  'dataspell',
]

/**
 * Build URL protocol for opening file in editor
 */
function buildEditorUrl(editor: string, fileName: string, line: number, column: number): string {
  const editorLower = editor.toLowerCase()

  // JetBrains IDEs use: webstorm://open?file=path&line=line&column=column
  if (JETBRAINS_EDITORS.some(ide => editorLower.includes(ide))) {
    return `${editor}://open?file=${encodeURIComponent(fileName)}&line=${line}&column=${column}`
  }

  // VSCode and others use: vscode://file/path:line:column
  return `${editor}://file/${fileName}:${line}:${column}`
}

/**
 * Get the configured editor
 * Priority: plugin config > localStorage > default 'vscode'
 */
function getConfiguredEditor(): string {
  // 1. Check plugin config (set via launchEditor option)
  const config = (window as any).__REACT_DEVTOOLS_CONFIG__
  if (config?.launchEditor) {
    return config.launchEditor
  }

  // 2. Check localStorage (user preference from UI)
  const localStorageEditor = localStorage.getItem('react_devtools_editor')
  if (localStorageEditor) {
    return localStorageEditor
  }

  // 3. Default to vscode
  return 'vscode'
}

/**
 * Try to open a file in the editor using URL protocol (fallback)
 */
function tryOpenWithProtocol(fileName: string, line: number, column: number): boolean {
  try {
    const editor = getConfiguredEditor()

    // Build URL based on editor type
    const protocolUrl = buildEditorUrl(editor, fileName, line, column)

    const link = document.createElement('a')
    link.href = protocolUrl
    link.click()
    link.remove()

    return true
  }
  catch (e) {
    console.warn('[React DevTools] Failed to open with URL protocol:', e)
    return false
  }
}

/**
 * Get the base path for DevTools API
 */
function getDevToolsBasePath(): string {
  // Check for DevTools config
  const config = (window as any).__REACT_DEVTOOLS_CONFIG__
  if (config?.clientUrl) {
    try {
      const url = new URL(config.clientUrl, window.location.origin)
      return url.pathname.replace(/\/$/, '')
    }
    catch {
      // Fall through
    }
  }

  // Try to detect from current page URL (if inside DevTools iframe)
  const pathname = window.location.pathname
  if (pathname.includes('/devtools')) {
    const match = pathname.match(/^(.*\/devtools)/)
    if (match) {
      return match[1]
    }
  }

  // Default path
  return '/__react_devtools__'
}

/**
 * Check if response is a valid API response (not HTML fallback from SPA)
 * SPA frameworks often return 200 + HTML for unknown routes due to fallback behavior
 */
function isValidApiResponse(response: Response): boolean {
  if (!response.ok) {
    return false
  }

  // Check Content-Type header to detect HTML fallback
  const contentType = response.headers.get('content-type') || ''

  // If Content-Type is HTML, it's likely a SPA fallback, not a real API response
  if (contentType.includes('text/html')) {
    return false
  }

  // Valid API responses typically have JSON, text/plain, or no content
  return true
}

export async function openInEditor(fileName: string, line: number, column: number) {
  const fileParam = encodeURIComponent(`${fileName}:${line}:${column}`)

  // Get configured editor to pass to server (allows localStorage preference to work server-side)
  const editor = getConfiguredEditor()
  const editorParam = encodeURIComponent(editor)

  // Build list of endpoints to try
  const basePath = getDevToolsBasePath()
  const endpoints = [
    `/__open-in-editor?file=${fileParam}&editor=${editorParam}`, // Standard Vite/Webpack path
    `${basePath}/api/open-in-editor?file=${fileParam}&editor=${editorParam}`, // Next.js DevTools API path
  ]

  // Try each endpoint in order
  for (const url of endpoints) {
    try {
      const response = await fetch(url)
      if (isValidApiResponse(response)) {
        return // Success!
      }
      // 404, non-ok status, or HTML fallback - try next endpoint
    }
    catch {
      // Network error, try next endpoint
    }
  }

  // All endpoints failed, try URL protocol as fallback
  console.warn('[React DevTools] All server endpoints failed, trying URL protocol fallback')
  tryOpenWithProtocol(fileName, line, column)
}
