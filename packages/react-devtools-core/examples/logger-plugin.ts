/**
 * Example: Component Logger Plugin
 * 示例：组件日志插件
 *
 * This plugin logs all component lifecycle events
 * 此插件记录所有组件生命周期事件
 */

import type { DevToolsPlugin } from '../src/types'

interface LogEntry {
  timestamp: number
  type: string
  componentId: string
  details?: any
}

export const loggerPlugin: DevToolsPlugin = {
  id: 'component-logger',
  name: 'Component Logger',
  description: 'Log all component lifecycle events',

  // Plugin state
  logs: [] as LogEntry[],
  maxLogs: 500,
  filters: new Set<string>(), // Filter by component ID

  async setup(context) {
    console.log('[Logger Plugin] Initializing...')

    // Register custom RPC functions
    context.registerRPC('getLogs', () => {
      return this.logs
    })

    context.registerRPC('clearLogs', () => {
      this.logs = []
    })

    context.registerRPC('addFilter', (componentId: string) => {
      this.filters.add(componentId)
    })

    context.registerRPC('removeFilter', (componentId: string) => {
      this.filters.delete(componentId)
    })

    context.registerRPC('setMaxLogs', (max: number) => {
      this.maxLogs = max
    })

    // Helper function to add log entry
    const addLog = (type: string, componentId: string, details?: any) => {
      // Skip if filtered out
      if (this.filters.size > 0 && !this.filters.has(componentId)) {
        return
      }

      const entry: LogEntry = {
        timestamp: Date.now(),
        type,
        componentId,
        details,
      }

      this.logs.push(entry)

      // Keep only maxLogs entries
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(-this.maxLogs)
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Logger] ${type}:`, componentId, details)
      }
    }

    // Subscribe to all component events
    context.on('component-mounted', (event) => {
      addLog('mounted', event.componentId)
    })

    context.on('component-updated', (event) => {
      addLog('updated', event.componentId)
    })

    context.on('component-unmounted', (event) => {
      addLog('unmounted', event.componentId)
    })

    context.on('component-selected', (event) => {
      addLog('selected', event.componentId)
    })

    console.log('[Logger Plugin] Initialized successfully')
  },

  async teardown() {
    console.log('[Logger Plugin] Cleaning up...')
    this.logs = []
    this.filters.clear()
  },
}
