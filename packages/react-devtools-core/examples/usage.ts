/**
 * Example: Using React DevTools Core with Plugins
 * 示例：使用 React DevTools Core 和插件
 */

import {
  createBroadcastChannel,
  createClientRPC,
  globalPluginManager,
} from '../src'
import type { ClientFunctions } from '../src/types'
import { loggerPlugin } from './logger-plugin'
import { performancePlugin } from './performance-plugin'

// ============================================================
// Setup Client RPC
// 设置客户端 RPC
// ============================================================

// Define client functions
const clientFunctions: ClientFunctions = {
  async getComponentTree() {
    // In a real implementation, this would traverse the React Fiber tree
    return [
      {
        id: 'comp-1',
        name: 'App',
        type: 'function',
        props: {},
        children: ['comp-2', 'comp-3'],
        source: {
          fileName: '/src/App.tsx',
          lineNumber: 10,
          columnNumber: 5,
        },
      },
      {
        id: 'comp-2',
        name: 'Header',
        type: 'function',
        props: { title: 'My App' },
        children: [],
        parent: 'comp-1',
      },
      {
        id: 'comp-3',
        name: 'Content',
        type: 'function',
        props: {},
        children: [],
        parent: 'comp-1',
      },
    ]
  },

  async getComponentDetails(componentId: string) {
    // In a real implementation, this would get detailed info from Fiber
    return {
      id: componentId,
      name: 'App',
      type: 'function',
      props: {},
      children: [],
    }
  },

  async updateComponentProps(componentId: string, props: Record<string, any>) {
    console.log('Updating props for', componentId, props)
    // In a real implementation, this would update the component
  },

  async updateComponentState(componentId: string, state: Record<string, any>) {
    console.log('Updating state for', componentId, state)
    // In a real implementation, this would update the component state
  },

  async openInEditor(source) {
    console.log('Opening in editor:', source)
    // In a real implementation, this would send a request to open the file
  },

  async startProfiling() {
    console.log('Starting profiling...')
  },

  async stopProfiling() {
    console.log('Stopping profiling...')
    return []
  },

  async selectComponent(componentId: string) {
    console.log('Selecting component:', componentId)
    globalPluginManager.emit({ type: 'component-selected', componentId })
  },

  async highlightComponent(componentId?: string) {
    console.log('Highlighting component:', componentId)
    globalPluginManager.emit({ type: 'highlight-changed', componentId })
  },
}

// Create RPC channel
const channel = createBroadcastChannel('react-devtools')

// Create client RPC instance
const clientRPC = createClientRPC(clientFunctions, channel, {
  timeout: 30000,
  logging: true,
})

// ============================================================
// Setup Plugins
// 设置插件
// ============================================================

async function setupPlugins() {
  // Set up component data getters for plugins
  globalPluginManager.setComponentTreeGetter(clientFunctions.getComponentTree)
  globalPluginManager.setComponentDetailsGetter(clientFunctions.getComponentDetails)

  // Register plugins
  await globalPluginManager.register(loggerPlugin)
  await globalPluginManager.register(performancePlugin)

  console.log('All plugins registered!')
}

// ============================================================
// Example Usage
// 使用示例
// ============================================================

async function main() {
  // Setup
  await setupPlugins()

  // Simulate component events
  setTimeout(() => {
    globalPluginManager.emit({
      type: 'component-mounted',
      componentId: 'comp-1',
    })
  }, 1000)

  setTimeout(() => {
    globalPluginManager.emit({
      type: 'component-updated',
      componentId: 'comp-1',
    })
  }, 2000)

  // Call plugin RPC functions
  setTimeout(async () => {
    try {
      const logs = await globalPluginManager.callRPC('component-logger.getLogs')
      console.log('Component logs:', logs)

      const slowComponents = await globalPluginManager.callRPC('performance-monitor.getSlowComponents')
      console.log('Slow components:', slowComponents)
    }
    catch (error) {
      console.error('Error calling plugin RPC:', error)
    }
  }, 3000)

  // Cleanup after 5 seconds
  setTimeout(async () => {
    await globalPluginManager.cleanup()
    clientRPC.$close()
    console.log('Cleaned up!')
  }, 5000)
}

// Run example if this file is executed directly
if (require.main === module) {
  main().catch(console.error)
}

export { clientRPC, globalPluginManager }

