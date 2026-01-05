/**
 * Umi-specific integration for React DevTools Plus
 *
 * Umi uses its own dev server, not webpack-dev-server, so we need to
 * provide middlewares differently using Umi's plugin API.
 */

import type { ReactDevToolsPluginOptions } from '../config/types'
import fs from 'node:fs'
import path from 'node:path'
import { resolvePluginConfig } from '../config/normalize'
import { DIR_OVERLAY } from '../dir'
import {
  createAssetsMiddleware,
  createGraphMiddleware,
  createOpenInEditorMiddleware,
  createPluginFileMiddleware,
  createPluginsMiddleware,
  getWebpackModuleGraph,
  serveClient,
  setupWebpackModuleGraph,
} from '../middleware'
import { getClientPath, getPluginPath } from '../utils/paths'

// Type for Umi's IApi (simplified for compatibility)
interface IApi {
  addBeforeMiddlewares: (fn: () => any[]) => void
  chainWebpack: (fn: (memo: any, args: { env: string, webpack: any }) => any) => void
  addHTMLHeadScripts: (fn: () => any[]) => void
  addHTMLScripts: (fn: () => any[]) => void
  addEntryCodeAhead: (fn: () => string[]) => void
  onDevCompileDone: (fn: (opts: any) => void) => void
  cwd: string
  env: string
  logger: { info: (...args: any[]) => void }
}

/**
 * Create Umi plugin for React DevTools Plus
 *
 * @example
 * ```ts
 * // plugin.ts
 * import { createUmiPlugin } from 'react-devtools-plus/umi'
 *
 * export default createUmiPlugin({
 *   scan: { enabled: true }
 * })
 * ```
 */
export function createUmiPlugin(options: ReactDevToolsPluginOptions = {}) {
  return (api: IApi) => {
    const mode = api.env || 'development'
    const projectRoot = api.cwd
    const reactDevtoolsPath = getPluginPath()
    const clientPath = getClientPath(reactDevtoolsPath)

    // Resolve plugin config
    const pluginConfig = resolvePluginConfig(
      options,
      projectRoot,
      mode,
      mode === 'development' ? 'serve' : 'build',
    )

    if (!pluginConfig?.isEnabled) {
      return
    }

    api.logger.info('[React DevTools Plus] Plugin enabled')

    // Add dev server middlewares
    api.addBeforeMiddlewares(() => {
      const middlewares: any[] = []

      // Serve overlay script
      middlewares.push((req: any, res: any, next: any) => {
        if (req.url === '/__react_devtools__/overlay.mjs') {
          const overlayPath = path.join(DIR_OVERLAY, 'react-devtools-overlay.mjs')
          if (fs.existsSync(overlayPath)) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
            res.end(fs.readFileSync(overlayPath, 'utf-8'))
            return
          }
        }
        next()
      })

      // Plugins manifest API
      middlewares.push(
        createPluginsMiddleware(pluginConfig, (filePath) => {
          return `/__react_devtools__/file?path=${encodeURIComponent(filePath)}`
        }),
      )

      // Plugin file serving
      middlewares.push(createPluginFileMiddleware())

      // Graph API
      middlewares.push(
        createGraphMiddleware(getWebpackModuleGraph(), '/'),
      )

      // Open in editor API
      middlewares.push(
        createOpenInEditorMiddleware(
          pluginConfig.projectRoot,
          pluginConfig.sourcePathMode,
          pluginConfig.launchEditor,
        ),
      )

      // Assets API
      middlewares.push(
        createAssetsMiddleware({
          root: pluginConfig.projectRoot,
          publicDir: 'public',
          baseUrl: '/',
        }),
      )

      // DevTools client static files - only serve for /__react_devtools__ paths
      const sirvHandler = serveClient(clientPath)
      middlewares.push((req: any, res: any, next: any) => {
        // Only handle requests under /__react_devtools__
        if (req.url?.startsWith('/__react_devtools__') && !req.url?.includes('/overlay.mjs')) {
          // Rewrite URL to remove the prefix for sirv
          const originalUrl = req.url
          req.url = req.url.replace('/__react_devtools__', '') || '/'
          sirvHandler(req, res, () => {
            // Restore URL and continue to next middleware
            req.url = originalUrl
            next()
          })
        }
        else {
          next()
        }
      })

      return middlewares
    })

    // Setup webpack module graph collection via chainWebpack
    api.chainWebpack((memo, { env, webpack }) => {
      // Get the compiler when it's available
      memo.plugin('react-devtools-module-graph').use(
        class ReactDevToolsModuleGraphPlugin {
          apply(compiler: any) {
            setupWebpackModuleGraph(compiler, projectRoot)
            // Note: We don't inject entries here for Umi
            // Instead, we use addHTMLScripts to inject the overlay
          }
        },
      )

      return memo
    })

    // Automatically expose React and ReactDOM to window
    // This eliminates the need for users to manually write app.tsx
    api.addEntryCodeAhead(() => {
      return [
        `
// React DevTools Plus: Auto-expose React and ReactDOM to window
// This allows the overlay to render without manual user configuration
if (typeof window !== 'undefined') {
  try {
    if (!window.React) {
      window.React = require('react');
    }
  } catch (e) {
    // React not available via require, may be loaded via CDN
  }

  try {
    if (!window.ReactDOM) {
      var ReactDOM = require('react-dom');
      // Try to add createRoot support for React 18+
      try {
        var ReactDOMClient = require('react-dom/client');
        if (ReactDOMClient && ReactDOMClient.createRoot) {
          window.ReactDOM = Object.assign({}, ReactDOM, ReactDOMClient);
        } else {
          window.ReactDOM = ReactDOM;
        }
      } catch (e) {
        // react-dom/client not available (React 17 or earlier)
        window.ReactDOM = ReactDOM;
      }
    }
  } catch (e) {
    // ReactDOM not available via require, may be loaded via CDN
  }
}
`,
      ]
    })

    // Add DevTools initialization script to HTML head
    api.addHTMLHeadScripts(() => {
      const scripts: any[] = []

      // DevTools hook (must be first, before React loads)
      scripts.push({
        content: `
(function() {
  if (typeof window !== 'undefined' && !window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      renderers: new Map(),
      supportsFiber: true,
      inject: function(renderer) {
        var id = Math.random();
        this.renderers.set(id, renderer);
        return id;
      },
      onCommitFiberRoot: function() {},
      onCommitFiberUnmount: function() {},
    };
  }
})();
`,
      })

      return scripts
    })

    // Add overlay CSS and initialization script to body
    api.addHTMLScripts(() => {
      const scripts: any[] = []

      // Add CSS styles
      const cssPath = path.join(DIR_OVERLAY, 'react-devtools-overlay.css')
      if (fs.existsSync(cssPath)) {
        const cssContent = fs.readFileSync(cssPath, 'utf-8')
        scripts.push({
          content: `
(function() {
  if (typeof document !== 'undefined' && !document.getElementById('react-devtools-overlay-styles')) {
    var style = document.createElement('style');
    style.id = 'react-devtools-overlay-styles';
    style.textContent = ${JSON.stringify(cssContent)};
    document.head.appendChild(style);
  }
})();
`,
        })
      }

      // Load overlay script - React will be exposed via chainWebpack
      scripts.push({
        content: `
(function() {
  var maxAttempts = 100;
  var attempts = 0;

  function loadOverlay() {
    if (typeof window === 'undefined') return;

    attempts++;

    // Wait for React to be on window (exposed via webpack ProvidePlugin)
    if (!window.React || !window.ReactDOM) {
      if (attempts < maxAttempts) {
        setTimeout(loadOverlay, 50);
      } else {
        console.warn('[React DevTools] React not found on window after ' + maxAttempts + ' attempts');
      }
      return;
    }

    // Dynamically import the overlay module
    var script = document.createElement('script');
    script.type = 'module';
    script.src = '/__react_devtools__/overlay.mjs';
    script.onerror = function() {
      console.warn('[React DevTools] Failed to load overlay script');
    };
    document.body.appendChild(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadOverlay);
  } else {
    loadOverlay();
  }
})();
`,
      })

      return scripts
    })

    api.onDevCompileDone(() => {
      const panelShortcut = process.platform === 'darwin' ? 'Option(⌥)+Shift(⇧)+D' : 'Alt(⌥)+Shift(⇧)+D'
      api.logger.info(`[React DevTools Plus] Press ${panelShortcut} to toggle DevTools panel`)
    })
  }
}

export default createUmiPlugin
