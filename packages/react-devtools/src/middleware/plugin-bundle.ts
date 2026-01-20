/**
 * Plugin ESM bundle serving middleware
 * 插件 ESM bundle 服务中间件
 *
 * Serves pre-built ESM bundles from node_modules for DevTools plugins
 * 从 node_modules 提供预构建的 ESM bundles 给 DevTools 插件
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Resolve package.json path in node_modules
 * 在 node_modules 中解析 package.json 路径
 *
 * Searches from cwd upward to find the package in node_modules
 * 从 cwd 向上搜索以在 node_modules 中找到包
 */
function resolvePackageJson(packageName: string): string | null {
  let currentDir = process.cwd()

  while (currentDir !== path.dirname(currentDir)) {
    const packageJsonPath = path.join(currentDir, 'node_modules', packageName, 'package.json')
    if (fs.existsSync(packageJsonPath)) {
      return packageJsonPath
    }
    currentDir = path.dirname(currentDir)
  }

  return null
}

/**
 * Transform bare React and DevTools API imports to use globals
 * 将裸 React 和 DevTools API 导入转换为使用全局变量
 *
 * This transforms imports like:
 *   import { jsx } from "react/jsx-runtime"
 *   import React, { useState } from "react"
 *   import { createRoot } from "react-dom/client"
 *   import { defineDevToolsPlugin, usePluginRpc } from "@react-devtools-plus/api"
 *
 * Into code that uses the globals exposed by the DevTools client
 */
function transformReactImports(code: string): string {
  // Shim code that provides React modules from globals
  // The DevTools client exposes React, ReactDOM, and DevTools API via window
  const shimCode = `
// === React DevTools Plugin Shim ===
const __DEVTOOLS_REACT__ = window.React;
const __DEVTOOLS_REACT_DOM__ = window.ReactDOM;
const __DEVTOOLS_API__ = window.__REACT_DEVTOOLS_API__;
const __DEVTOOLS_JSX_RUNTIME__ = {
  jsx: __DEVTOOLS_REACT__.createElement,
  jsxs: __DEVTOOLS_REACT__.createElement,
  Fragment: __DEVTOOLS_REACT__.Fragment,
};
// === End Shim ===
`

  let transformed = code

  // Transform: import { jsx, jsxs, Fragment } from "react/jsx-runtime"
  // Match various forms of jsx-runtime imports
  transformed = transformed.replace(
    /import\s*\{([^}]+)\}\s*from\s*["']react\/jsx-runtime["'];?/g,
    (_, imports) => {
      const importList = imports.split(',').map((s: string) => s.trim())
      const assignments = importList.map((imp: string) => {
        const [name, alias] = imp.split(/\s+as\s+/).map((s: string) => s.trim())
        const localName = alias || name
        return `const ${localName} = __DEVTOOLS_JSX_RUNTIME__.${name};`
      }).join('\n')
      return assignments
    },
  )

  // Transform: import React from "react" or import React, { ... } from "react"
  // Also handles: import { useState, useEffect } from "react"
  transformed = transformed.replace(
    /import\s+(\w+)(?:\s*,\s*\{([^}]*)\})?\s*from\s*["']react["'];?/g,
    (_, defaultImport, namedImports) => {
      const parts: string[] = []

      if (defaultImport && defaultImport !== 'type') {
        parts.push(`const ${defaultImport} = __DEVTOOLS_REACT__;`)
      }

      if (namedImports) {
        const importList = namedImports.split(',').map((s: string) => s.trim()).filter(Boolean)
        for (const imp of importList) {
          const [name, alias] = imp.split(/\s+as\s+/).map((s: string) => s.trim())
          const localName = alias || name
          parts.push(`const ${localName} = __DEVTOOLS_REACT__.${name};`)
        }
      }

      return parts.join('\n')
    },
  )

  // Transform: import { ... } from "react" (without default import)
  transformed = transformed.replace(
    /import\s*\{([^}]+)\}\s*from\s*["']react["'];?/g,
    (_, namedImports) => {
      const importList = namedImports.split(',').map((s: string) => s.trim()).filter(Boolean)
      const assignments = importList.map((imp: string) => {
        const [name, alias] = imp.split(/\s+as\s+/).map((s: string) => s.trim())
        const localName = alias || name
        return `const ${localName} = __DEVTOOLS_REACT__.${name};`
      }).join('\n')
      return assignments
    },
  )

  // Transform: import ReactDOM from "react-dom"
  transformed = transformed.replace(
    /import\s+(\w+)\s*from\s*["']react-dom["'];?/g,
    (_, defaultImport) => `const ${defaultImport} = __DEVTOOLS_REACT_DOM__;`,
  )

  // Transform: import { ... } from "react-dom"
  transformed = transformed.replace(
    /import\s*\{([^}]+)\}\s*from\s*["']react-dom["'];?/g,
    (_, namedImports) => {
      const importList = namedImports.split(',').map((s: string) => s.trim()).filter(Boolean)
      const assignments = importList.map((imp: string) => {
        const [name, alias] = imp.split(/\s+as\s+/).map((s: string) => s.trim())
        const localName = alias || name
        return `const ${localName} = __DEVTOOLS_REACT_DOM__.${name};`
      }).join('\n')
      return assignments
    },
  )

  // Transform: import { createRoot } from "react-dom/client"
  transformed = transformed.replace(
    /import\s*\{([^}]+)\}\s*from\s*["']react-dom\/client["'];?/g,
    (_, namedImports) => {
      const importList = namedImports.split(',').map((s: string) => s.trim()).filter(Boolean)
      const assignments = importList.map((imp: string) => {
        const [name, alias] = imp.split(/\s+as\s+/).map((s: string) => s.trim())
        const localName = alias || name
        return `const ${localName} = __DEVTOOLS_REACT_DOM__.${name};`
      }).join('\n')
      return assignments
    },
  )

  // Transform: import { defineDevToolsPlugin, usePluginRpc } from "@react-devtools-plus/api"
  transformed = transformed.replace(
    /import\s*\{([^}]+)\}\s*from\s*["']@react-devtools-plus\/api["'];?/g,
    (_, namedImports) => {
      const importList = namedImports.split(',').map((s: string) => s.trim()).filter(Boolean)
      const assignments = importList.map((imp: string) => {
        const [name, alias] = imp.split(/\s+as\s+/).map((s: string) => s.trim())
        const localName = alias || name
        return `const ${localName} = __DEVTOOLS_API__.${name};`
      }).join('\n')
      return assignments
    },
  )

  // Transform: import * as DevToolsApi from "@react-devtools-plus/api"
  transformed = transformed.replace(
    /import\s*\*\s*as\s+(\w+)\s+from\s*["']@react-devtools-plus\/api["'];?/g,
    (_, namespaceImport) => `const ${namespaceImport} = __DEVTOOLS_API__;`,
  )

  // Transform: import DevToolsApi from "@react-devtools-plus/api" (default import)
  transformed = transformed.replace(
    /import\s+(\w+)\s+from\s*["']@react-devtools-plus\/api["'];?/g,
    (_, defaultImport) => `const ${defaultImport} = __DEVTOOLS_API__;`,
  )

  // Only add shim if we transformed any imports
  if (transformed !== code) {
    return shimCode + transformed
  }

  return code
}

/**
 * Create middleware to serve plugin ESM bundles from node_modules
 * 创建中间件从 node_modules 提供插件 ESM bundles
 *
 * @example
 * URL format: /__react_devtools__/plugins/@scope/package/dist/index.mjs
 */
export function createPluginBundleMiddleware() {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = new URL(req.url || '', 'http://localhost')

    // Match /__react_devtools__/plugins/@scope/package/path/to/bundle.mjs
    // or /__react_devtools__/plugins/package/path/to/bundle.mjs
    const match = url.pathname.match(/^\/__react_devtools__\/plugins\/(.+)$/)
    if (!match) {
      return next()
    }

    const modulePath = match[1] // e.g., @scope/package/dist/index.mjs

    try {
      // Parse package name from module path
      // Scoped packages: @scope/package -> first two segments
      // Regular packages: package -> first segment
      let packageName: string
      let bundleRelativePath: string

      if (modulePath.startsWith('@')) {
        // Scoped package: @scope/package/rest/of/path
        const segments = modulePath.split('/')
        if (segments.length < 3) {
          res.statusCode = 400
          res.end(`Invalid scoped package path: ${modulePath}`)
          return
        }
        packageName = `${segments[0]}/${segments[1]}`
        bundleRelativePath = segments.slice(2).join('/')
      }
      else {
        // Regular package: package/rest/of/path
        const segments = modulePath.split('/')
        if (segments.length < 2) {
          res.statusCode = 400
          res.end(`Invalid package path: ${modulePath}`)
          return
        }
        packageName = segments[0]
        bundleRelativePath = segments.slice(1).join('/')
      }

      // Resolve package location in node_modules
      const packageJsonPath = resolvePackageJson(packageName)
      if (!packageJsonPath) {
        res.statusCode = 404
        res.end(`Package not found: ${packageName}`)
        return
      }

      const packageDir = path.dirname(packageJsonPath)
      const bundlePath = path.join(packageDir, bundleRelativePath)

      // Security check: ensure the resolved path is within the package directory
      if (!bundlePath.startsWith(packageDir)) {
        res.statusCode = 403
        res.end(`Access denied: path escapes package directory`)
        return
      }

      // Check if file exists
      if (!fs.existsSync(bundlePath)) {
        res.statusCode = 404
        res.end(`Plugin bundle not found: ${bundlePath}`)
        return
      }

      // Read and serve the bundle
      let content = fs.readFileSync(bundlePath, 'utf-8')

      // Transform React imports to use globals
      // This allows plugins to externalize React while sharing the host's React instance
      content = transformReactImports(content)

      res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Cache-Control', 'no-cache')
      res.end(content)
    }
    catch (e) {
      console.error('[React DevTools] Failed to load plugin bundle:', e)
      res.statusCode = 500
      res.end(`Failed to load plugin: ${e}`)
    }
  }
}
