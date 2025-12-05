/**
 * Context debugging utilities for React applications
 * 用于调试 React Context 的工具
 */

import type { FiberNode, FiberRoot, PropValue } from '../../types'
import { REACT_TAGS } from '../../types'
import { getDisplayName, getFiberId } from '../fiber/utils'

/**
 * Information about a Context Provider
 */
export interface ContextProviderInfo {
  id: string
  /** Display name of the context (e.g., "ThemeContext") */
  name: string
  /** Current value of the context */
  value: PropValue
  /** Fiber ID of the provider component */
  fiberId: string
  /** Number of consumers using this context */
  consumerCount: number
  /** List of consumer component names */
  consumers: ContextConsumerInfo[]
  /** Nested providers (same context type) */
  children: ContextProviderInfo[]
  /** Source location if available */
  source?: {
    fileName: string
    lineNumber: number
    columnNumber: number
  }
}

/**
 * Information about a Context Consumer
 */
export interface ContextConsumerInfo {
  id: string
  name: string
  fiberId: string
}

/**
 * Context tree structure for visualization
 */
export interface ContextTree {
  providers: ContextProviderInfo[]
  totalProviders: number
  totalConsumers: number
}

/**
 * Serialize a value into a displayable PropValue
 */
function serializeValue(value: any, depth = 0, maxDepth = 6): PropValue {
  if (value === null) {
    return { type: 'null', value: 'null' }
  }

  if (value === undefined) {
    return { type: 'undefined', value: 'undefined' }
  }

  const type = typeof value

  if (type === 'string') {
    const displayValue = value.length > 100 ? `${value.slice(0, 100)}...` : value
    return { type: 'string', value: `"${displayValue}"` }
  }

  if (type === 'number') {
    return { type: 'number', value: String(value) }
  }

  if (type === 'boolean') {
    return { type: 'boolean', value: String(value) }
  }

  if (type === 'function') {
    const name = value.name || 'anonymous'
    return { type: 'function', value: `ƒ ${name}()` }
  }

  if (type === 'symbol') {
    return { type: 'symbol', value: value.toString() }
  }

  if (depth > maxDepth) {
    if (Array.isArray(value)) {
      return { type: 'array', value: `Array(${value.length})` }
    }
    return { type: 'object', value: 'Object' }
  }

  if (Array.isArray(value)) {
    const children: Record<string, PropValue> = {}
    value.forEach((item, index) => {
      children[String(index)] = serializeValue(item, depth + 1, maxDepth)
    })

    return {
      type: 'array',
      value: `Array(${value.length})`,
      children: Object.keys(children).length > 0 ? children : undefined,
    }
  }

  if (type === 'object') {
    // Check if it's a React element
    if (value.$$typeof) {
      const elementName = value.type?.displayName || value.type?.name || value.type || 'Unknown'
      return { type: 'element', value: `<${elementName} />` }
    }

    const keys = Object.keys(value)
    const children: Record<string, PropValue> = {}

    for (const key of keys) {
      try {
        children[key] = serializeValue(value[key], depth + 1, maxDepth)
      }
      catch {
        children[key] = { type: 'unknown', value: '[Error]' }
      }
    }

    return {
      type: 'object',
      value: `Object`,
      preview: keys.length > 0 ? `{${keys.slice(0, 3).join(', ')}${keys.length > 3 ? ', ...' : ''}}` : '{}',
      children: Object.keys(children).length > 0 ? children : undefined,
    }
  }

  return { type: 'unknown', value: String(value) }
}

/**
 * Get the display name of a Context
 */
function getContextDisplayName(fiber: FiberNode): string {
  const contextType = fiber.type?._context || fiber.type
  if (!contextType)
    return 'Unknown Context'

  // Try to get displayName from context
  if (contextType.displayName)
    return contextType.displayName

  // Try to get name from Provider/Consumer
  if (contextType.Provider?.displayName)
    return contextType.Provider.displayName.replace('.Provider', '')

  if (contextType.Consumer?.displayName)
    return contextType.Consumer.displayName.replace('.Consumer', '')

  // Try to infer from the component that created it
  const componentName = getDisplayName(fiber)
  if (componentName && componentName !== 'Anonymous') {
    // Remove .Provider suffix if present
    return componentName.replace('.Provider', '').replace('.Consumer', '')
  }

  return 'Context'
}

/**
 * Get the context value from a Provider fiber
 */
function getContextValue(fiber: FiberNode): any {
  // For ContextProvider, the value is in memoizedProps.value
  if (fiber.memoizedProps && 'value' in fiber.memoizedProps) {
    return fiber.memoizedProps.value
  }
  return undefined
}

/**
 * Check if a fiber is a Context Provider
 */
function isContextProvider(fiber: FiberNode): boolean {
  return fiber.tag === REACT_TAGS.ContextProvider
}

/**
 * Check if a fiber is a Context Consumer
 */
function isContextConsumer(fiber: FiberNode): boolean {
  return fiber.tag === REACT_TAGS.ContextConsumer
}

/**
 * Find all consumers of a specific context type
 */
function findConsumers(
  fiber: FiberNode | null,
  contextType: any,
  consumers: ContextConsumerInfo[],
  visited: WeakSet<FiberNode>,
): void {
  if (!fiber || visited.has(fiber))
    return

  visited.add(fiber)

  // Check if this fiber uses the context
  if (fiber.tag === REACT_TAGS.ContextConsumer) {
    const fiberContextType = fiber.type?._context || fiber.type
    if (fiberContextType === contextType) {
      consumers.push({
        id: getFiberId(fiber),
        name: getDisplayName(fiber),
        fiberId: getFiberId(fiber),
      })
    }
  }

  // Also check for useContext hook usage in function components
  if (fiber.tag === REACT_TAGS.FunctionComponent
    || fiber.tag === REACT_TAGS.ForwardRef
    || fiber.tag === REACT_TAGS.MemoComponent
    || fiber.tag === REACT_TAGS.SimpleMemoComponent) {
    // Check if any hook reads this context
    let hookState = fiber.memoizedState
    while (hookState) {
      // useContext stores the context value directly
      // We check if the fiber has any context dependency
      if (hookState.memoizedState !== undefined) {
        const dependencies = fiber.dependencies
        if (dependencies?.firstContext) {
          let contextItem = dependencies.firstContext
          while (contextItem) {
            if (contextItem.context === contextType) {
              consumers.push({
                id: getFiberId(fiber),
                name: getDisplayName(fiber),
                fiberId: getFiberId(fiber),
              })
              break
            }
            contextItem = contextItem.next
          }
        }
      }
      hookState = hookState.next
    }
  }

  // Traverse children
  if (fiber.child) {
    findConsumers(fiber.child, contextType, consumers, visited)
  }

  // Traverse siblings
  if (fiber.sibling) {
    findConsumers(fiber.sibling, contextType, consumers, visited)
  }
}

/**
 * Build context provider info from a fiber
 */
function buildProviderInfo(fiber: FiberNode, visited: WeakSet<FiberNode>): ContextProviderInfo | null {
  if (!isContextProvider(fiber))
    return null

  const contextType = fiber.type?._context
  const consumers: ContextConsumerInfo[] = []

  // Find all consumers of this context
  if (fiber.child) {
    findConsumers(fiber.child, contextType, consumers, new WeakSet())
  }

  // Deduplicate consumers by id
  const uniqueConsumers = consumers.filter(
    (consumer, index, self) => index === self.findIndex(c => c.id === consumer.id),
  )

  const info: ContextProviderInfo = {
    id: getFiberId(fiber),
    name: getContextDisplayName(fiber),
    value: serializeValue(getContextValue(fiber)),
    fiberId: getFiberId(fiber),
    consumerCount: uniqueConsumers.length,
    consumers: uniqueConsumers,
    children: [],
    source: fiber._debugSource
      ? {
          fileName: fiber._debugSource.fileName,
          lineNumber: fiber._debugSource.lineNumber,
          columnNumber: fiber._debugSource.columnNumber,
        }
      : undefined,
  }

  // Find nested providers of the same context type
  const findNestedProviders = (child: FiberNode | null) => {
    if (!child || visited.has(child))
      return

    visited.add(child)

    if (isContextProvider(child) && child.type?._context === contextType) {
      const nestedInfo = buildProviderInfo(child, visited)
      if (nestedInfo) {
        info.children.push(nestedInfo)
      }
    }
    else {
      if (child.child)
        findNestedProviders(child.child)
      if (child.sibling)
        findNestedProviders(child.sibling)
    }
  }

  if (fiber.child) {
    findNestedProviders(fiber.child)
  }

  return info
}

/**
 * Collect all context providers from the fiber tree
 */
function collectProviders(
  fiber: FiberNode | null,
  providers: ContextProviderInfo[],
  visited: WeakSet<FiberNode>,
  processedContextTypes: Set<any>,
): void {
  if (!fiber || visited.has(fiber))
    return

  visited.add(fiber)

  if (isContextProvider(fiber)) {
    const contextType = fiber.type?._context
    // Only add top-level providers (not nested ones of the same type)
    if (contextType && !processedContextTypes.has(contextType)) {
      const info = buildProviderInfo(fiber, new WeakSet([fiber]))
      if (info) {
        providers.push(info)
        processedContextTypes.add(contextType)
      }
    }
  }

  // Traverse children
  if (fiber.child) {
    collectProviders(fiber.child, providers, visited, processedContextTypes)
  }

  // Traverse siblings
  if (fiber.sibling) {
    collectProviders(fiber.sibling, providers, visited, processedContextTypes)
  }
}

/**
 * Get the context tree from a fiber root
 */
export function getContextTree(root: FiberRoot): ContextTree {
  const providers: ContextProviderInfo[] = []
  const visited = new WeakSet<FiberNode>()
  const processedContextTypes = new Set<any>()

  if (root?.current?.child) {
    collectProviders(root.current.child, providers, visited, processedContextTypes)
  }

  // Calculate totals
  let totalConsumers = 0
  const countConsumers = (providerList: ContextProviderInfo[]) => {
    for (const provider of providerList) {
      totalConsumers += provider.consumerCount
      if (provider.children.length > 0) {
        countConsumers(provider.children)
      }
    }
  }
  countConsumers(providers)

  return {
    providers,
    totalProviders: providers.length,
    totalConsumers,
  }
}

/**
 * Get context info for a specific provider by fiber ID
 */
export function getContextProviderInfo(root: FiberRoot, fiberId: string): ContextProviderInfo | null {
  const tree = getContextTree(root)

  const findProvider = (providers: ContextProviderInfo[]): ContextProviderInfo | null => {
    for (const provider of providers) {
      if (provider.fiberId === fiberId)
        return provider
      const found = findProvider(provider.children)
      if (found)
        return found
    }
    return null
  }

  return findProvider(tree.providers)
}

/**
 * Get all contexts available in the application
 */
export function getAllContexts(root: FiberRoot): ContextTree {
  return getContextTree(root)
}

