/**
 * Open in editor middleware
 * 在编辑器中打开的中间件
 */

import type { SourcePathMode } from '../config/types'
import { exec } from 'node:child_process'
import { convertToEditorPath, parseEditorPath, resolveRelativeToAbsolute } from '../utils/paths'

/**
 * Open file in editor
 * 在编辑器中打开文件
 *
 * @param filePath - File path in format "path:line:column"
 * @param projectRoot - Project root directory
 * @param sourcePathMode - Path mode (absolute or relative)
 * @param launchEditor - Editor command to use (e.g., 'vscode', 'cursor', 'webstorm')
 */
export async function openFileInEditor(
  filePath: string,
  projectRoot: string,
  sourcePathMode: SourcePathMode,
  launchEditor?: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Parse file:line:column
    const { filePath: file, line, column } = parseEditorPath(filePath)

    // Resolve to absolute path if needed
    const absolutePath = resolveRelativeToAbsolute(file, projectRoot, sourcePathMode)

    // Build editor path
    const editorPath = convertToEditorPath(absolutePath, line, column)

    // Get editor command: launchEditor config > EDITOR env > default 'code'
    const editorCmd = launchEditor || process.env.EDITOR || 'code'
    const cmd = `${editorCmd} -g "${editorPath}"`

    exec(cmd, (error) => {
      if (error) {
        console.error('[React DevTools] Failed to open editor:', error)
        reject(error)
      }
      else {
        resolve()
      }
    })
  })
}

/**
 * Create Express/Connect middleware for handling open-in-editor requests
 * 创建用于处理"在编辑器中打开"请求的中间件
 *
 * @param projectRoot - Project root directory
 * @param sourcePathMode - Path mode (absolute or relative)
 * @param launchEditor - Editor command to use (e.g., 'vscode', 'cursor', 'webstorm')
 */
export function createOpenInEditorMiddleware(
  projectRoot: string,
  sourcePathMode: SourcePathMode,
  launchEditor?: string,
) {
  return async (req: any, res: any, next?: () => void) => {
    // Check if this is an open-in-editor request
    if (!req.url?.startsWith('/__open-in-editor')) {
      next?.()
      return
    }

    // Parse query parameters
    const url = new URL(req.url, `http://${req.headers.host}`)
    const file = url.searchParams.get('file')

    if (!file) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'text/plain')
      res.end('Missing file parameter')
      return
    }

    // Get editor from query parameter (passed from client, includes localStorage preference)
    const editorFromClient = url.searchParams.get('editor')

    // Priority: launchEditor config > client editor param > EDITOR env > default 'code'
    const effectiveEditor = launchEditor || editorFromClient || undefined

    try {
      await openFileInEditor(file, projectRoot, sourcePathMode, effectiveEditor)
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/plain')
      res.end('OK')
    }
    catch (error: any) {
      console.error('[React DevTools] Failed to execute editor command:', error.message)
      res.statusCode = 500
      res.setHeader('Content-Type', 'text/plain')
      res.end('Failed to open editor')
    }
  }
}
