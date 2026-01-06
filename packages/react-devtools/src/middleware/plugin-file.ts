import type { IncomingMessage, ServerResponse } from 'node:http'
import fs from 'node:fs'
import { transformSync } from '@babel/core'

export function createPluginFileMiddleware() {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const rawUrl = req.url || ''
    const url = new URL(rawUrl, 'http://localhost')

    // Log all requests to /__react_devtools__/ to debug
    if (rawUrl.includes('__react_devtools__')) {
      // console.log('[React DevTools] Middleware Request:', rawUrl, 'Pathname:', url.pathname)
    }

    // Strict match for the file path
    if (url.pathname === '/__react_devtools__/file') {
      const filePath = url.searchParams.get('path')
      if (!filePath) {
        console.error('[React DevTools] Plugin file middleware: Missing path parameter', req.url)
        res.statusCode = 400
        res.end('Missing path parameter')
        return
      }

      // console.log('[React DevTools] Processing plugin file:', filePath)

      try {
        const decodedPath = decodeURIComponent(filePath)

        if (!fs.existsSync(decodedPath)) {
          console.error('[React DevTools] Plugin file middleware: File not found', decodedPath)
          res.statusCode = 404
          res.end('File not found')
          return
        }

        const content = fs.readFileSync(decodedPath, 'utf-8')
        const isTs = decodedPath.endsWith('.ts') || decodedPath.endsWith('.tsx')
        const isJsx = decodedPath.endsWith('.jsx') || decodedPath.endsWith('.tsx')

        // Transform code
        const result = transformSync(content, {
          filename: decodedPath,
          presets: [
            ['@babel/preset-react', {
              runtime: 'classic', // Switch to classic runtime to avoid jsx-dev-runtime imports
              development: true,
            }],
            ['@babel/preset-typescript', { isTSX: isJsx, allExtensions: true, allowDeclareFields: true }],
          ],
          plugins: [
            // Simple plugin to rewrite "import React from 'react'" to "const React = window.React"
            function () {
              return {
                visitor: {
                  ImportDeclaration(path: any) {
                    // Rewrite React imports
                    if (path.node.source.value === 'react') {
                      const defaultSpecifier = path.node.specifiers.find(
                        (s: any) => s.type === 'ImportDefaultSpecifier',
                      )
                      if (defaultSpecifier) {
                        const localName = defaultSpecifier.local.name
                        path.replaceWith({
                          type: 'VariableDeclaration',
                          kind: 'const',
                          declarations: [
                            {
                              type: 'VariableDeclarator',
                              id: { type: 'Identifier', name: localName },
                              init: {
                                type: 'MemberExpression',
                                object: { type: 'Identifier', name: 'window' },
                                property: { type: 'Identifier', name: 'React' },
                              },
                            },
                          ],
                        })
                      }
                      else {
                        const namespaceSpecifier = path.node.specifiers.find(
                          (s: any) => s.type === 'ImportNamespaceSpecifier',
                        )
                        if (namespaceSpecifier) {
                          const localName = namespaceSpecifier.local.name
                          path.replaceWith({
                            type: 'VariableDeclaration',
                            kind: 'const',
                            declarations: [
                              {
                                type: 'VariableDeclarator',
                                id: { type: 'Identifier', name: localName },
                                init: {
                                  type: 'MemberExpression',
                                  object: { type: 'Identifier', name: 'window' },
                                  property: { type: 'Identifier', name: 'React' },
                                },
                              },
                            ],
                          })
                        }
                        else {
                          path.remove()
                        }
                      }
                    }
                  },
                },
              }
            },
          ],
        })

        res.setHeader('Content-Type', 'application/javascript')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.end(result?.code || '')
        return
      }
      catch (e) {
        console.error('[React DevTools] Failed to transform plugin file:', e)
        res.statusCode = 500
        res.end(JSON.stringify({ error: (e as Error).message }))
        return
      }
    }

    next()
  }
}
