import type { IncomingMessage, ServerResponse } from 'node:http'
import type { ResolvedPluginConfig, SerializedPlugin } from '../config/types'

/**
 * Plugins manifest middleware
 * 插件清单中间件
 *
 * Serves the plugins-manifest.json that tells the client what plugins to load
 * 提供 plugins-manifest.json 告诉客户端加载哪些插件
 */
export function createPluginsMiddleware(
  config: ResolvedPluginConfig,
  transformPath?: (path: string) => string,
) {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const rawUrl = req.url || ''
    const url = new URL(rawUrl, 'http://localhost')

    // We mount this middleware globally in both Vite and Webpack.
    // This ensures consistent behavior and allows us to strictly match the full path.
    const isMatch = url.pathname === '/__react_devtools__/plugins-manifest.json'

    if (isMatch) {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Access-Control-Allow-Origin', '*')

      // Transform plugins for client consumption
      const plugins = (config.plugins || []).map((plugin): SerializedPlugin => {
        // iframe plugins don't need transformation
        if (plugin.view.type === 'iframe') {
          return plugin
        }

        // Component plugins: transform local paths if needed
        // If src is a string (local path), apply transformPath
        if (typeof plugin.view.src === 'string' && transformPath) {
          return {
            ...plugin,
            view: {
              ...plugin.view,
              src: transformPath(plugin.view.src),
            },
          }
        }

        // src is an object (package metadata) - no transformation needed
        return plugin
      })

      res.end(JSON.stringify(plugins))
      return
    }
    next()
  }
}
