/**
 * Try to open a file in the editor using URL protocol (fallback)
 */
function tryOpenWithProtocol(fileName: string, line: number, column: number): boolean {
  try {
    // Try to get editor from localStorage (user preference)
    const editor = localStorage.getItem('react_devtools_editor') || 'vscode'

    // Use URL protocol as fallback
    // Format: vscode://file/path/to/file:line:column
    const protocolUrl = `${editor}://file/${fileName}:${line}:${column}`

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

export function openInEditor(fileName: string, line: number, column: number) {
  const fileParam = encodeURIComponent(`${fileName}:${line}:${column}`)

  // Build list of endpoints to try
  const basePath = getDevToolsBasePath()
  const endpoints = [
    `/__open-in-editor?file=${fileParam}`, // Standard Vite/Webpack path
    `${basePath}/api/open-in-editor?file=${fileParam}`, // Next.js DevTools API path
  ]

  // Try each endpoint in order
  async function tryEndpoints(index: number): Promise<void> {
    if (index >= endpoints.length) {
      // All endpoints failed, try URL protocol as fallback
      console.warn('[React DevTools] All server endpoints failed, trying URL protocol fallback')
      tryOpenWithProtocol(fileName, line, column)
      return
    }

    const url = endpoints[index]
    try {
      const response = await fetch(url)
      if (response.ok) {
        return // Success!
      }
      // Try next endpoint
      await tryEndpoints(index + 1)
    }
    catch {
      // Try next endpoint
      await tryEndpoints(index + 1)
    }
  }

  tryEndpoints(0).catch((e) => {
    console.error('[React DevTools] Failed to open in editor:', e)
    tryOpenWithProtocol(fileName, line, column)
  })
}
