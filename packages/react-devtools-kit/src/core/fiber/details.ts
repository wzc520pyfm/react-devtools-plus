/**
 * Extract detailed component information from fiber for the inspector panel
 */

import type { ComponentDetails, FiberNode, HookInfo, PropValue, RenderedByInfo, SourceInfo } from '../../types'
import { REACT_TAGS } from '../../types'
import { getDisplayName, getFiberId } from './utils'

/**
 * Serialize a value into a displayable PropValue
 */
function serializeValue(value: any, depth = 0, maxDepth = 8): PropValue {
  // Check null/undefined first before depth check
  if (value === null) {
    return { type: 'null', value: 'null' }
  }

  if (value === undefined) {
    return { type: 'undefined', value: 'undefined' }
  }

  const type = typeof value

  // Primitive types don't need depth limiting
  if (type === 'string') {
    // Truncate very long strings
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

  // Only apply depth limit to complex types (objects/arrays)
  if (depth > maxDepth) {
    if (Array.isArray(value)) {
      return { type: 'array', value: `Array(${value.length})` }
    }
    return { type: 'object', value: 'Object' }
  }

  if (Array.isArray(value)) {
    const children: Record<string, PropValue> = {}
    // Serialize array items as children with index as key
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

    // Regular object - serialize all properties as children
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
 * Extract props from fiber
 */
function extractProps(fiber: FiberNode): Record<string, PropValue> {
  const props: Record<string, PropValue> = {}
  const memoizedProps = fiber.memoizedProps

  if (!memoizedProps || typeof memoizedProps !== 'object') {
    return props
  }

  for (const [key, value] of Object.entries(memoizedProps)) {
    // Skip children prop as it's usually large and shown separately
    if (key === 'children') {
      // Show a simplified version
      if (value) {
        if (Array.isArray(value)) {
          props[key] = { type: 'array', value: `[${value.length} children]` }
        }
        else if (typeof value === 'object' && (value as any).$$typeof) {
          const elementName = (value as any).type?.displayName || (value as any).type?.name || (value as any).type || 'Element'
          props[key] = { type: 'element', value: `<${elementName} />` }
        }
        else if (typeof value === 'string') {
          props[key] = { type: 'string', value: `"${value.slice(0, 50)}${value.length > 50 ? '...' : ''}"` }
        }
        else {
          props[key] = serializeValue(value)
        }
      }
      continue
    }

    props[key] = serializeValue(value)
  }

  return props
}

/**
 * Hook type names from React internals
 */
const HOOK_NAMES: Record<number, string> = {
  0: 'useState',
  1: 'useReducer',
  2: 'useContext',
  3: 'useRef',
  4: 'useEffect',
  5: 'useInsertionEffect',
  6: 'useLayoutEffect',
  7: 'useCallback',
  8: 'useMemo',
  9: 'useImperativeHandle',
  10: 'useDebugValue',
  11: 'useDeferredValue',
  12: 'useTransition',
  13: 'useMutableSource',
  14: 'useSyncExternalStore',
  15: 'useId',
  16: 'useCacheRefresh',
}

/**
 * Extract hooks from fiber's memoizedState
 */
function extractHooks(fiber: FiberNode): HookInfo[] {
  const hooks: HookInfo[] = []

  // Only function components have hooks
  if (fiber.tag !== REACT_TAGS.FunctionComponent
    && fiber.tag !== REACT_TAGS.ForwardRef
    && fiber.tag !== REACT_TAGS.SimpleMemoComponent
    && fiber.tag !== REACT_TAGS.MemoComponent) {
    return hooks
  }

  // Get debug hook types if available (React 18+)
  const debugHookTypes = fiber._debugHookTypes

  // Traverse the memoizedState linked list
  let hookState = fiber.memoizedState
  let hookIndex = 0

  while (hookState) {
    // Try to determine hook type
    let hookName = 'Hook'

    if (debugHookTypes && debugHookTypes[hookIndex]) {
      hookName = debugHookTypes[hookIndex]
    }
    else if (hookState.tag !== undefined && HOOK_NAMES[hookState.tag]) {
      hookName = HOOK_NAMES[hookState.tag]
    }
    else {
      // Heuristic detection based on shape
      if (hookState.queue !== undefined && hookState.baseState !== undefined) {
        hookName = 'useState'
      }
      else if (hookState.memoizedState !== undefined && hookState.deps !== undefined) {
        hookName = 'useMemo/useCallback'
      }
      else if (hookState.current !== undefined) {
        hookName = 'useRef'
      }
    }

    // Extract value
    let value: PropValue

    if (hookName === 'useState' || hookName === 'useReducer') {
      value = serializeValue(hookState.memoizedState)
    }
    else if (hookName === 'useRef') {
      value = serializeValue(hookState.memoizedState?.current)
    }
    else if (hookName === 'useContext') {
      value = serializeValue(hookState.memoizedState)
    }
    else if (hookName === 'useMemo' || hookName === 'useCallback' || hookName === 'useMemo/useCallback') {
      const memoValue = hookState.memoizedState
      if (Array.isArray(memoValue) && memoValue.length >= 1) {
        value = serializeValue(memoValue[0])
      }
      else {
        value = serializeValue(memoValue)
      }
    }
    else {
      value = { type: 'unknown', value: '...' }
    }

    hooks.push({
      name: hookName,
      value,
    })

    hookState = hookState.next
    hookIndex++
  }

  return hooks
}

/**
 * Extract parent component chain (rendered by)
 */
function extractRenderedBy(fiber: FiberNode): RenderedByInfo[] {
  const renderedBy: RenderedByInfo[] = []
  let parent = fiber.return
  let depth = 0
  const maxDepth = 10

  while (parent && depth < maxDepth) {
    // Only include meaningful components (not host elements, fragments, etc.)
    if (parent.tag === REACT_TAGS.FunctionComponent
      || parent.tag === REACT_TAGS.ClassComponent
      || parent.tag === REACT_TAGS.ForwardRef
      || parent.tag === REACT_TAGS.MemoComponent
      || parent.tag === REACT_TAGS.SimpleMemoComponent
      || parent.tag === REACT_TAGS.ContextProvider) {
      const name = getDisplayName(parent)
      if (name && name !== 'Anonymous') {
        renderedBy.push({
          id: getFiberId(parent),
          name,
          tag: parent.tag,
        })
      }
    }

    parent = parent.return
    depth++
  }

  return renderedBy
}

/**
 * Extract source location from fiber
 */
function extractSource(fiber: FiberNode): SourceInfo | undefined {
  if (fiber._debugSource) {
    return {
      fileName: fiber._debugSource.fileName,
      lineNumber: fiber._debugSource.lineNumber,
      columnNumber: fiber._debugSource.columnNumber,
    }
  }
  return undefined
}

/**
 * Get detailed information about a component from its fiber
 */
export function getComponentDetails(fiber: FiberNode): ComponentDetails {
  return {
    id: getFiberId(fiber),
    name: getDisplayName(fiber),
    tag: fiber.tag,
    props: extractProps(fiber),
    hooks: extractHooks(fiber),
    renderedBy: extractRenderedBy(fiber),
    source: extractSource(fiber),
    key: fiber.key,
  }
}
