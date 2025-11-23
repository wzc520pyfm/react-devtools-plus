/**
 * Plugin manager for React DevTools
 * React DevTools 插件管理器
 */

import type { ComponentNode, DevToolsEvent, DevToolsPlugin, PluginContext } from '../types'
import { EventBus } from '../events'

/**
 * Plugin manager class
 * 插件管理器类
 */
export class PluginManager {
  private plugins: Map<string, DevToolsPlugin>
  private contexts: Map<string, PluginContext>
  private eventBus: EventBus
  private rpcFunctions: Map<string, (...args: any[]) => any>
  private componentTreeGetter?: () => Promise<ComponentNode[]>
  private componentDetailsGetter?: (id: string) => Promise<ComponentNode | null>

  constructor() {
    this.plugins = new Map()
    this.contexts = new Map()
    this.eventBus = new EventBus()
    this.rpcFunctions = new Map()
  }

  /**
   * Register a plugin
   * 注册插件
   */
  async register(plugin: DevToolsPlugin): Promise<void> {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`[React DevTools] Plugin "${plugin.id}" is already registered`)
    }

    // Create plugin context
    const context = this.createContext(plugin.id)
    this.contexts.set(plugin.id, context)

    // Register plugin
    this.plugins.set(plugin.id, plugin)

    // Register plugin RPC functions
    if (plugin.rpc) {
      Object.entries(plugin.rpc).forEach(([name, fn]) => {
        const fullName = `${plugin.id}.${name}`
        this.rpcFunctions.set(fullName, fn)
      })
    }

    // Register plugin event handlers
    if (plugin.on) {
      Object.entries(plugin.on).forEach(([type, handler]) => {
        if (handler) {
          this.eventBus.on(type as DevToolsEvent['type'], handler as any)
        }
      })
    }

    // Call plugin setup
    if (plugin.setup) {
      try {
        await plugin.setup(context)
        console.log(`[React DevTools] Plugin "${plugin.name}" registered successfully`)
      }
      catch (error) {
        console.error(`[React DevTools] Failed to setup plugin "${plugin.name}":`, error)
        // Rollback registration
        this.plugins.delete(plugin.id)
        this.contexts.delete(plugin.id)
        throw error
      }
    }
  }

  /**
   * Unregister a plugin
   * 注销插件
   */
  async unregister(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      console.warn(`[React DevTools] Plugin "${pluginId}" is not registered`)
      return
    }

    // Call plugin teardown
    if (plugin.teardown) {
      try {
        await plugin.teardown()
      }
      catch (error) {
        console.error(`[React DevTools] Error during plugin teardown for "${plugin.name}":`, error)
      }
    }

    // Remove plugin RPC functions
    if (plugin.rpc) {
      Object.keys(plugin.rpc).forEach((name) => {
        const fullName = `${pluginId}.${name}`
        this.rpcFunctions.delete(fullName)
      })
    }

    // Remove plugin
    this.plugins.delete(pluginId)
    this.contexts.delete(pluginId)

    console.log(`[React DevTools] Plugin "${plugin.name}" unregistered`)
  }

  /**
   * Get a plugin by ID
   * 根据 ID 获取插件
   */
  get(pluginId: string): DevToolsPlugin | undefined {
    return this.plugins.get(pluginId)
  }

  /**
   * Get all plugins
   * 获取所有插件
   */
  getAll(): DevToolsPlugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Check if a plugin is registered
   * 检查插件是否已注册
   */
  has(pluginId: string): boolean {
    return this.plugins.has(pluginId)
  }

  /**
   * Get plugin context
   * 获取插件上下文
   */
  getContext(pluginId: string): PluginContext | undefined {
    return this.contexts.get(pluginId)
  }

  /**
   * Set component tree getter
   * 设置组件树获取器
   */
  setComponentTreeGetter(getter: () => Promise<ComponentNode[]>): void {
    this.componentTreeGetter = getter
  }

  /**
   * Set component details getter
   * 设置组件详情获取器
   */
  setComponentDetailsGetter(getter: (id: string) => Promise<ComponentNode | null>): void {
    this.componentDetailsGetter = getter
  }

  /**
   * Call plugin RPC function
   * 调用插件 RPC 函数
   */
  async callRPC<T = any>(name: string, ...args: any[]): Promise<T> {
    const fn = this.rpcFunctions.get(name)
    if (!fn) {
      throw new Error(`[React DevTools] RPC function "${name}" not found`)
    }

    try {
      return await fn(...args)
    }
    catch (error) {
      console.error(`[React DevTools] Error calling RPC function "${name}":`, error)
      throw error
    }
  }

  /**
   * Emit event to all plugins
   * 向所有插件发送事件
   */
  emit(event: DevToolsEvent): void {
    this.eventBus.emit(event)
  }

  /**
   * Subscribe to events
   * 订阅事件
   */
  on<T extends DevToolsEvent['type']>(
    type: T,
    handler: (event: Extract<DevToolsEvent, { type: T }>) => void,
  ): () => void {
    return this.eventBus.on(type, handler)
  }

  /**
   * Cleanup all plugins
   * 清理所有插件
   */
  async cleanup(): Promise<void> {
    const pluginIds = Array.from(this.plugins.keys())

    for (const pluginId of pluginIds) {
      await this.unregister(pluginId)
    }

    this.eventBus.clear()
    this.rpcFunctions.clear()
  }

  /**
   * Create plugin context
   * 创建插件上下文
   */
  private createContext(pluginId: string): PluginContext {
    return {
      getComponentTree: async () => {
        if (!this.componentTreeGetter) {
          throw new Error('[React DevTools] Component tree getter not set')
        }
        return this.componentTreeGetter()
      },

      getComponentDetails: async (componentId: string) => {
        if (!this.componentDetailsGetter) {
          throw new Error('[React DevTools] Component details getter not set')
        }
        return this.componentDetailsGetter(componentId)
      },

      emit: (event: DevToolsEvent) => {
        this.eventBus.emit(event)
      },

      on: <T extends DevToolsEvent['type']>(
        type: T,
        handler: (event: Extract<DevToolsEvent, { type: T }>) => void,
      ) => {
        return this.eventBus.on(type, handler)
      },

      registerRPC: <T extends (...args: any[]) => any>(name: string, fn: T) => {
        const fullName = `${pluginId}.${name}`
        this.rpcFunctions.set(fullName, fn)
      },

      callRPC: async <T = any>(name: string, ...args: any[]) => {
        return this.callRPC<T>(name, ...args)
      },
    }
  }
}

/**
 * Global plugin manager instance
 * 全局插件管理器实例
 */
export const globalPluginManager = new PluginManager()
