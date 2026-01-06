/**
 * Babel transformation for source code location injection
 * Babel转换 - 用于源码位置注入
 */

import type { NodePath } from '@babel/core'
import type { JSXOpeningElement } from '@babel/types'
import type { SourcePathMode } from '../config/types'
import path from 'node:path'
import { transformSync, types } from '@babel/core'

/**
 * Create Babel plugin for injecting source attributes
 * 创建用于注入源码属性的 Babel 插件
 */
export function createSourceAttributePlugin(projectRoot: string, pathMode: SourcePathMode) {
  return function sourceAttributePlugin() {
    return {
      name: 'react-devtools-source-attribute',
      visitor: {
        JSXOpeningElement(nodePath: NodePath<JSXOpeningElement>) {
          const loc = nodePath.node.loc
          if (!loc)
            return

          const filename = (this as any).file?.opts?.filename || ''
          if (!filename)
            return

          let finalPath = filename
          if (pathMode === 'relative' && path.isAbsolute(filename) && projectRoot) {
            const parentDir = path.dirname(projectRoot)
            finalPath = path.relative(parentDir, filename)
            finalPath = finalPath.split(path.sep).join('/')
          }

          nodePath.node.attributes.push(
            types.jsxAttribute(
              types.jsxIdentifier('data-source-path'),
              types.stringLiteral(`${finalPath}:${loc.start.line}:${loc.start.column}`),
            ),
          )
        },
      },
    }
  }
}

/**
 * Transform source code with Babel
 * 使用 Babel 转换源码
 */
export function transformSourceCode(
  code: string,
  id: string,
  enableInjection: boolean,
  projectRoot: string,
  sourcePathMode: SourcePathMode,
): { code: string, map: any } | null {
  // Only process JSX/TSX files
  if (!id.match(/\.[jt]sx$/))
    return null

  // Skip if injection is disabled
  if (!enableInjection)
    return null

  try {
    const result = transformSync(code, {
      filename: id,
      presets: [
        ['@babel/preset-react', { runtime: 'automatic' }],
        ['@babel/preset-typescript', { allowDeclareFields: true }],
      ],
      plugins: [createSourceAttributePlugin(projectRoot, sourcePathMode)],
      ast: true,
      sourceMaps: true,
      configFile: false,
      babelrc: false,
    })

    return result?.code ? { code: result.code, map: result.map } : null
  }
  catch (error) {
    console.error('[React DevTools] Babel transform error:', error)
    return null
  }
}

/**
 * Check if file should be processed
 * 检查文件是否应该被处理
 */
export function shouldProcessFile(id: string): boolean {
  if (id.includes('node_modules'))
    return false

  // Exclude HTML files
  if (id.endsWith('.html') || id.endsWith('.htm')) {
    return false
  }

  // Exclude asset files
  if (/\.(?:css|scss|sass|less|styl|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i.test(id)) {
    return false
  }

  return true
}
