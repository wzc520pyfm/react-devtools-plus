/**
 * Network Plugin Host Script
 * 网络插件宿主脚本
 *
 * This script runs in the host application's main thread to intercept network requests.
 * 此脚本运行在宿主应用的主线程中，用于拦截网络请求。
 */

import type { NetworkPluginOptions, NetworkRequest, NetworkStats } from './types'
import { defineHostPlugin } from '@react-devtools-plus/api'

// Request storage
const requests = new Map<string, NetworkRequest>()
let requestIdCounter = 0

export default defineHostPlugin({
  name: 'network-inspector',

  rpc: {
    /**
     * Get all recorded requests
     */
    getRequests(): NetworkRequest[] {
      return Array.from(requests.values())
    },

    /**
     * Get a specific request by ID
     */
    getRequest(id: string): NetworkRequest | undefined {
      return requests.get(id)
    },

    /**
     * Clear all requests
     */
    clearRequests(): void {
      requests.clear()
    },

    /**
     * Get network statistics
     */
    getStats(): NetworkStats {
      const all = Array.from(requests.values())
      return {
        total: all.length,
        success: all.filter(r => r.status && r.status < 400 && !r.error).length,
        error: all.filter(r => r.error || (r.status && r.status >= 400)).length,
        pending: all.filter(r => !r.endTime).length,
      }
    },
  },

  setup(ctx) {
    const options = ctx.getOptions<NetworkPluginOptions>()
    const maxRequests = options.maxRequests ?? 500
    const recordBody = options.recordBody ?? true

    /**
     * Check if URL should be ignored
     */
    const shouldIgnore = (url: string): boolean => {
      // Always ignore DevTools requests
      if (url.includes('__react_devtools__'))
        return true
      if (url.includes('__plugin-host__'))
        return true

      if (!options.ignore)
        return false

      return options.ignore.some((pattern) => {
        if (typeof pattern === 'string') {
          return url.includes(pattern)
        }
        return pattern.test(url)
      })
    }

    /**
     * Add a new request
     */
    const addRequest = (req: NetworkRequest) => {
      // Limit max requests
      if (requests.size >= maxRequests) {
        const oldestKey = requests.keys().next().value
        if (oldestKey) {
          requests.delete(oldestKey)
        }
      }
      requests.set(req.id, req)
      ctx.emit('request:add', req)
    }

    /**
     * Update an existing request
     */
    const updateRequest = (id: string, update: Partial<NetworkRequest>) => {
      const req = requests.get(id)
      if (req) {
        Object.assign(req, update)
        if (update.endTime && req.startTime) {
          req.duration = update.endTime - req.startTime
        }
        ctx.emit('request:update', req)
      }
    }

    // Intercept Fetch requests
    ctx.network.onFetch({
      onRequest(request) {
        if (shouldIgnore(request.url))
          return

        const id = `fetch-${++requestIdCounter}`
        // Store ID on request for later matching
        ;(request as any).__networkPluginId = id

        addRequest({
          id,
          url: request.url,
          method: request.method,
          startTime: Date.now(),
          type: 'fetch',
          requestHeaders: Object.fromEntries(request.headers.entries()),
        })
      },

      async onResponse(response, request) {
        const id = (request as any).__networkPluginId
        if (!id)
          return

        const update: Partial<NetworkRequest> = {
          status: response.status,
          statusText: response.statusText,
          endTime: Date.now(),
          responseHeaders: Object.fromEntries(response.headers.entries()),
        }

        // Record response body if enabled
        if (recordBody) {
          try {
            const cloned = response.clone()
            const contentType = response.headers.get('content-type') || ''

            if (contentType.includes('json')) {
              update.responseBody = await cloned.json()
            }
            else if (contentType.includes('text') || contentType.includes('html')) {
              const text = await cloned.text()
              // Limit text size
              update.responseBody = text.length > 10000 ? `${text.slice(0, 10000)}... (truncated)` : text
            }
          }
          catch {
            // Ignore body reading errors
          }
        }

        updateRequest(id, update)
      },

      onError(error, request) {
        const id = (request as any).__networkPluginId
        if (!id)
          return

        updateRequest(id, {
          error: error.message,
          endTime: Date.now(),
        })
      },
    })

    // Intercept XHR requests
    ctx.network.onXHR({
      onOpen(method, url, xhr) {
        if (shouldIgnore(url))
          return

        const id = `xhr-${++requestIdCounter}`
        ;(xhr as any).__networkPluginId = id

        addRequest({
          id,
          url,
          method,
          startTime: Date.now(),
          type: 'xhr',
        })
      },

      onLoad(xhr) {
        const id = (xhr as any).__networkPluginId
        if (!id)
          return

        const update: Partial<NetworkRequest> = {
          status: xhr.status,
          statusText: xhr.statusText,
          endTime: Date.now(),
        }

        if (recordBody) {
          try {
            const text = xhr.responseText
            update.responseBody = text.length > 10000 ? `${text.slice(0, 10000)}... (truncated)` : text
          }
          catch {
            // Ignore
          }
        }

        updateRequest(id, update)
      },

      onError(xhr) {
        const id = (xhr as any).__networkPluginId
        if (!id)
          return

        updateRequest(id, {
          error: 'Network Error',
          endTime: Date.now(),
        })
      },
    })

    // Monitor resource loading
    ctx.network.onResource((entry) => {
      if (shouldIgnore(entry.name))
        return

      const id = `resource-${++requestIdCounter}`
      addRequest({
        id,
        url: entry.name,
        method: 'GET',
        startTime: entry.startTime,
        endTime: entry.responseEnd,
        duration: entry.duration,
        type: 'resource',
        status: 200, // Assume success for loaded resources
      })
    })

    console.log('[Network Plugin] Host script initialized')
  },
})
