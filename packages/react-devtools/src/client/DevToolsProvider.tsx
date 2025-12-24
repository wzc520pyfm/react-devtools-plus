'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'

/**
 * DevToolsProvider Props
 */
export interface DevToolsProviderProps {
  /**
   * Child components
   */
  children: ReactNode

  /**
   * Custom DevTools server URL
   * @default '/__react_devtools__'
   */
  devToolsUrl?: string

  /**
   * Whether to enable DevTools
   * @default true in development, false in production
   */
  enabled?: boolean
}

/**
 * DevToolsProvider Component for Next.js
 *
 * This component initializes React DevTools Plus in Next.js applications.
 * Wrap your root layout with this component to enable DevTools.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { DevToolsProvider } from 'react-devtools-plus/next'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <DevToolsProvider>{children}</DevToolsProvider>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
export function DevToolsProvider({
  children,
  devToolsUrl = '/__react_devtools__',
  enabled = true,
}: DevToolsProviderProps) {
  // DevTools is enabled by default (controlled by build-time bundling in production)
  const isEnabled = enabled

  useEffect(() => {
    if (!isEnabled)
      return
    if (typeof window === 'undefined')
      return

    // Initialize DevTools hook if not already present
    if (!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      const renderers = new Map()
      ;(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
        __IS_OUR_MOCK__: true,
        checkDCE() {},
        supportsFiber: true,
        renderers,
        onScheduleFiberRoot() {},
        onCommitFiberRoot() {},
        onCommitFiberUnmount() {},
        inject(renderer: any) {
          const id = Math.random().toString(36).slice(2)
          renderers.set(id, renderer)
          return id
        },
      }
    }

    // Setup React globals for overlay
    async function setupGlobals() {
      try {
        const React = await import('react')
        const ReactDOM = await import('react-dom')

        ;(window as any).React = React
        ;(window as any).ReactDOM = ReactDOM

        // Add createRoot for React 18+
        try {
          const ReactDOMClient = await import('react-dom/client')
          ;(window as any).ReactDOM = {
            ...ReactDOM,
            createRoot: ReactDOMClient.createRoot,
            hydrateRoot: ReactDOMClient.hydrateRoot,
          }
        }
        catch {
          // React 17 or earlier
        }

        // Signal ready
        ;(window as any).__REACT_DEVTOOLS_GLOBALS_READY__ = true
        window.dispatchEvent(new CustomEvent('react-devtools-globals-ready'))
      }
      catch (err) {
        console.warn('[React DevTools] Failed to setup globals:', err)
      }
    }

    // Load overlay script
    async function loadOverlay() {
      try {
        const overlayUrl = devToolsUrl.endsWith('/')
          ? `${devToolsUrl}overlay.mjs`
          : `${devToolsUrl}/overlay.mjs`

        const script = document.createElement('script')
        script.type = 'module'
        script.src = overlayUrl
        script.onerror = () => {
          console.debug(
            '[React DevTools] Overlay not available - DevTools server may not be running',
          )
        }
        document.body.appendChild(script)
      }
      catch (err) {
        console.debug('[React DevTools] Failed to load overlay:', err)
      }
    }

    // Initialize
    setupGlobals().then(() => {
      loadOverlay()
    })
  }, [isEnabled, devToolsUrl])

  return <>{children}</>
}

export default DevToolsProvider
