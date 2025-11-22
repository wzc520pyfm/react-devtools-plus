/**
 * Path utilities
 * 路径工具函数
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizePath } from 'vite'

// Constants
export const OVERLAY_ENTRY_ID = '\0react-devtools-overlay-entry'
export const OVERLAY_CHUNK_NAME = 'react-devtools-overlay'
export const VIRTUAL_PATH_PREFIX = 'virtual:react-devtools-path:'
export const DEVTOOLS_OPTIONS_ID = 'virtual:react-devtools-options'
export const RESOLVED_OPTIONS_ID = `\0${DEVTOOLS_OPTIONS_ID}`
export const STANDALONE_FLAG = '__REACT_DEVTOOLS_OVERLAY_STANDALONE__'

/**
 * Get plugin installation path
 * 获取插件安装路径
 */
export function getPluginPath(): string {
  const currentPath = normalizePath(path.dirname(fileURLToPath(import.meta.url)))
  return currentPath.replace(/\/dist$/, '/src')
}

/**
 * Get client distribution path
 * 获取客户端分发路径
 */
export function getClientPath(reactDevtoolsPath: string): string {
  const clientPath = path.resolve(reactDevtoolsPath, '../../react-devtools-client')
  const oldClientPath = path.resolve(reactDevtoolsPath, '../client')
  const clientDistPath = path.resolve(clientPath, 'dist')

  return (fs.existsSync(clientDistPath) && fs.existsSync(path.resolve(clientDistPath, 'index.html')))
    ? clientDistPath
    : oldClientPath
}

/**
 * Check if path is overlay-related
 * 检查路径是否与 overlay 相关
 */
export function isOverlayPath(id: string): boolean {
  return id.includes(OVERLAY_CHUNK_NAME) || id.includes('overlay')
}

/**
 * Resolve overlay virtual path to real path
 * 解析 overlay 虚拟路径到真实路径
 */
export function resolveOverlayPath(normalizedId: string, overlayDir: string, reactDevtoolsPath: string): string | null {
  if (!normalizedId.startsWith(VIRTUAL_PATH_PREFIX)) {
    return null
  }

  const pathPart = normalizedId.replace(VIRTUAL_PATH_PREFIX, '')
  const basePath = pathPart.replace(/\.mjs$/, '')
  const hasExtension = /\.(?:tsx?|jsx?)$/.test(basePath)

  const paths = [
    hasExtension ? path.join(overlayDir, basePath) : path.join(overlayDir, `${basePath}.tsx`),
    path.join(overlayDir, hasExtension ? basePath.replace(/\.tsx$/, '.ts') : `${basePath}.ts`),
    path.join(reactDevtoolsPath, 'overlay', pathPart),
  ]

  for (const p of paths) {
    if (fs.existsSync(p)) {
      return normalizePath(p)
    }
  }

  return normalizePath(path.join(reactDevtoolsPath, 'overlay', pathPart))
}

/**
 * Convert file path to editor format (with line and column)
 * 将文件路径转换为编辑器格式（带行号和列号）
 */
export function convertToEditorPath(
  filePath: string,
  line?: number,
  column?: number,
): string {
  const parts = [filePath]
  if (line !== undefined)
    parts.push(String(line))
  if (column !== undefined && line !== undefined)
    parts.push(String(column))
  return parts.join(':')
}

/**
 * Parse editor path (file:line:column) to components
 * 解析编辑器路径（file:line:column）为各个组成部分
 */
export function parseEditorPath(editorPath: string): {
  filePath: string
  line?: number
  column?: number
} {
  const parts = editorPath.split(':')
  const filePath = parts[0]
  const line = parts[1] ? Number.parseInt(parts[1], 10) : undefined
  const column = parts[2] ? Number.parseInt(parts[2], 10) : undefined
  
  return { filePath, line, column }
}

/**
 * Resolve relative path to absolute path based on project root
 * 将相对路径解析为基于项目根目录的绝对路径
 */
export function resolveRelativeToAbsolute(
  relativePath: string,
  projectRoot: string,
  sourcePathMode: 'absolute' | 'relative',
): string {
  if (sourcePathMode === 'absolute' || path.isAbsolute(relativePath)) {
    return relativePath
  }

  // For relative mode: "project/src/App.tsx" -> "/path/to/project/src/App.tsx"
  const segments = relativePath.split('/')
  const pathFromRoot = segments.length > 1 ? segments.slice(1).join('/') : relativePath
  return path.resolve(projectRoot, pathFromRoot)
}

