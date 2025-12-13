'use client'

import { useEffect } from 'react'

export interface DevToolsScriptProps {
  basePath?: string
  enabled?: boolean
}

// Extend Window interface for DevTools globals
declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: any
    __REACT_DEVTOOLS_CONFIG__?: any
    __REACT_DEVTOOLS_GLOBALS_READY__?: boolean
  }
}

export function DevToolsScript({ basePath = '/__react_devtools__', enabled = true }: DevToolsScriptProps = {}) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    // Initialize DevTools hook
    if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      const renderers = new Map()
      ;(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
        __IS_OUR_MOCK__: true, checkDCE() {}, supportsFiber: true, renderers,
        onScheduleFiberRoot() {}, onCommitFiberRoot() {}, onCommitFiberUnmount() {},
        inject(renderer: any) { const id = Math.random().toString(36).slice(2); renderers.set(id, renderer); return id },
      }
    }

    async function setupGlobals() {
      try {
        const React = await import('react')
        const ReactDOM = await import('react-dom')
        ;(window as any).React = React
        ;(window as any).ReactDOM = ReactDOM
        try {
          const ReactDOMClient = await import('react-dom/client')
          ;(window as any).ReactDOM = { ...ReactDOM, createRoot: ReactDOMClient.createRoot, hydrateRoot: ReactDOMClient.hydrateRoot }
        } catch {}
        ;(window as any).__REACT_DEVTOOLS_GLOBALS_READY__ = true
        window.dispatchEvent(new CustomEvent('react-devtools-globals-ready'))
      } catch (err) { console.warn('[React DevTools] Failed to setup globals:', err) }
    }

    function loadOverlay() {
      // Don't add trailing slash - Next.js handles it better without
      ;(window as any).__REACT_DEVTOOLS_CONFIG__ = { ...(window as any).__REACT_DEVTOOLS_CONFIG__, clientUrl: basePath }
      if (!document.getElementById('react-devtools-overlay-styles')) {
        const link = document.createElement('link'); link.id = 'react-devtools-overlay-styles'; link.rel = 'stylesheet'; link.href = `${basePath}/overlay.css`; document.head.appendChild(link)
      }
      const script = document.createElement('script'); script.type = 'module'; script.src = `${basePath}/overlay.mjs`; document.body.appendChild(script)
    }

    setupGlobals()
    if ((window as any).__REACT_DEVTOOLS_GLOBALS_READY__) loadOverlay()
    else window.addEventListener('react-devtools-globals-ready', loadOverlay, { once: true })
  }, [basePath, enabled])

  return null
}

export default DevToolsScript
