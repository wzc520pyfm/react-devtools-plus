import { createRpcServer, getFiberById, getRpcServer, hideHighlight, highlightNode, onInspectorSelect, onOpenInEditor, onTreeUpdated, openInEditor, rebuildTree, setIframeServerContext, toggleInspector } from '@react-devtools/kit'
import { useEffect, useRef } from 'react'

function getDevToolsClientUrl() {
  const origin = window.location.origin
  const base = window.location.pathname.split('/__react_devtools__')[0] || ''
  const path = `${base}/__react_devtools__/`.replace(/\/+/g, '/')
  return `${origin}${path}`
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
