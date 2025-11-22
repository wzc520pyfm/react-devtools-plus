/**
 * Open in editor middleware
 * 在编辑器中打开的中间件
 */

import { exec } from 'node:child_process'
import type { SourcePathMode } from '../config/types'
import { convertToEditorPath, parseEditorPath, resolveRelativeToAbsolute } from '../utils/paths'

/**
 * Open file in editor
 * 在编辑器中打开文件
 */
export async function openFileInEditor(
  filePath: string,
  projectRoot: string,
  sourcePathMode: SourcePathMode,
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Parse file:line:column
    const { filePath: file, line, column } = parseEditorPath(filePath)
    
    // Resolve to absolute path if needed
    const absolutePath = resolveRelativeToAbsolute(file, projectRoot, sourcePathMode)
    
    // Build editor path
    const editorPath = convertToEditorPath(absolutePath, line, column)
    
    // Get editor command from environment
    const editorCmd = process.env.EDITOR || 'cursor'
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
 */
export function createOpenInEditorMiddleware(
  projectRoot: string,
  sourcePathMode: SourcePathMode,
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
      res.status(400).send('Missing file parameter')
      return
    }

    try {
      await openFileInEditor(file, projectRoot, sourcePathMode)
      res.status(200).send('OK')
    }
    catch (error: any) {
      console.error('[React DevTools] Failed to execute editor command:', error.message)
      res.status(500).send('Failed to open editor')
    }
  }
}

