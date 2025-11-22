/**
 * Event bus for React DevTools
 * React DevTools 事件总线
 */

import type { DevToolsEvent } from './types'

type EventHandler<T = DevToolsEvent> = (event: T) => void
type Unsubscribe = () => void

/**
 * Event bus class
 * 事件总线类
 */
export class EventBus {
  private handlers: Map<string, Set<EventHandler>>

  constructor() {
    this.handlers = new Map()
  }

  /**
   * Subscribe to an event
   * 订阅事件
   */
  on<T extends DevToolsEvent['type']>(
    type: T,
    handler: EventHandler<Extract<DevToolsEvent, { type: T }>>,
  ): Unsubscribe {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }

    const handlers = this.handlers.get(type)!
    handlers.add(handler as EventHandler)

    // Return unsubscribe function
    return () => {
      handlers.delete(handler as EventHandler)
      if (handlers.size === 0) {
        this.handlers.delete(type)
      }
    }
  }

  /**
   * Subscribe to an event once
   * 订阅一次性事件
   */
  once<T extends DevToolsEvent['type']>(
    type: T,
    handler: EventHandler<Extract<DevToolsEvent, { type: T }>>,
  ): Unsubscribe {
    const wrappedHandler = (event: DevToolsEvent) => {
      handler(event as Extract<DevToolsEvent, { type: T }>)
      unsubscribe()
    }

    const unsubscribe = this.on(type, wrappedHandler as any)
    return unsubscribe
  }

  /**
   * Emit an event
   * 发送事件
   */
  emit(event: DevToolsEvent): void {
    const handlers = this.handlers.get(event.type)
    if (!handlers)
      return

    handlers.forEach((handler) => {
      try {
        handler(event)
      }
      catch (error) {
        console.error(`[React DevTools] Error in event handler for "${event.type}":`, error)
      }
    })
  }

  /**
   * Remove all event handlers
   * 移除所有事件处理器
   */
  clear(): void {
    this.handlers.clear()
  }

  /**
   * Remove all handlers for a specific event type
   * 移除特定事件类型的所有处理器
   */
  clearType(type: DevToolsEvent['type']): void {
    this.handlers.delete(type)
  }

  /**
   * Get number of handlers for an event type
   * 获取事件类型的处理器数量
   */
  getHandlerCount(type: DevToolsEvent['type']): number {
    return this.handlers.get(type)?.size || 0
  }

  /**
   * Check if there are any handlers for an event type
   * 检查是否有事件类型的处理器
   */
  hasHandlers(type: DevToolsEvent['type']): boolean {
    return this.getHandlerCount(type) > 0
  }
}

/**
 * Global event bus instance
 * 全局事件总线实例
 */
export const globalEventBus = new EventBus()

