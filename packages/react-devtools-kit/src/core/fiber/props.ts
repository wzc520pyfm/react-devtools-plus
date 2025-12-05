/**
 * Props manipulation utilities for React components
 * 允许在运行时修改组件的 props
 */

import type { FiberNode } from '../../types'
import { getFiberById } from './tree'

/**
 * Parse a string value to the appropriate type
 */
export function parseValue(value: string, expectedType: string): any {
  switch (expectedType) {
    case 'number':
      return Number(value)
    case 'boolean':
      return value === 'true'
    case 'null':
      return null
    case 'undefined':
      return undefined
    case 'object':
    case 'array':
      try {
        return JSON.parse(value)
      }
      catch {
        return value
      }
    case 'string':
    default:
      // Remove surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
        return value.slice(1, -1)
      }
      return value
  }
}

/**
 * Find the React internal update mechanism for a fiber
 */
function getStateUpdater(fiber: FiberNode): ((newProps: any) => void) | null {
  // Try to find the component instance for class components
  if (fiber.stateNode && typeof fiber.stateNode.forceUpdate === 'function') {
    return (newProps: any) => {
      Object.assign(fiber.memoizedProps, newProps)
      Object.assign(fiber.pendingProps, newProps)
      fiber.stateNode.forceUpdate()
    }
  }

  // For function components, we need to trigger a re-render through React's internal mechanisms
  // We'll use a workaround by modifying props and triggering a state update if possible
  let currentFiber: FiberNode | null = fiber

  // Walk up the tree to find a component with state that can trigger re-render
  while (currentFiber) {
    // Check if this fiber has a queue (indicating it has state/hooks)
    const memoizedState = currentFiber.memoizedState
    if (memoizedState && memoizedState.queue) {
      const queue = memoizedState.queue
      // Found a state hook, we can use its dispatch to force update
      if (queue.dispatch) {
        return (newProps: any) => {
          // Update the props on the target fiber
          Object.assign(fiber.memoizedProps, newProps)
          Object.assign(fiber.pendingProps, newProps)
          // Trigger re-render by calling dispatch with current state
          // This is a hack but works for most cases
          try {
            queue.dispatch(memoizedState.memoizedState)
          }
          catch {
            // Fallback: try to use the alternate fiber
            if (fiber.alternate) {
              Object.assign(fiber.alternate.memoizedProps, newProps)
              Object.assign(fiber.alternate.pendingProps, newProps)
            }
          }
        }
      }
    }
    currentFiber = currentFiber.return
  }

  return null
}

/**
 * Set a prop value on a component
 * @param fiberId - The ID of the fiber to modify
 * @param propPath - The path to the prop (e.g., "title" or "style.color")
 * @param value - The new value (as string, will be parsed)
 * @param valueType - The expected type of the value
 * @returns true if successful, false otherwise
 */
export function setComponentProp(
  fiberId: string,
  propPath: string,
  value: string,
  valueType: string,
): boolean {
  const fiber = getFiberById(fiberId)
  if (!fiber) {
    console.warn(`[React DevTools] Fiber not found: ${fiberId}`)
    return false
  }

  const parsedValue = parseValue(value, valueType)
  const pathParts = propPath.split('.')

  // Build the new props object
  const newProps: any = {}
  let current = newProps
  let target = fiber.memoizedProps

  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i]
    current[part] = { ...(target?.[part] || {}) }
    current = current[part]
    target = target?.[part]
  }

  const lastPart = pathParts[pathParts.length - 1]
  current[lastPart] = parsedValue

  // Merge with existing props for nested paths
  if (pathParts.length > 1) {
    const firstPart = pathParts[0]
    newProps[firstPart] = {
      ...(fiber.memoizedProps?.[firstPart] || {}),
      ...newProps[firstPart],
    }
  }

  // Try to update the component
  const updater = getStateUpdater(fiber)
  if (updater) {
    try {
      updater(newProps)
      return true
    }
    catch (error) {
      console.warn('[React DevTools] Failed to update component:', error)
      return false
    }
  }

  // Fallback: directly modify props (may not trigger re-render)
  try {
    Object.assign(fiber.memoizedProps, newProps)
    Object.assign(fiber.pendingProps, newProps)

    // Also update alternate fiber if exists
    if (fiber.alternate) {
      Object.assign(fiber.alternate.memoizedProps, newProps)
      Object.assign(fiber.alternate.pendingProps, newProps)
    }

    console.warn('[React DevTools] Props modified but re-render may not be triggered')
    return true
  }
  catch (error) {
    console.warn('[React DevTools] Failed to modify props:', error)
    return false
  }
}

/**
 * Check if a prop is editable
 * Some props like 'children', 'key', 'ref' should not be edited
 */
export function isEditableProp(propName: string, valueType: string): boolean {
  // Non-editable props
  const nonEditableProps = ['children', 'key', 'ref', '$$typeof']
  if (nonEditableProps.includes(propName)) {
    return false
  }

  // Non-editable types
  const nonEditableTypes = ['element', 'function', 'symbol']
  if (nonEditableTypes.includes(valueType)) {
    return false
  }

  return true
}

