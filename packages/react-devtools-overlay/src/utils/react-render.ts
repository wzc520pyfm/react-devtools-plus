/**
 * React Render Adapter for Overlay
 *
 * Provides unified rendering API that works with both:
 * - React 17 and below (legacy ReactDOM.render)
 * - React 18+ (createRoot)
 *
 * NOTE: This module uses window globals (React, ReactDOM) which are set up
 * by the react-devtools-globals script. This ensures compatibility with
 * the host application's React version.
 */

/**
 * Root reference that abstracts React 17/18 differences
 */
import { createRoot } from 'react-dom/client'

export interface ReactRootRef {
  /** Unmount the root */
  unmount: () => void
  /** Root style */
  type: 'createRoot' | 'legacy'
  /** Container element */
  container: HTMLElement
}

/**
 * Get React from window globals
 */
function getReact(): any {
  return typeof window !== 'undefined' ? (window as any).React : undefined
}

/**
 * Get ReactDOM from window globals
 */
function getReactDOM(): any {
  return typeof window !== 'undefined' ? (window as any).ReactDOM : undefined
}

/**
 * Check if React 18+ createRoot is available
 */
export function isReact18OrNewer(): boolean {
  const React = getReact()
  const version = React?.version || '0'
  const majorVersion = Number(version.split('.')[0])
  return majorVersion >= 18
}

/**
 * Check if createRoot function is available on ReactDOM
 */
function hasCreateRoot(): boolean {
  const ReactDOM = getReactDOM()
  return typeof ReactDOM?.createRoot === 'function'
}

/**
 * Check if legacy render function is available
 */
function hasLegacyRender(): boolean {
  const ReactDOM = getReactDOM()
  return typeof ReactDOM?.render === 'function'
}

/**
 * Render using React 18+ createRoot
 */
function renderWithCreateRoot(element: React.ReactElement, container: HTMLElement): ReactRootRef {
  const ReactDOM = getReactDOM()
  const root = ReactDOM.createRoot(container)
  root.render(element)
  return {
    unmount: () => root.unmount(),
    type: 'createRoot',
    container,
  }
}

/**
 * Render using legacy ReactDOM.render (React 17 and below)
 */
function renderWithLegacyRender(element: React.ReactElement, container: HTMLElement): ReactRootRef {
  const ReactDOM = getReactDOM()
  createRoot(container).render(element)
  return {
    unmount: () => {
      if (typeof ReactDOM.unmountComponentAtNode === 'function') {
        ReactDOM.unmountComponentAtNode(container)
      }
    },
    type: 'legacy',
    container,
  }
}

/**
 * Render React element to container, automatically choosing the right method
 *
 * @param element - React element to render
 * @param container - DOM container to render into
 * @returns Root reference or null if rendering failed
 */
export function renderToContainer(
  element: React.ReactElement,
  container: HTMLElement,
): ReactRootRef | null {
  // Try createRoot first for React 18+
  if (isReact18OrNewer() && hasCreateRoot()) {
    try {
      return renderWithCreateRoot(element, container)
    }
    catch (e) {
      console.warn('[React DevTools] createRoot failed, falling back to legacy render:', e)
    }
  }

  // Fail back to legacy render
  if (hasLegacyRender()) {
    try {
      return renderWithLegacyRender(element, container)
    }
    catch (e) {
      console.warn('[React DevTools] legacy render failed:', e)
    }
  }

  // Failed to render
  console.warn('[React DevTools] No suitable React render method found')
  return null
}

/**
 * Unmount a root reference
 */
export function unmountRoot(rootRef: ReactRootRef | null): void {
  if (!rootRef) {
    return
  }

  try {
    rootRef.unmount()
  }
  catch {
    // Silently handle unmount errors
  }
}
