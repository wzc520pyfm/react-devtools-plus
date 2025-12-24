import type { FiberNode } from '../../types'
import { REACT_TAGS } from '../../types'
import { getDisplayName } from './utils'

const CONTAINER_ELEMENT_ID = '__react-devtools-component-inspector__'
const CARD_ELEMENT_ID = '__react-devtools-component-inspector__card__'
const COMPONENT_NAME_ELEMENT_ID = '__react-devtools-component-inspector__name__'
const INDICATOR_ELEMENT_ID = '__react-devtools-component-inspector__indicator__'
const SOURCE_FILE_ELEMENT_ID = '__react-devtools-component-inspector__source-file__'
const SOURCE_HINT_ELEMENT_ID = '__react-devtools-component-inspector__source-hint__'

let highlightHideTimer: number | undefined

const containerStyles: Partial<CSSStyleDeclaration> = {
  display: 'block',
  zIndex: '2147483640',
  position: 'fixed',
  backgroundColor: 'color-mix(in srgb, var(--color-primary-500, #61dafb), transparent 85%)',
  border: '1px solid color-mix(in srgb, var(--color-primary-500, #61dafb), transparent 50%)',
  borderRadius: '5px',
  transition: 'all 0.1s ease-in',
  pointerEvents: 'none',
}

// Common card styles
const baseCardStyles: Partial<CSSStyleDeclaration> = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  padding: '5px 8px',
  borderRadius: '4px',
  textAlign: 'left',
  position: 'absolute',
  left: '0',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '600',
  lineHeight: '24px',
  backgroundColor: 'var(--color-primary-500, #61dafb)',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  whiteSpace: 'nowrap',
}

const cardStyles: Partial<CSSStyleDeclaration> = {
  ...baseCardStyles,
}

// Styles for Open in Editor mode
const sourceCardStyles: Partial<CSSStyleDeclaration> = {
  ...baseCardStyles,
  fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
  padding: '6px 10px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
}

const indicatorStyles: Partial<CSSStyleDeclaration> = {
  display: 'inline-block',
  fontWeight: '400',
  fontStyle: 'normal',
  fontSize: '12px',
  opacity: '0.7',
  marginLeft: '6px',
}

const sourceFileStyles: Partial<CSSStyleDeclaration> = {
  fontSize: '12px',
  fontWeight: '500',
}

const sourceHintStyles: Partial<CSSStyleDeclaration> = {
  fontSize: '10px',
  opacity: '0.8',
  fontWeight: 'normal',
}

function getContainerElement(): HTMLElement | null {
  return document.getElementById(CONTAINER_ELEMENT_ID)
}

interface SourceInfo {
  fileName: string
  lineNumber: number
  columnNumber: number
}

function createHighlightElement(rect: DOMRect, name: string, source?: SourceInfo) {
  // Container
  const containerEl = document.createElement('div')
  containerEl.id = CONTAINER_ELEMENT_ID
  Object.assign(containerEl.style, containerStyles)

  // Card
  const cardEl = document.createElement('div') // Changed to div for flex layout
  cardEl.id = CARD_ELEMENT_ID

  if (source) {
    Object.assign(cardEl.style, sourceCardStyles)

    // Source File Info
    const sourceFileEl = document.createElement('div')
    sourceFileEl.id = SOURCE_FILE_ELEMENT_ID
    Object.assign(sourceFileEl.style, sourceFileStyles)
    cardEl.appendChild(sourceFileEl)

    // Hint
    const sourceHintEl = document.createElement('div')
    sourceHintEl.id = SOURCE_HINT_ELEMENT_ID
    Object.assign(sourceHintEl.style, sourceHintStyles)
    sourceHintEl.textContent = 'Click to go to the file'
    cardEl.appendChild(sourceHintEl)
  }
  else {
    Object.assign(cardEl.style, cardStyles)

    // Name
    const nameEl = document.createElement('span')
    nameEl.id = COMPONENT_NAME_ELEMENT_ID
    cardEl.appendChild(nameEl)

    // Indicator
    const indicatorEl = document.createElement('i')
    indicatorEl.id = INDICATOR_ELEMENT_ID
    Object.assign(indicatorEl.style, indicatorStyles)
    cardEl.appendChild(indicatorEl)
  }

  containerEl.appendChild(cardEl)
  document.body.appendChild(containerEl)

  updateHighlightElement(rect, name, source)
  return containerEl
}

function updateHighlightElement(rect: DOMRect, name: string, source?: SourceInfo) {
  let containerEl = getContainerElement()

  // If the mode changed (source vs no source), recreate the element
  const cardEl = document.getElementById(CARD_ELEMENT_ID)
  const hasSourceElement = document.getElementById(SOURCE_FILE_ELEMENT_ID)

  if (containerEl && ((!!source && !hasSourceElement) || (!source && hasSourceElement))) {
    containerEl.remove()
    containerEl = null
  }

  if (!containerEl) {
    createHighlightElement(rect, name, source)
    return
  }

  // Use Math.round to avoid sub-pixel rendering issues
  Object.assign(containerEl.style, {
    left: `${Math.round(rect.left * 100) / 100}px`,
    top: `${Math.round(rect.top * 100) / 100}px`,
    width: `${Math.round(rect.width * 100) / 100}px`,
    height: `${Math.round(rect.height * 100) / 100}px`,
    display: 'block',
    opacity: '1',
    backgroundColor: 'color-mix(in srgb, var(--color-primary-500, #61dafb), transparent 85%)',
    border: '1px solid color-mix(in srgb, var(--color-primary-500, #61dafb), transparent 50%)',
  })

  // Update Card Position (above or below)
  if (cardEl) {
    Object.assign(cardEl.style, {
      top: rect.top < 45 ? '100%' : 'auto',
      bottom: rect.top < 45 ? 'auto' : '100%',
      marginTop: rect.top < 45 ? '4px' : '0',
      marginBottom: rect.top < 45 ? '0' : '4px',
    })
  }

  if (source) {
    const sourceFileEl = document.getElementById(SOURCE_FILE_ELEMENT_ID)
    if (sourceFileEl) {
      // Format from HTML injection: react/src/App.tsx (includes project folder name)
      // We want to display: src/App.tsx (relative to project root)
      let cleanFileName = source.fileName

      // If path contains a project folder + src/*, extract from src onwards
      // Example: react/src/App.tsx -> src/App.tsx
      const segments = cleanFileName.split('/')
      const srcIndex = segments.findIndex(seg => seg === 'src')
      if (srcIndex > 0) {
        // Found src/, and there's at least one segment before it (project folder name)
        cleanFileName = segments.slice(srcIndex).join('/')
      }
      else if (segments.length > 1 && !cleanFileName.startsWith('/')) {
        // No src/ folder, but has multiple segments and not an absolute path
        // Assume first segment is project folder name, strip it
        cleanFileName = segments.slice(1).join('/')
      }

      sourceFileEl.textContent = `${cleanFileName}:${source.lineNumber}:${source.columnNumber}`
    }
  }
  else {
    // Update Content
    const nameEl = document.getElementById(COMPONENT_NAME_ELEMENT_ID)
    if (nameEl)
      nameEl.textContent = name === 'Element' ? 'Element' : `<${name}>`

    const indicatorEl = document.getElementById(INDICATOR_ELEMENT_ID)
    if (indicatorEl)
      indicatorEl.textContent = `${Math.round(rect.width * 100) / 100} x ${Math.round(rect.height * 100) / 100}`
  }
}

export function hideHighlight() {
  const highlight = getContainerElement()
  if (!highlight)
    return

  window.clearTimeout(highlightHideTimer)
  highlight.style.opacity = '0'
  highlightHideTimer = window.setTimeout(() => {
    highlight.style.display = 'none'
  }, 150)
}

export function showHighlight(rect: DOMRect, name: string, source?: SourceInfo) {
  const highlight = getContainerElement()
  window.clearTimeout(highlightHideTimer)

  if (highlight) {
    updateHighlightElement(rect, name, source)
  }
  else {
    createHighlightElement(rect, name, source)
  }
}

export function mergeClientRects(rects: DOMRect[]): DOMRect | null {
  if (!rects.length)
    return null
  let top = Number.POSITIVE_INFINITY
  let left = Number.POSITIVE_INFINITY
  let right = Number.NEGATIVE_INFINITY
  let bottom = Number.NEGATIVE_INFINITY
  rects.forEach((rect) => {
    top = Math.min(top, rect.top)
    left = Math.min(left, rect.left)
    right = Math.max(right, rect.right)
    bottom = Math.max(bottom, rect.bottom)
  })
  return new DOMRect(left, top, Math.max(0, right - left), Math.max(0, bottom - top))
}

function isInOverlay(node: unknown): boolean {
  if (!node || !(node instanceof Node))
    return false
  const overlayContainer = document.getElementById('react-devtools-overlay')
  return overlayContainer?.contains(node) ?? false
}

function collectHostElements(fiber: FiberNode | null, elements: Set<Element>, visited = new WeakSet<FiberNode>()) {
  if (!fiber || visited.has(fiber))
    return
  visited.add(fiber)

  // Skip overlay elements
  if (fiber.stateNode && isInOverlay(fiber.stateNode))
    return

  if (fiber.tag === REACT_TAGS.HostComponent && fiber.stateNode instanceof Element) {
    if (!isInOverlay(fiber.stateNode))
      elements.add(fiber.stateNode)
    return
  }
  if (fiber.tag === REACT_TAGS.HostText) {
    const parent = (fiber.stateNode as Text | null)?.parentElement
    if (parent && !isInOverlay(parent))
      elements.add(parent)
    return
  }

  // For fragments/components, traverse children
  let child = fiber.child
  while (child) {
    collectHostElements(child, elements, visited)
    child = child.sibling
  }
}

export function highlightNode(fiber: FiberNode | null, source?: SourceInfo) {
  if (!fiber) {
    hideHighlight()
    return
  }

  // If the fiber itself is a host component (DOM element), just use it directly
  if (fiber.tag === REACT_TAGS.HostComponent && fiber.stateNode instanceof Element) {
    const element = fiber.stateNode
    const rect = element.getBoundingClientRect()
    if (rect.width > 0 || rect.height > 0) {
      // Get component name if possible, or just tag name
      const name = fiber.type || element.tagName.toLowerCase()
      showHighlight(rect, name as string, source)
      return
    }
  }

  const elements = new Set<Element>()
  collectHostElements(fiber, elements)

  if (elements.size === 0) {
    hideHighlight()
    return
  }

  const rects = Array.from(elements)
    .map(element => element.getBoundingClientRect())
    .filter(rect => rect.width > 0 || rect.height > 0)

  const merged = mergeClientRects(rects)

  if (!merged || (merged.width === 0 && merged.height === 0)) {
    hideHighlight()
    return
  }

  const name = getDisplayName(fiber)
  showHighlight(merged, name, source)
}

export function cleanupHighlight() {
  const el = getContainerElement()
  el?.remove()
  window.clearTimeout(highlightHideTimer)
}

/**
 * Scroll the page to make the component visible
 */
export function scrollToNode(fiber: FiberNode | null) {
  if (!fiber)
    return

  // If the fiber itself is a host component (DOM element), scroll to it directly
  if (fiber.tag === REACT_TAGS.HostComponent && fiber.stateNode instanceof Element) {
    const element = fiber.stateNode
    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    return
  }

  // For non-host components, find the first host element
  const elements = new Set<Element>()
  collectHostElements(fiber, elements)

  if (elements.size === 0)
    return

  // Scroll to the first element
  const firstElement = Array.from(elements)[0]
  if (firstElement) {
    firstElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }
}
