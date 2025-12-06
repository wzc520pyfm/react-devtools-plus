import type { FiberNode, FiberRoot } from '../../types'

// Timeline event types
export interface TimelineEvent<TData = any> {
  id: number
  time: number
  data: TData
  title?: string
  subtitle?: string
  groupId?: number | string
  logType?: 'default' | 'warning' | 'error'
}

export interface TimelineLayer {
  id: string
  label: string
  color: string
  enabled: boolean
}

export interface TimelineLayersState {
  recordingState: boolean
  mouseEventEnabled: boolean
  keyboardEventEnabled: boolean
  componentEventEnabled: boolean
  performanceEventEnabled: boolean
  selected: string
}

// Default layers
export const TIMELINE_LAYERS: TimelineLayer[] = [
  { id: 'mouse', label: 'Mouse', color: '#A451AF', enabled: true },
  { id: 'keyboard', label: 'Keyboard', color: '#8151AF', enabled: true },
  { id: 'component-event', label: 'Component events', color: '#4FC08D', enabled: true },
  { id: 'performance', label: 'Performance', color: '#41B86A', enabled: true },
]

// Timeline state
let timelineState: TimelineLayersState = {
  recordingState: false,
  mouseEventEnabled: true,
  keyboardEventEnabled: true,
  componentEventEnabled: true,
  performanceEventEnabled: true,
  selected: 'mouse',
}

let eventIdCounter = 0
let groupIdCounter = 0

// Performance tracking maps
const perfGroupIds = new Map<string, { groupId: number, time: number }>()

type TimelineEventCallback = (layerId: string, event: TimelineEvent) => void
const timelineEventCallbacks = new Set<TimelineEventCallback>()

export function onTimelineEvent(callback: TimelineEventCallback) {
  timelineEventCallbacks.add(callback)
  return () => {
    timelineEventCallbacks.delete(callback)
  }
}

function emitTimelineEvent(layerId: string, event: TimelineEvent) {
  timelineEventCallbacks.forEach((callback) => {
    try {
      callback(layerId, event)
    }
    catch (e) {
      // Silently handle errors
    }
  })
}

export function getTimelineState(): TimelineLayersState {
  return { ...timelineState }
}

export function updateTimelineState(state: Partial<TimelineLayersState>) {
  timelineState = { ...timelineState, ...state }
}

export function clearTimeline() {
  eventIdCounter = 0
  groupIdCounter = 0
  perfGroupIds.clear()
}

// Mouse events
function addMouseEvent(eventType: string, x: number, y: number) {
  if (!timelineState.recordingState || !timelineState.mouseEventEnabled)
    return

  const event: TimelineEvent = {
    id: ++eventIdCounter,
    time: Date.now(),
    data: {
      type: eventType,
      x,
      y,
    },
    title: eventType,
  }

  emitTimelineEvent('mouse', event)
}

// Keyboard events
function addKeyboardEvent(eventType: string, key: string, modifiers: { ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean }) {
  if (!timelineState.recordingState || !timelineState.keyboardEventEnabled)
    return

  const event: TimelineEvent = {
    id: ++eventIdCounter,
    time: Date.now(),
    data: {
      type: eventType,
      key,
      ...modifiers,
    },
    title: key,
    subtitle: eventType,
  }

  emitTimelineEvent('keyboard', event)
}

// Component emit events (when user components emit custom events)
export function addComponentEvent(componentName: string, eventName: string, params?: any) {
  if (!timelineState.recordingState || !timelineState.componentEventEnabled)
    return

  const event: TimelineEvent = {
    id: ++eventIdCounter,
    time: Date.now(),
    data: {
      component: componentName,
      event: eventName,
      params,
    },
    title: eventName,
    subtitle: `by ${componentName}`,
  }

  emitTimelineEvent('component-event', event)
}

// Performance events
function getComponentName(fiber: FiberNode | null): string {
  if (!fiber)
    return 'Unknown'

  // Try to get the display name or name from the type
  const type = fiber.elementType || fiber.type
  if (!type)
    return 'Unknown'

  if (typeof type === 'string')
    return type

  return type.displayName || type.name || 'Anonymous'
}

export function addPerformanceEvent(
  type: 'render' | 'mount' | 'update' | 'unmount' | 'patch' | 'init',
  componentName: string,
  measure: 'start' | 'end',
  duration?: number,
  groupKey?: string,
) {
  if (!timelineState.recordingState || !timelineState.performanceEventEnabled)
    return

  let groupId: number | undefined

  if (groupKey) {
    if (measure === 'start') {
      groupId = ++groupIdCounter
      perfGroupIds.set(groupKey, { groupId, time: Date.now() })
    }
    else {
      const groupInfo = perfGroupIds.get(groupKey)
      if (groupInfo) {
        groupId = groupInfo.groupId
        if (!duration) {
          duration = Date.now() - groupInfo.time
        }
        perfGroupIds.delete(groupKey)
      }
    }
  }

  const event: TimelineEvent = {
    id: ++eventIdCounter,
    time: Date.now(),
    data: {
      component: componentName,
      type,
      measure,
      ...(duration !== undefined && {
        duration: {
          value: duration,
          display: `${duration.toFixed(2)} ms`,
        },
      }),
    },
    title: componentName,
    subtitle: type,
    groupId,
  }

  emitTimelineEvent('performance', event)
}

// Track fiber performance
const fiberPerfMap = new Map<string, { time: number, fiber: FiberNode }>()

export function trackFiberPerformanceStart(fiber: FiberNode, type: 'render' | 'mount' | 'update') {
  const componentName = getComponentName(fiber)
  const key = `${fiber.key || 'null'}-${componentName}-${type}`

  fiberPerfMap.set(key, { time: performance.now(), fiber })
  addPerformanceEvent(type, componentName, 'start', undefined, key)
}

export function trackFiberPerformanceEnd(fiber: FiberNode, type: 'render' | 'mount' | 'update') {
  const componentName = getComponentName(fiber)
  const key = `${fiber.key || 'null'}-${componentName}-${type}`

  const perfData = fiberPerfMap.get(key)
  if (perfData) {
    const duration = performance.now() - perfData.time
    fiberPerfMap.delete(key)
    addPerformanceEvent(type, componentName, 'end', duration, key)
  }
}

// Browser event listeners
let eventListenersInstalled = false

export function installTimelineEventListeners() {
  if (typeof window === 'undefined' || eventListenersInstalled)
    return

  eventListenersInstalled = true

  // Mouse events
  const mouseEvents = ['mousedown', 'mouseup', 'click', 'dblclick'] as const
  mouseEvents.forEach((eventType) => {
    window.addEventListener(eventType, (event: MouseEvent) => {
      addMouseEvent(eventType, event.clientX, event.clientY)
    }, { capture: true, passive: true })
  })

  // Keyboard events
  const keyboardEvents = ['keyup', 'keydown', 'keypress'] as const
  keyboardEvents.forEach((eventType) => {
    window.addEventListener(eventType, (event: KeyboardEvent) => {
      addKeyboardEvent(eventType, event.key, {
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
      })
    }, { capture: true, passive: true })
  })
}

