import { globalPluginManager } from '@react-devtools/core'
import { createRpcServer, getComponentDetails, getFiberById, getReactVersion, getRpcServer, hideHighlight, highlightNode, onInspectorSelect, onOpenInEditor, onTreeUpdated, openInEditor, rebuildTree, setIframeServerContext, toggleInspector } from '@react-devtools/kit'
import { useEffect, useRef } from 'react'

/**
 * Get DevTools client URL
 *
 * For singleSpa/micro-frontend scenarios, the clientUrl can be configured
 * via the plugin options. This allows the DevTools panel to load from
 * a different server (e.g., the child app's webpack-dev-server).
 */
function getDevToolsClientUrl() {
  // Check for custom clientUrl from plugin configuration
  const config = (window as any).__REACT_DEVTOOLS_CONFIG__
  if (config?.clientUrl) {
    const timestamp = Date.now()
    const url = config.clientUrl.endsWith('/')
      ? config.clientUrl
      : `${config.clientUrl}/`
    return `${url}?t=${timestamp}`
  }

  // Default: use current origin
  const origin = window.location.origin
  // Always resolve to absolute root path, ignoring current path subdirectories
  const path = '/__react_devtools__/'
  // Add timestamp to bust cache in development
  const timestamp = Date.now()
  return `${origin}${path}?t=${timestamp}`
}

function waitForClientInjection(iframe: HTMLIFrameElement, timeout = 10000): Promise<void> {
  return new Promise((resolve) => {
    iframe?.contentWindow?.postMessage('__REACT_DEVTOOLS_CREATE_CLIENT__', '*')

    const handler = (event: MessageEvent) => {
      if (event.data === '__REACT_DEVTOOLS_CLIENT_READY__') {
        window.removeEventListener('message', handler)
        resolve()
      }
    }

    window.addEventListener('message', handler)
    setTimeout(() => {
      window.removeEventListener('message', handler)
      resolve()
    }, timeout)
  })
}

export function useIframe(
  panelVisible: boolean,
  setPanelVisible: (visible: boolean) => void,
  setDragResizeEnabled?: (enabled: boolean) => void,
) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const rpcServerReadyRef = useRef(false)
  const pendingTreeRef = useRef<any>(null)
  const setPanelVisibleRef = useRef(setPanelVisible)
  const panelVisibleRef = useRef(panelVisible)

  useEffect(() => {
    setPanelVisibleRef.current = setPanelVisible
    panelVisibleRef.current = panelVisible
  }, [setPanelVisible, panelVisible])

  useEffect(() => {
    const dispose = onTreeUpdated((tree: any) => {
      const rpcServer = getRpcServer()
      if (rpcServer && (rpcServer as any).broadcast && rpcServerReadyRef.current) {
        try {
          const result = (rpcServer as any).broadcast.updateTree(tree)
          if (result && typeof result.then === 'function') {
            result.catch(() => {})
          }
          pendingTreeRef.current = null
        }
        catch (e) {
          // Silently handle errors
        }
      }
      else {
        pendingTreeRef.current = tree
      }
    })

    const disposeSelect = onInspectorSelect((fiberId) => {
      const rpcServer = getRpcServer()
      if (rpcServer && (rpcServer as any).broadcast && rpcServerReadyRef.current) {
        (rpcServer as any).broadcast.selectNode(fiberId).catch(() => {})
      }
      // Also open panel if not visible
      if (!panelVisibleRef.current) {
        setPanelVisibleRef.current(true)
      }
    })

    const disposeOpenInEditor = onOpenInEditor((fileName, line, column) => {
      // Also execute openInEditor directly in the overlay context (main page)
      openInEditor(fileName, line, column)

      const rpcServer = getRpcServer()
      if (rpcServer && (rpcServer as any).broadcast && rpcServerReadyRef.current) {
        (rpcServer as any).broadcast.openInEditor({ fileName, line, column }).catch(() => {})
      }
    })

    return () => {
      dispose()
      disposeSelect()
      disposeOpenInEditor()
    }
  }, [])

  useEffect(() => {
    if (iframeRef.current)
      return

    const clientUrl = getDevToolsClientUrl()
    const iframe = document.createElement('iframe')
    iframe.id = 'react-devtools-client-iframe'
    iframe.src = clientUrl
    iframe.className = 'react-devtools-iframe'
    iframeRef.current = iframe

    iframe.onload = async () => {
      setIframeServerContext(iframe)
      await waitForClientInjection(iframe)

      createRpcServer({
        syncTheme(data: { mode: 'light' | 'dark', primaryColor: string }) {
          const overlayContainer = document.getElementById('react-devtools-overlay')
          if (overlayContainer) {
            const anchor = overlayContainer.querySelector('.react-devtools-anchor') as HTMLElement
            if (anchor) {
              // Toggle dark mode class
              if (data.mode === 'dark') {
                anchor.classList.add('dark')
              }
              else {
                anchor.classList.remove('dark')
              }
              // Update primary color variable
              if (data.primaryColor) {
                anchor.style.setProperty('--color-primary-500', data.primaryColor)
              }
            }
          }

          // Also update the highlight box if it exists (it's a child of body)
          const highlightBox = document.getElementById('__react-devtools-component-inspector__')
          if (highlightBox) {
            if (data.primaryColor) {
              highlightBox.style.setProperty('--color-primary-500', data.primaryColor)
            }
          }

          // Inject a style tag to define the variable for future highlight boxes
          // This isolates the variable from document.documentElement
          let themeStyle = document.getElementById('react-devtools-global-styles')
          if (!themeStyle) {
            themeStyle = document.createElement('style')
            themeStyle.id = 'react-devtools-global-styles'
            document.head.appendChild(themeStyle)
          }

          if (data.primaryColor) {
            themeStyle.textContent = `
              #__react-devtools-component-inspector__ {
                --color-primary-500: ${data.primaryColor};
              }
            `
          }
        },
        toggleDragResize(enabled: boolean) {
          setDragResizeEnabled?.(enabled)
        },
        togglePanel(visible?: boolean) {
          setPanelVisibleRef.current(visible ?? !panelVisibleRef.current)
        },
        highlightNode(fiberId: string) {
          const fiber = getFiberById(fiberId)
          if (fiber) {
            highlightNode(fiber)
          }
        },
        hideHighlight() {
          hideHighlight()
        },
        rebuildTree(showHostComponents: boolean) {
          rebuildTree(showHostComponents)
        },
        toggleInspector(enabled: boolean) {
          toggleInspector(enabled)
          // Only hide panel if we are enabling "select-component" mode or default mode
          // Actually toggleInspector in kit now takes options, but here we just pass enabled
          // If we want to support opening in editor, we need to pass mode
          if (enabled) {
            setPanelVisibleRef.current(false)
          }
        },
        toggleInspectorMode(mode: 'select-component' | 'open-in-editor') {
          toggleInspector(true, { mode })
          setPanelVisibleRef.current(false)
        },
        openInEditor(options: { fileName: string, line: number, column: number }) {
          openInEditor(options.fileName, options.line, options.column)
        },
        getReactVersion() {
          return getReactVersion()
        },
        getComponentDetails(fiberId: string) {
          const fiber = getFiberById(fiberId)
          if (fiber) {
            return getComponentDetails(fiber)
          }
          return null
        },
        async callPluginRPC(pluginId: string, rpcName: string, ...args: any[]) {
          try {
            const fullRpcName = `${pluginId}.${rpcName}`
            return await globalPluginManager.callRPC(fullRpcName, ...args)
          }
          catch (error) {
            console.error(`[React DevTools] Failed to call plugin RPC ${pluginId}.${rpcName}:`, error)
            throw error
          }
        },
        subscribeToPluginEvent(pluginId: string, eventName: string) {
          try {
            const plugin = globalPluginManager.get(pluginId) as any
            if (!plugin) {
              console.error(`[React DevTools] Plugin "${pluginId}" not found`)
              return () => {}
            }
            // Subscribe to plugin events using the plugin's subscribe method
            if (typeof plugin.subscribe === 'function') {
              // Forward the event to the client via broadcast
              const dispose = plugin.subscribe(eventName, (data: any) => {
                const rpcServer = getRpcServer()
                if (rpcServer && (rpcServer as any).broadcast) {
                  (rpcServer as any).broadcast.onPluginEvent(pluginId, eventName, data).catch(() => {})
                }
              })
              return dispose
            }
            else {
              console.error(`[React DevTools] Plugin "${pluginId}" does not support event subscriptions`)
              return () => {}
            }
          }
          catch (error) {
            console.error(`[React DevTools] Failed to subscribe to plugin event ${pluginId}.${eventName}:`, error)
            return () => {}
          }
        },
      }, {
        preset: 'iframe',
      })

      rpcServerReadyRef.current = true

      if (pendingTreeRef.current) {
        const rpcServer = getRpcServer()
        if (rpcServer && (rpcServer as any).broadcast) {
          try {
            const result = (rpcServer as any).broadcast.updateTree(pendingTreeRef.current)
            if (result && typeof result.then === 'function') {
              result.catch(() => {})
            }
            pendingTreeRef.current = null
          }
          catch (e) {
            // Silently handle errors
          }
        }
      }
    }

    return () => {
      if (iframeRef.current) {
        iframeRef.current.remove()
        iframeRef.current = null
      }
    }
  }, [])

  return { iframeRef }
}
