import { getRpcClient } from '@react-devtools/kit'
import { Checkbox, Select, Switch } from '@react-devtools/ui'
import { useEffect, useState } from 'react'
import { pluginEvents } from '../events'

interface ScanConfig {
  enabled?: boolean
  showToolbar?: boolean
  animationSpeed?: 'slow' | 'fast' | 'off'
  log?: boolean
  clearLog?: boolean
}

interface ComponentPerformanceData {
  componentName: string
  renderCount: number
  totalTime: number
  averageTime: number
  unnecessaryRenders: number
  lastRenderTime: number | null
}

interface PerformanceSummary {
  totalRenders: number
  totalComponents: number
  unnecessaryRenders: number
  averageRenderTime: number
  slowestComponents: ComponentPerformanceData[]
}

interface ComponentInfo {
  componentName: string
  fiber: any
  domElement: Element | null
}

// Define server-side RPC functions that the client can call
interface ServerRpcFunctions {
  callPluginRPC: (pluginId: string, rpcName: string, ...args: any[]) => Promise<any>
  subscribeToPluginEvent: (pluginId: string, eventName: string) => () => void
  togglePanel: (visible: boolean) => void
}

const FPSMeter = ({ fps }: { fps: number | null }) => {
  if (fps === null)
    return null

  let colorClass = 'text-gray-600 dark:text-gray-400'
  if (fps < 30)
    colorClass = 'text-red-600 dark:text-red-400'
  else if (fps < 50)
    colorClass = 'text-yellow-600 dark:text-yellow-400'

  return (
    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 font-mono dark:bg-gray-800">
      <span className={`text-sm text-purple-600 font-bold dark:text-purple-400 ${colorClass}`}>
        {fps}
      </span>
      <span className="text-xs">FPS</span>
    </div>
  )
}

export function ScanPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [config, setConfig] = useState<ScanConfig>({
    enabled: true,
    showToolbar: false,
    animationSpeed: 'fast',
    log: false,
    clearLog: false,
  })
  const [performanceSummary, setPerformanceSummary] = useState<PerformanceSummary | null>(null)
  const [performanceData, setPerformanceData] = useState<ComponentPerformanceData[]>([])
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [isInspecting, setIsInspecting] = useState(false)
  const [focusedComponent, setFocusedComponent] = useState<ComponentInfo | null>(null)
  const [fps, setFps] = useState<number | null>(null)

  const fetchFps = async () => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (!rpc?.callPluginRPC)
      return

    try {
      const currentFps = await rpc.callPluginRPC('react-scan', 'getFPS')
      setFps(currentFps as number)
    }
    catch (error) {
      // Ignore errors for FPS polling
    }
  }

  const fetchPerformanceData = async () => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (!rpc?.callPluginRPC)
      return

    try {
      const [summary, data] = await Promise.all([
        rpc.callPluginRPC('react-scan', 'getPerformanceSummary'),
        rpc.callPluginRPC('react-scan', 'getPerformanceData'),
      ])

      setPerformanceSummary(summary as PerformanceSummary)
      setPerformanceData(data as ComponentPerformanceData[])
    }
    catch (error) {
      console.debug('[Scan Page] Failed to fetch performance data:', error)
    }
  }

  useEffect(() => {
    // Get initial config from the scan plugin
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (rpc?.callPluginRPC) {
      rpc.callPluginRPC('react-scan', 'getOptions')
        .then((initialConfig: ScanConfig) => {
          if (initialConfig) {
            setConfig(prev => ({ ...prev, ...initialConfig }))
            setIsRunning(initialConfig.enabled ?? false)
          }
        })
        .catch((err: Error) => {
          console.debug('[Scan Page] Failed to get initial config:', err)
        })

      // Subscribe to events via RPC
      const unsubConfig = rpc.subscribeToPluginEvent('react-scan', 'config-changed')
      const unsubInspect = rpc.subscribeToPluginEvent('react-scan', 'inspect-state-changed')
      const unsubFocus = rpc.subscribeToPluginEvent('react-scan', 'component-focused')

      // Listen to local events emitted by RPC handler
      const handleConfigChange = (newConfig: ScanConfig) => {
        setConfig(prev => ({ ...prev, ...newConfig }))
        setIsRunning(newConfig.enabled ?? false)
      }

      const handleInspectChange = (state: any) => {
        const isInspectingNow = state.kind === 'inspecting'
        setIsInspecting(isInspectingNow)

        if (isInspectingNow) {
          rpc.togglePanel(false)
        }
        else if (state.kind === 'focused' || state.kind === 'inspect-off') {
          rpc.togglePanel(true)
        }
      }

      const handleFocusChange = (component: ComponentInfo) => {
        setFocusedComponent(component)
      }

      pluginEvents.on('react-scan:config-changed', handleConfigChange)
      pluginEvents.on('react-scan:inspect-state-changed', handleInspectChange)
      pluginEvents.on('react-scan:component-focused', handleFocusChange)

      return () => {
        if (typeof unsubConfig === 'function')
          unsubConfig()
        if (typeof unsubInspect === 'function')
          unsubInspect()
        if (typeof unsubFocus === 'function')
          unsubFocus()

        pluginEvents.off('react-scan:config-changed', handleConfigChange)
        pluginEvents.off('react-scan:inspect-state-changed', handleInspectChange)
        pluginEvents.off('react-scan:component-focused', handleFocusChange)
      }
    }
  }, [])

  // Auto-refresh performance data when scanning is running
  useEffect(() => {
    if (isRunning && autoRefresh) {
      fetchPerformanceData()
      const dataInterval = setInterval(fetchPerformanceData, 1000) // Refresh data every second
      return () => clearInterval(dataInterval)
    }
  }, [isRunning, autoRefresh])

  // Always refresh FPS
  useEffect(() => {
    fetchFps()
    const fpsInterval = setInterval(fetchFps, 500) // Refresh FPS every 500ms
    return () => clearInterval(fpsInterval)
  }, [])

  const handleToggleScan = async () => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (!rpc?.callPluginRPC)
      return

    try {
      // Check if scan is currently active
      const isActive = await rpc.callPluginRPC('react-scan', 'isActive')

      // Toggle based on current state
      const result = isActive
        ? await rpc.callPluginRPC('react-scan', 'stop')
        : await rpc.callPluginRPC('react-scan', 'start')

      if (result) {
        setIsRunning(!isActive)
      }
    }
    catch (error) {
      console.error('[Scan Page] Failed to toggle scan:', error)
    }
  }

  const handleStartScan = async () => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (!rpc?.callPluginRPC)
      return

    try {
      const result = await rpc.callPluginRPC('react-scan', 'start')
      if (result) {
        setIsRunning(true)
      }
    }
    catch (error) {
      console.error('[Scan Page] Failed to start scan:', error)
    }
  }

  const handleStopScan = async () => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (!rpc?.callPluginRPC)
      return

    try {
      const result = await rpc.callPluginRPC('react-scan', 'stop')
      if (result) {
        setIsRunning(false)
      }
    }
    catch (error) {
      console.error('[Scan Page] Failed to stop scan:', error)
    }
  }

  const handleConfigChange = async (key: keyof ScanConfig, value: any) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)

    const rpc = getRpcClient<ServerRpcFunctions>()
    if (!rpc?.callPluginRPC)
      return

    try {
      await rpc.callPluginRPC('react-scan', 'setOptions', newConfig)
    }
    catch (error) {
      console.error('[Scan Page] Failed to update config:', error)
    }
  }

  const handleReset = async () => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (!rpc?.callPluginRPC)
      return

    try {
      const result = await rpc.callPluginRPC('react-scan', 'reset')
      if (result) {
        // Reset config to initial state or fetch again
        const initialConfig = await rpc.callPluginRPC('react-scan', 'getOptions')
        if (initialConfig) {
          setConfig(prev => ({ ...prev, ...initialConfig }))
          setIsRunning(initialConfig.enabled ?? false)
        }
      }
    }
    catch (error) {
      console.error('[Scan Page] Failed to reset scan:', error)
    }
  }

  const handleClearPerformanceData = async () => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (!rpc?.callPluginRPC)
      return

    try {
      await rpc.callPluginRPC('react-scan', 'clearPerformanceData')
      setPerformanceSummary(null)
      setPerformanceData([])
    }
    catch (error) {
      console.error('[Scan Page] Failed to clear performance data:', error)
    }
  }

  const handleToggleInspect = async () => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (!rpc?.callPluginRPC)
      return

    try {
      if (isInspecting) {
        await rpc.callPluginRPC('react-scan', 'stopInspecting')
        setIsInspecting(false)
      }
      else {
        await rpc.callPluginRPC('react-scan', 'startInspecting')
        setIsInspecting(true)
      }
    }
    catch (error) {
      console.error('[Scan Page] Failed to toggle inspect mode:', error)
    }
  }

  return (
    <div className="h-full flex flex-col bg-base">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-base bg-base px-4 py-3">
        <div>
          <h1 className="text-xl text-gray-900 font-semibold dark:text-gray-100">
            React Scan
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Performance analysis and render visualization
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleToggleInspect}
            title={isInspecting ? 'Click to cancel inspection' : 'Select component in the page'}
            className={`rounded p-1.5 transition-colors ${isInspecting ? 'bg-primary-500 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" strokeDasharray="4 4" />
              <path d="m12 12 4 10 1.7-4.3L22 16Z" fill="currentColor" />
            </svg>
          </button>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium dark:text-gray-400">Scan</span>
            <Switch
              checked={isRunning}
              onChange={(checked) => {
                if (checked)
                  handleStartScan()
                else
                  handleStopScan()
              }}
            />
          </div>
          <FPSMeter fps={fps} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Focused Component Card */}
          {focusedComponent && (
            <div className="border border-base rounded-lg bg-white p-4 shadow-sm dark:bg-neutral-900">
              <h3 className="mb-2 text-sm text-gray-700 font-medium dark:text-gray-300">
                Focused Component
              </h3>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-neutral-800">
                <div className="text-sm">
                  <div className="text-gray-600 font-mono dark:text-gray-400">
                    {focusedComponent.componentName}
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Click to inspect this component in the host app
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Summary Card */}
          {isRunning && performanceSummary && (
            <div className="border border-base rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg text-gray-900 font-medium dark:text-gray-100">
                  Performance Summary
                </h2>
                <div className="flex gap-2">
                  <Checkbox
                    checked={autoRefresh}
                    onChange={setAutoRefresh}
                    label="Auto Refresh"
                  />
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleClearPerformanceData}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700"
                  >
                    Clear Data
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <div className="text-2xl text-blue-600 font-bold dark:text-blue-400">
                    {performanceSummary.totalRenders}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Renders</div>
                </div>

                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                  <div className="text-2xl text-green-600 font-bold dark:text-green-400">
                    {performanceSummary.totalComponents}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Components</div>
                </div>

                <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-900/20">
                  <div className="text-2xl text-orange-600 font-bold dark:text-orange-400">
                    {performanceSummary.unnecessaryRenders}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Unnecessary</div>
                </div>

                <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                  <div className="text-2xl text-purple-600 font-bold dark:text-purple-400">
                    {performanceSummary.averageRenderTime.toFixed(2)}
                    ms
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg Time</div>
                </div>
              </div>
            </div>
          )}

          {/* Component Performance Details */}
          {isRunning && performanceData.length > 0 && (
            <div className="border border-base rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-900">
              <h2 className="mb-4 text-lg text-gray-900 font-medium dark:text-gray-100">
                Component Performance
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300">
                    <tr>
                      <th className="pb-3 font-medium">Component</th>
                      <th className="pb-3 text-right font-medium">Renders</th>
                      <th className="pb-3 text-right font-medium">Total Time</th>
                      <th className="pb-3 text-right font-medium">Avg Time</th>
                      <th className="pb-3 text-right font-medium">Unnecessary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {performanceData.slice(0, 20).map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-neutral-800/50"
                      >
                        <td className="py-3 text-xs font-mono dark:text-gray-300">
                          {item.componentName}
                        </td>
                        <td className="py-3 text-right dark:text-gray-300">{item.renderCount}</td>
                        <td className="py-3 text-right dark:text-gray-300">
                          {item.totalTime.toFixed(2)}
                          ms
                        </td>
                        <td className="py-3 text-right dark:text-gray-300">
                          {item.averageTime.toFixed(2)}
                          ms
                        </td>
                        <td className="py-3 text-right">
                          {item.unnecessaryRenders > 0
                            ? (
                                <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800 font-medium dark:bg-orange-900/20 dark:text-orange-400">
                                  {item.unnecessaryRenders}
                                </span>
                              )
                            : (
                                <span className="text-gray-400">-</span>
                              )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {performanceData.length > 20 && (
                <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Showing top 20 of
                  {' '}
                  {performanceData.length}
                  {' '}
                  components
                </div>
              )}
            </div>
          )}

          {/* Configuration Card */}
          <div className="border border-base rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-900">
            <h2 className="mb-4 text-lg text-gray-900 font-medium dark:text-gray-100">
              Configuration
            </h2>

            <div className="space-y-4">
              {/* Show Outlines */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-900 font-medium dark:text-gray-100">
                    Show Outlines
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Display visual outlines on component updates
                  </div>
                </div>
                <Checkbox
                  checked={true} // Always true for now
                  disabled
                />
              </div>

              {/* Show Toolbar */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-900 font-medium dark:text-gray-100">
                    Show Toolbar
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Display the React Scan toolbar on the page
                  </div>
                </div>
                <Checkbox
                  checked={config.showToolbar ?? true}
                  onChange={checked => handleConfigChange('showToolbar', checked)}
                />
              </div>

              {/* Animation Speed */}
              <div>
                <label className="mb-2 block text-sm text-gray-900 font-medium dark:text-gray-100">
                  Animation Speed
                </label>
                <Select
                  value={config.animationSpeed || 'fast'}
                  onChange={value => handleConfigChange('animationSpeed', value)}
                  options={[
                    { label: 'Slow', value: 'slow' },
                    { label: 'Fast', value: 'fast' },
                    { label: 'Off', value: 'off' },
                  ]}
                />
              </div>

              {/* Log */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-900 font-medium dark:text-gray-100">
                    Console Logging
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Log render information to the console
                  </div>
                </div>
                <Checkbox
                  checked={config.log ?? false}
                  onChange={checked => handleConfigChange('log', checked)}
                />
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="border border-primary-200 rounded-lg bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20">
            <div className="flex">
              <svg className="mr-3 h-5 w-5 flex-shrink-0 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-primary-700 dark:text-primary-300">
                <p className="font-medium">
                  About React Scan
                </p>
                <p className="mt-1">
                  React Scan helps you identify performance issues by visualizing component renders in real-time.
                  Components that re-render frequently will be highlighted, making it easy to spot unnecessary updates.
                </p>
                <p className="mt-2">
                  <a
                    href="https://react-scan.million.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline hover:text-primary-800 dark:hover:text-primary-200"
                  >
                    Learn more about React Scan →
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
