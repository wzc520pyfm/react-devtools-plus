import type { LoadedPlugin, UserPlugin } from '~/types/plugin'
import { createRpcClient, getRpcClient, openInEditor } from '@react-devtools/kit'
import { useTheme } from '@react-devtools/ui'
import { Suspense, useEffect, useRef, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from '~/components/Sidebar'
import { pluginEvents } from './events'
import { ComponentsPage } from './pages/ComponentsPage'
import { ContextPage } from './pages/ContextPage'
import { GraphPage } from './pages/GraphPage'
import { OverviewPage } from './pages/OverviewPage'
import { RoutesPage } from './pages/RoutesPage'
import { ScanPage } from './pages/ScanPage'
import { SettingsPage } from './pages/SettingsPage'

interface ServerRpcFunctions {
  inspectNode: (fiberId: string) => void
  hideHighlight: () => void
  rebuildTree: (showHostComponents: boolean) => void
  toggleInspector: (enabled: boolean) => void
  toggleInspectorMode: (mode: 'select-component' | 'open-in-editor') => void
  openInEditor: (options: { fileName: string, line: number, column: number }) => void
  callPluginRPC: (pluginId: string, rpcName: string, ...args: any[]) => Promise<any>
  subscribeToPluginEvent: (pluginId: string, eventName: string) => () => void
  syncTheme: (data: { mode: 'light' | 'dark', primaryColor: string }) => void
  toggleDragResize: (enabled: boolean) => void
}

export function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [tree, setTree] = useState<any>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const { theme } = useTheme()
  const [plugins, setPlugins] = useState<LoadedPlugin[]>([])

  // Fetch and load plugins
  useEffect(() => {
    async function loadPlugins() {
      try {
        const response = await fetch('/__react_devtools__/plugins-manifest.json')
        if (!response.ok)
          return
        const pluginManifests: UserPlugin[] = await response.json()

        const loadedPlugins = await Promise.all(
          pluginManifests.map(async (plugin) => {
            if (plugin.view?.src) {
              try {
                // Use dynamic import to load the component
                // We assume the src is an absolute path or handled by the server
                // @ts-expect-error vite-ignore
                const module = await import(/* @vite-ignore */ plugin.view.src)
                return {
                  ...plugin,
                  component: module.default || module,
                }
              }
              catch (e) {
                console.error(`[React DevTools] Failed to load plugin ${plugin.name}:`, e)
                return plugin
              }
            }
            return plugin
          }),
        )

        setPlugins(loadedPlugins)
      }
      catch (e) {
        console.error('[React DevTools] Failed to load plugins manifest:', e)
      }
    }

    loadPlugins()
  }, [])

  // Sync theme changes to parent overlay
  useEffect(() => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (rpc?.syncTheme) {
      rpc.syncTheme({
        mode: theme.mode as 'light' | 'dark',
        primaryColor: theme.colors.primary[500],
      })
    }
  }, [theme.mode, theme.colors.primary])

  // Sync drag resize setting on mount
  useEffect(() => {
    const stored = localStorage.getItem('react-devtools-drag-resize')
    if (stored === 'true') {
      const rpc = getRpcClient<ServerRpcFunctions>()
      if (rpc?.toggleDragResize) {
        rpc.toggleDragResize(true)
      }
    }
  }, [])

  // Use refs to store the latest setter functions to avoid stale closures
  const setTreeRef = useRef(setTree)
  const setSelectedNodeIdRef = useRef(setSelectedNodeId)
  const navigateRef = useRef(navigate)

  // Update refs when functions change
  useEffect(() => {
    setTreeRef.current = setTree
    setSelectedNodeIdRef.current = setSelectedNodeId
    navigateRef.current = navigate
  }, [setTree, setSelectedNodeId, navigate])

  useEffect(() => {
    // Define server-side RPC functions that the client can call
    // ServerRpcFunctions interface moved up for global access

    // Define client-side RPC functions that the server can call
    interface ClientRpcFunctions {
      updateTree: (newTree: any) => void
      selectNode: (fiberId: string) => void
      openInEditor: (payload: { fileName: string, line: number, column: number }) => void
      onPluginEvent: (pluginId: string, eventName: string, data: any) => void
    }

    createRpcClient<ServerRpcFunctions, ClientRpcFunctions>({
      updateTree(newTree: any) {
        // Use ref to get the latest setter
        setTreeRef.current(newTree)
      },
      selectNode(fiberId: string) {
        // Use ref to get the latest setter
        setSelectedNodeIdRef.current(fiberId)
        // Ensure we are on the components page
        if (window.location.hash.replace('#', '') !== '/components') {
          navigateRef.current('/components')
        }
      },
      openInEditor(payload: { fileName: string, line: number, column: number }) {
        openInEditor(payload.fileName, payload.line, payload.column)
      },
      onPluginEvent(pluginId: string, eventName: string, data: any) {
        // Emit event to local listeners
        pluginEvents.emit(`${pluginId}:${eventName}`, data)
      },
    }, {
      preset: 'iframe',
    })

    // Send ready message when loaded
    window.parent.postMessage('__REACT_DEVTOOLS_CLIENT_READY__', '*')

    // Also listen for create client message from parent (handshake)
    const handleMessage = (event: MessageEvent) => {
      if (event.data === '__REACT_DEVTOOLS_CREATE_CLIENT__') {
        window.parent.postMessage('__REACT_DEVTOOLS_CLIENT_READY__', '*')
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/overview', { replace: true })
    }
  }, [location.pathname, navigate])

  return (
    <div className="h-screen w-full flex overflow-hidden bg-base text-base font-sans">
      <Sidebar plugins={plugins} />

      {/* Main Content */}
      <div className="min-w-0 flex flex-1 flex-col overflow-hidden bg-gray-50 dark:bg-neutral-950">
        <Routes>
          <Route path="/overview" element={<OverviewPage tree={tree} />} />
          <Route
            path="/components"
            element={(
              <ComponentsPage
                tree={tree}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
              />
            )}
          />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/context" element={<ContextPage />} />
          <Route path="/graph" element={<GraphPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {plugins.map((plugin) => {
            const Component = plugin.component
            if (!Component)
              return null
            return (
              <Route
                key={plugin.name}
                path={`/plugins/${plugin.name}`}
                element={(
                  <Suspense fallback={<div>Loading...</div>}>
                    <Component
                      tree={tree}
                      selectedNodeId={selectedNodeId}
                      theme={theme}
                    />
                  </Suspense>
                )}
              />
            )
          })}
        </Routes>
      </div>
    </div>
  )
}
