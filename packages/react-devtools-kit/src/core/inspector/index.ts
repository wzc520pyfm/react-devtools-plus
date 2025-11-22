import type { FiberNode } from '../../types'
import { hideHighlight, highlightNode } from '../fiber/highlight'
import { getFiberFromElement, getFiberId, shouldIncludeFiber } from '../fiber/utils'

let isInspectorEnabled = false
let inspectorMode: 'select-component' | 'open-in-editor' = 'select-component'

const selectCallbacks = new Set<(fiberId: string) => void>()
const openInEditorCallbacks = new Set<(fileName: string, line: number, column: number) => void>()

export function onInspectorSelect(callback: (fiberId: string) => void) {
  selectCallbacks.add(callback)
  return () => selectCallbacks.delete(callback)
}

export function onOpenInEditor(callback: (fileName: string, line: number, column: number) => void) {
  openInEditorCallbacks.add(callback)
  return () => openInEditorCallbacks.delete(callback)
}

function emitSelect(fiberId: string) {
  selectCallbacks.forEach(cb => cb(fiberId))
}

function emitOpenInEditor(fileName: string, line: number, column: number) {
  openInEditorCallbacks.forEach(cb => cb(fileName, line, column))
}

function findNearestComponentFiber(fiber: FiberNode | null): FiberNode | null {
  let current = fiber
  while (current) {
    // We want to find the nearest Component (not HostComponent) usually
    // So passing false to shouldIncludeFiber excludes HostComponents
    if (shouldIncludeFiber(current, false)) {
      return current
    }
    current = current.return
  }
  return null
}

function findSourceFiber(fiber: FiberNode | null): FiberNode | null {
  let current = fiber
  while (current) {
    if (current._debugSource) {
      return current
    }
    current = current.return
  }
  return null
}

// Parse data-source-path attribute value
// Format: "path/to/file.tsx:line:column"
function parseSourcePath(sourcePath: string): { fileName: string, lineNumber: number, columnNumber: number } | null {
  const lastColon = sourcePath.lastIndexOf(':')
  if (lastColon === -1)
    return null

  const secondLastColon = sourcePath.lastIndexOf(':', lastColon - 1)
  if (secondLastColon === -1)
    return null

  const fileName = sourcePath.substring(0, secondLastColon)
  const lineNumber = Number.parseInt(sourcePath.substring(secondLastColon + 1, lastColon), 10)
  const columnNumber = Number.parseInt(sourcePath.substring(lastColon + 1), 10)

  if (Number.isNaN(lineNumber) || Number.isNaN(columnNumber))
    return null

  return { fileName, lineNumber, columnNumber }
}

// Get source location from data-source-path attribute
function getSourceFromElement(element: Element | null): { fileName: string, lineNumber: number, columnNumber: number } | null {
  if (!element)
    return null

  // Try to get data-source-path from the element or its parents
  let current = element
  while (current && current !== document.body) {
    const sourcePath = current.getAttribute('data-source-path')
    if (sourcePath) {
      return parseSourcePath(sourcePath)
    }
    current = current.parentElement
  }

  return null
}

function handleMouseOver(e: MouseEvent) {
  if (!isInspectorEnabled)
    return

  const target = e.target as Element
  const fiber = getFiberFromElement(target)

  // Highlight logic depends on mode
  if (inspectorMode === 'select-component') {
    const componentFiber = findNearestComponentFiber(fiber)
    if (componentFiber) {
      highlightNode(componentFiber)
    }
    else {
      hideHighlight()
    }
  }
  else if (inspectorMode === 'open-in-editor') {
    // For open-in-editor, prefer data-source-path attribute over _debugSource
    const source = getSourceFromElement(target)

    if (source && fiber) {
      // Highlight the element with source info
      highlightNode(fiber, source)
    }
    else {
      // Fallback to _debugSource if data-source-path is not available
      const sourceFiber = findSourceFiber(fiber)
      if (sourceFiber) {
        const fallbackSource = sourceFiber._debugSource
          ? {
              fileName: sourceFiber._debugSource.fileName,
              lineNumber: sourceFiber._debugSource.lineNumber,
              columnNumber: sourceFiber._debugSource.columnNumber,
            }
          : undefined

        if (fiber) {
          highlightNode(fiber, fallbackSource)
        }
        else {
          highlightNode(sourceFiber, fallbackSource)
        }
      }
      else {
        hideHighlight()
      }
    }
  }
}

function handleClick(e: MouseEvent) {
  if (!isInspectorEnabled)
    return

  e.preventDefault()
  e.stopPropagation()

  const target = e.target as Element
  const fiber = getFiberFromElement(target)

  if (inspectorMode === 'select-component') {
    const componentFiber = findNearestComponentFiber(fiber)
    if (componentFiber) {
      const id = getFiberId(componentFiber)
      emitSelect(id)
      toggleInspector(false)
      hideHighlight()
    }
  }
  else if (inspectorMode === 'open-in-editor') {
    // Prefer data-source-path attribute over _debugSource
    const source = getSourceFromElement(target)

    if (source) {
      const { fileName, lineNumber, columnNumber } = source
      // console.log('[React DevTools] Opening in editor:', fileName, lineNumber, columnNumber)
      emitOpenInEditor(fileName, lineNumber, columnNumber)
      toggleInspector(false)
      hideHighlight()
    }
    else {
      // Fallback to _debugSource if data-source-path is not available
      const sourceFiber = findSourceFiber(fiber)
      if (sourceFiber && sourceFiber._debugSource) {
        const { fileName, lineNumber, columnNumber } = sourceFiber._debugSource
        // console.log('[React DevTools] Opening in editor (fallback):', fileName, lineNumber, columnNumber, 'from fiber:', sourceFiber)
        emitOpenInEditor(fileName, lineNumber, columnNumber)
        toggleInspector(false)
        hideHighlight()
      }
      else {
        // console.warn('[React DevTools] No source location found for element or fiber')
      }
    }
  }
}

export interface ToggleInspectorOptions {
  mode?: 'select-component' | 'open-in-editor'
}

export function toggleInspector(enabled: boolean, options: ToggleInspectorOptions = {}) {
  isInspectorEnabled = enabled
  if (options.mode) {
    inspectorMode = options.mode
  }

  if (enabled) {
    window.addEventListener('mouseover', handleMouseOver, true)
    window.addEventListener('click', handleClick, true)
    document.body.style.cursor = 'default'
  }
  else {
    window.removeEventListener('mouseover', handleMouseOver, true)
    window.removeEventListener('click', handleClick, true)
    document.body.style.cursor = ''
    hideHighlight()
  }
}
