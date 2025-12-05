/**
 * Graph middleware for module dependency visualization
 * 模块依赖图可视化中间件
 */

import type { Connect } from 'vite'

interface ModuleInfo {
  id: string
  deps: string[]
  virtual: boolean
}

/**
 * Create middleware for serving module graph data
 * 创建模块依赖图数据服务中间件
 */
export function createGraphMiddleware(
  getModuleGraph: () => Promise<{ modules: ModuleInfo[], root: string }>,
  base: string = '/',
): Connect.NextHandleFunction {
  // Use a separate API path that won't conflict with the client serving
  const apiPath = `${base}__react_devtools_api__/graph`.replace(/\/+/g, '/')

  return async (req, res, next) => {
    const url = req.url || ''

    // Check if the request matches our API path
    if (url === apiPath || url.startsWith(`${apiPath}?`)) {
      try {
        const data = await getModuleGraph()
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.end(JSON.stringify(data))
      }
      catch (error) {
        console.error('[React DevTools] Failed to get module graph:', error)
        res.statusCode = 500
        res.end(JSON.stringify({ error: 'Failed to get module graph' }))
      }
    }
    else {
      next()
    }
  }
}

/**
 * Get Vite module graph data
 * 获取 Vite 模块依赖图数据
 */
export function getViteModuleGraph(
  server: any,
  root: string,
): () => Promise<{ modules: ModuleInfo[], root: string }> {
  return async () => {
    const moduleGraph = server.moduleGraph
    if (!moduleGraph) {
      return { modules: [], root }
    }

    const modules: ModuleInfo[] = []
    const fileExtPattern = /\.(tsx?|jsx?|vue|json|css|scss|less|html)($|\?)/

    // Iterate through all modules in the graph
    for (const [, mod] of moduleGraph.idToModuleMap) {
      // Skip modules without a file or URL
      if (!mod.file && !mod.url)
        continue

      const id = mod.file || mod.url
      if (!id)
        continue

      // Filter to only include relevant file types
      if (!fileExtPattern.test(id))
        continue

      // Get dependencies
      const deps: string[] = []
      for (const importedMod of mod.importedModules) {
        const depId = importedMod.file || importedMod.url
        if (depId && fileExtPattern.test(depId)) {
          deps.push(depId)
        }
      }

      modules.push({
        id,
        deps,
        virtual: !mod.file || mod.url?.startsWith('\0') || mod.url?.includes('virtual:'),
      })
    }

    return { modules, root }
  }
}

