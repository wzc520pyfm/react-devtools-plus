/**
 * Example: Performance Monitoring Plugin
 * 示例：性能监控插件
 *
 * This plugin monitors component render performance and provides analytics
 * 此插件监控组件渲染性能并提供分析
 */

import type { DevToolsPlugin, PerformanceMetrics } from '../src/types'

export const performancePlugin: DevToolsPlugin = {
  id: 'performance-monitor',
  name: 'Performance Monitor',
  description: 'Monitor and analyze component render performance',

  // Plugin state
  metrics: [] as PerformanceMetrics[],
  slowComponents: new Set<string>(),
  threshold: 16, // 16ms (60fps)

  async setup(context) {
    console.log('[Performance Plugin] Initializing...')

    // Register custom RPC functions
    context.registerRPC('getSlowComponents', () => {
      return Array.from(this.slowComponents)
    })

    context.registerRPC('getPerformanceMetrics', () => {
      return this.metrics
    })

    context.registerRPC('clearMetrics', () => {
      this.metrics = []
      this.slowComponents.clear()
    })

    context.registerRPC('setThreshold', (threshold: number) => {
      this.threshold = threshold
    })

    // Subscribe to component update events
    context.on('component-updated', (event) => {
      // This would be called when a component updates
      // In a real implementation, we'd collect actual performance data
      const metric: PerformanceMetrics = {
        componentId: event.componentId,
        renderTime: Math.random() * 50, // Simulated render time
        updateCount: 1,
        timestamp: Date.now(),
      }

      this.metrics.push(metric)

      // Track slow components
      if (metric.renderTime > this.threshold) {
        this.slowComponents.add(event.componentId)

        // Emit custom event for slow renders
        context.emit({
          type: 'component-updated',
          componentId: event.componentId,
        })
      }

      // Keep only last 1000 metrics
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000)
      }
    })

    console.log('[Performance Plugin] Initialized successfully')
  },

  async teardown() {
    console.log('[Performance Plugin] Cleaning up...')
    this.metrics = []
    this.slowComponents.clear()
  },
}
