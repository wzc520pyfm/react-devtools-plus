/**
 * Graph middleware for module dependency visualization
 * 模块依赖图可视化中间件
 */

import type { Connect } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

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
 * State holder for Webpack module graph
 * 用于保存 Webpack 模块依赖图的状态
 */
let webpackModuleGraph: { modules: ModuleInfo[], root: string } = { modules: [], root: '' }

/**
 * Process webpack modules and add them to the modules array
 */
function processModules(
  statsModules: any[],
  modules: ModuleInfo[],
  fileExtPattern: RegExp,
): void {
  const moduleMap = new Map<string, { id: string, deps: string[], virtual: boolean }>()

  statsModules.forEach((mod: any) => {
    const id = mod.name || mod.identifier || ''
    if (!id)
      return

    if (!fileExtPattern.test(id))
      return

    if (id.startsWith('webpack/') || id.startsWith('(webpack)'))
      return

    const normalizedId = normalizeWebpackModulePath(id)
    if (!normalizedId)
      return

    const isVirtual = !mod.resource || id.includes('\0') || id.includes('virtual:')

    if (!moduleMap.has(normalizedId)) {
      moduleMap.set(normalizedId, {
        id: normalizedId,
        deps: [],
        virtual: isVirtual,
      })
    }

    if (mod.reasons && Array.isArray(mod.reasons)) {
      mod.reasons.forEach((reason: any) => {
        const depId = reason.moduleName || reason.moduleIdentifier || ''
        if (!depId)
          return
        if (!fileExtPattern.test(depId))
          return
        if (depId.startsWith('webpack/') || depId.startsWith('(webpack)'))
          return

        const normalizedDepId = normalizeWebpackModulePath(depId)
        if (normalizedDepId && normalizedDepId !== normalizedId) {
          if (!moduleMap.has(normalizedDepId)) {
            moduleMap.set(normalizedDepId, {
              id: normalizedDepId,
              deps: [],
              virtual: false,
            })
          }
          const depModule = moduleMap.get(normalizedDepId)!
          if (!depModule.deps.includes(normalizedId)) {
            depModule.deps.push(normalizedId)
          }
        }
      })
    }

    if (mod.issuer) {
      const issuerId = normalizeWebpackModulePath(mod.issuer)
      if (issuerId && issuerId !== normalizedId && fileExtPattern.test(mod.issuer)) {
        if (!moduleMap.has(issuerId)) {
          moduleMap.set(issuerId, {
            id: issuerId,
            deps: [],
            virtual: false,
          })
        }
        const issuerModule = moduleMap.get(issuerId)!
        if (!issuerModule.deps.includes(normalizedId)) {
          issuerModule.deps.push(normalizedId)
        }
      }
    }
  })

  // Merge into modules array
  moduleMap.forEach((mod) => {
    const existing = modules.find(m => m.id === mod.id)
    if (existing) {
      mod.deps.forEach((dep) => {
        if (!existing.deps.includes(dep)) {
          existing.deps.push(dep)
        }
      })
    }
    else {
      modules.push(mod)
    }
  })
}

/**
 * Setup Webpack compiler hooks to collect module graph
 * 设置 Webpack 编译器钩子来收集模块依赖图
 */
export function setupWebpackModuleGraph(compiler: any, root: string): void {
  const fileExtPattern = /\.(?:tsx?|jsx?|vue|json|css|scss|less|html)(?:$|\?)/

  // Use compilation hook to directly access modules (works better with Next.js)
  compiler.hooks.compilation.tap('react-devtools-graph', (compilation: any) => {
    // Use afterOptimizeModules hook to get the final module list
    compilation.hooks.afterOptimizeModules?.tap('react-devtools-graph', (compilationModules: any) => {
      try {
        const modules: ModuleInfo[] = []
        const moduleMap = new Map<string, ModuleInfo>()

        // Iterate through all modules in the compilation
        for (const mod of compilationModules) {
          // Get the resource path (actual file path)
          const resource = mod.resource || mod.userRequest || ''
          if (!resource)
            continue

          // Filter to only include relevant file types
          if (!fileExtPattern.test(resource))
            continue

          // Skip node_modules by default for performance
          const normalizedPath = resource.replace(/\\/g, '/')

          // Get module identifier
          const id = normalizedPath

          if (!moduleMap.has(id)) {
            moduleMap.set(id, {
              id,
              deps: [],
              virtual: !mod.resource,
            })
          }

          // Collect dependencies
          if (mod.dependencies) {
            for (const dep of mod.dependencies) {
              const depModule = compilation.moduleGraph?.getModule?.(dep)
              if (depModule) {
                const depResource = depModule.resource || depModule.userRequest || ''
                if (depResource && fileExtPattern.test(depResource)) {
                  const depId = depResource.replace(/\\/g, '/')
                  const currentModule = moduleMap.get(id)!
                  if (!currentModule.deps.includes(depId)) {
                    currentModule.deps.push(depId)
                  }
                }
              }
            }
          }
        }

        // Convert map to array
        moduleMap.forEach((mod) => {
          modules.push(mod)
        })

        if (modules.length > 0) {
          webpackModuleGraph = { modules, root }

          // Write to file for Next.js API routes
          try {
            const graphDir = path.join(root, '.next', 'cache', 'react-devtools')
            if (!fs.existsSync(graphDir)) {
              fs.mkdirSync(graphDir, { recursive: true })
            }
            const graphPath = path.join(graphDir, 'module-graph.json')
            fs.writeFileSync(graphPath, JSON.stringify(webpackModuleGraph, null, 2))
          }
          catch {
            // Silently ignore write errors
          }
        }
      }
      catch (error) {
        console.error('[React DevTools] Failed to collect module graph from compilation:', error)
      }
    })
  })

  // Also use done hook as fallback for stats-based collection
  compiler.hooks.done.tap('react-devtools-graph', (stats: any) => {
    // Skip if we already have modules from compilation hook
    if (webpackModuleGraph.modules.length > 0) {
      return
    }

    try {
      const modules: ModuleInfo[] = []

      // Handle multi-compiler stats (Next.js uses multiple compilers)
      const statsArray = stats.stats || [stats]

      for (const singleStats of statsArray) {
        // Check if toJson is available
        if (typeof singleStats.toJson !== 'function') {
          continue
        }

        // Request all module information including nested modules
        const statsData = singleStats.toJson({
          all: false,
          modules: true,
          reasons: true,
          children: true,
          nestedModules: true,
          dependentModules: true,
        })

        // Check children first (Next.js puts modules in children for client/server splits)
        if (statsData.children && Array.isArray(statsData.children) && statsData.children.length > 0) {
          for (const child of statsData.children) {
            if (child.modules && child.modules.length > 0) {
              processModules(child.modules, modules, fileExtPattern)
            }
          }
        }

        // Also check top-level modules
        if (statsData.modules && statsData.modules.length > 0) {
          processModules(statsData.modules, modules, fileExtPattern)
        }
      }

      if (modules.length > 0) {
        webpackModuleGraph = { modules, root }

        // Write module graph to file for Next.js API routes to read
        try {
          const graphDir = path.join(root, '.next', 'cache', 'react-devtools')
          if (!fs.existsSync(graphDir)) {
            fs.mkdirSync(graphDir, { recursive: true })
          }
          const graphPath = path.join(graphDir, 'module-graph.json')
          fs.writeFileSync(graphPath, JSON.stringify(webpackModuleGraph, null, 2))
        }
        catch {
          // Silently ignore write errors
        }
      }
    }
    catch (error) {
      console.error('[React DevTools] Failed to collect module graph:', error)
    }
  })
}

/**
 * Normalize webpack module path (remove loader prefixes, query strings, etc.)
 * 标准化 webpack 模块路径（移除 loader 前缀、查询字符串等）
 */
function normalizeWebpackModulePath(modulePath: string): string | null {
  if (!modulePath)
    return null

  // Remove loader prefix (e.g., "babel-loader!/path/to/file.js")
  let path = modulePath
  const loaderIndex = path.lastIndexOf('!')
  if (loaderIndex !== -1) {
    path = path.substring(loaderIndex + 1)
  }

  // Remove query string
  const queryIndex = path.indexOf('?')
  if (queryIndex !== -1) {
    path = path.substring(0, queryIndex)
  }

  // Remove leading "./", "!"
  path = path.replace(/^\.\//, '')
  path = path.replace(/^!+/, '')

  // Skip if path is empty or just a loader name
  if (!path || !path.includes('/'))
    return null

  return path
}

/**
 * Get Webpack module graph data
 * 获取 Webpack 模块依赖图数据
 */
export function getWebpackModuleGraph(): () => Promise<{ modules: ModuleInfo[], root: string }> {
  return async () => {
    return webpackModuleGraph
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
    const fileExtPattern = /\.(?:tsx?|jsx?|vue|json|css|scss|less|html)(?:$|\?)/

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
