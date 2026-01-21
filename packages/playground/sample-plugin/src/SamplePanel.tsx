/**
 * Sample Plugin Panel Component
 * 示例插件面板组件
 *
 * 演示插件新能力：
 * - usePluginRpc: 调用宿主脚本的 RPC 方法
 * - usePluginEvent: 监听宿主脚本发送的事件
 * - usePluginOptions: 获取用户传入的插件选项
 */

import type { DevToolsPluginProps } from '@react-devtools-plus/api'
import type { SamplePluginOptions } from './index'
import { usePluginEvent, usePluginOptions, usePluginRpc } from '@react-devtools-plus/api'
import { useEffect, useState } from 'react'

interface HostInfo {
  url: string
  title: string
  userAgent: string
  screenWidth: number
  screenHeight: number
  timestamp: number
}

interface LogEntry {
  time: number
  message: string
}

export default function SamplePanel({ tree, selectedNodeId, theme }: DevToolsPluginProps) {
  const [hostInfo, setHostInfo] = useState<HostInfo | null>(null)
  const [clickCount, setClickCount] = useState(0)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [queryResult, setQueryResult] = useState<any>(null)
  const [queryInput, setQueryInput] = useState('button')

  const rpc = usePluginRpc('sample-plugin')
  const options = usePluginOptions<SamplePluginOptions>('sample-plugin')
  const isDark = theme?.mode === 'dark'

  // 初始加载
  useEffect(() => {
    rpc.call<HostInfo>('getHostInfo').then(setHostInfo).catch(() => {})
    rpc.call<number>('getClickCount').then(setClickCount).catch(() => {})
    rpc.call<LogEntry[]>('getLogs').then(setLogs).catch(() => {})
  }, [rpc])

  // 监听点击事件
  usePluginEvent('click:count', (count: number) => {
    setClickCount(count)
  })

  // 监听日志事件
  usePluginEvent('log:add', (log: LogEntry) => {
    setLogs(prev => [...prev.slice(-49), log])
  })

  // 监听心跳
  usePluginEvent('heartbeat', () => {
    // 可以在这里更新某些状态
  })

  const handleRefreshInfo = async () => {
    const info = await rpc.call<HostInfo>('getHostInfo')
    setHostInfo(info)
  }

  const handleResetCount = async () => {
    const count = await rpc.call<number>('resetClickCount')
    setClickCount(count)
  }

  const handleClearLogs = async () => {
    await rpc.call('clearLogs')
    setLogs([])
  }

  const handleQuery = async () => {
    const result = await rpc.call('queryElements', queryInput)
    setQueryResult(result)
  }

  const handleFlash = async () => {
    await rpc.call('flashBackground')
  }

  return (
    <div
      className="h-full flex flex-col overflow-auto p-4"
      style={{ background: isDark ? '#1a1a1a' : '#fafafa', color: isDark ? '#e5e5e5' : '#171717' }}
    >
      <h1 className="mb-2 text-xl font-bold">🔌 Sample Plugin</h1>
      <p className="mb-4 text-sm text-gray-500">
        演示插件新能力：Host Script + RPC 通信
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Host Info Card */}
        <div className="rounded-lg p-4 shadow" style={{ background: isDark ? '#262626' : '#fff' }}>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold" style={{ color: theme.colors.primary[500] }}>
              🖥️ 宿主信息 (RPC)
            </h2>
            <button
              onClick={handleRefreshInfo}
              className="rounded px-2 py-1 text-xs"
              style={{ background: isDark ? '#333' : '#e5e5e5' }}
            >
              刷新
            </button>
          </div>
          {hostInfo
            ? (
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-gray-500">Title:</span>
                    {' '}
                    {hostInfo.title}
                  </div>
                  <div>
                    <span className="text-gray-500">URL:</span>
                    {' '}
                    <code className="text-xs">{hostInfo.url}</code>
                  </div>
                  <div>
                    <span className="text-gray-500">Screen:</span>
                    {' '}
                    {hostInfo.screenWidth}
                    x
                    {hostInfo.screenHeight}
                  </div>
                </div>
              )
            : (
                <p className="text-sm text-gray-400 italic">加载中...</p>
              )}
        </div>

        {/* Click Counter Card */}
        <div className="rounded-lg p-4 shadow" style={{ background: isDark ? '#262626' : '#fff' }}>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold" style={{ color: theme.colors.primary[500] }}>
              🖱️ 点击计数 (Event)
            </h2>
            <button
              onClick={handleResetCount}
              className="rounded px-2 py-1 text-xs"
              style={{ background: isDark ? '#333' : '#e5e5e5' }}
            >
              重置
            </button>
          </div>
          <div className="text-center">
            <span className="text-4xl font-bold" style={{ color: theme.colors.primary[500] }}>
              {clickCount}
            </span>
            <p className="mt-1 text-xs text-gray-500">在宿主页面点击任意位置</p>
          </div>
        </div>

        {/* DOM Query Card */}
        <div className="rounded-lg p-4 shadow" style={{ background: isDark ? '#262626' : '#fff' }}>
          <h2 className="mb-2 font-semibold" style={{ color: theme.colors.primary[500] }}>
            🔍 DOM 查询 (RPC)
          </h2>
          <div className="mb-2 flex gap-2">
            <input
              type="text"
              value={queryInput}
              onChange={e => setQueryInput(e.target.value)}
              placeholder="CSS selector"
              className="flex-1 rounded px-2 py-1 text-sm"
              style={{ background: isDark ? '#333' : '#e5e5e5' }}
            />
            <button
              onClick={handleQuery}
              className="rounded px-3 py-1 text-sm text-white"
              style={{ background: theme.colors.primary[500] }}
            >
              查询
            </button>
          </div>
          {queryResult && (
            <pre
              className="max-h-32 overflow-auto rounded p-2 text-xs"
              style={{ background: isDark ? '#333' : '#f0f0f0' }}
            >
              {JSON.stringify(queryResult, null, 2)}
            </pre>
          )}
        </div>

        {/* DOM Actions Card */}
        <div className="rounded-lg p-4 shadow" style={{ background: isDark ? '#262626' : '#fff' }}>
          <h2 className="mb-2 font-semibold" style={{ color: theme.colors.primary[500] }}>
            ⚡ DOM 操作 (RPC)
          </h2>
          <p className="mb-3 text-sm text-gray-500">演示从插件控制宿主页面</p>
          <button
            onClick={handleFlash}
            className="rounded px-4 py-2 text-white"
            style={{ background: '#f59e0b' }}
          >
            ✨ 闪烁背景
          </button>
        </div>

        {/* Logs Card */}
        <div className="rounded-lg p-4 shadow lg:col-span-2" style={{ background: isDark ? '#262626' : '#fff' }}>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold" style={{ color: theme.colors.primary[500] }}>
              📜 实时日志 (Event)
            </h2>
            <button
              onClick={handleClearLogs}
              className="rounded px-2 py-1 text-xs"
              style={{ background: isDark ? '#333' : '#e5e5e5' }}
            >
              清空
            </button>
          </div>
          <div
            className="max-h-40 overflow-auto rounded p-2 text-xs font-mono"
            style={{ background: isDark ? '#333' : '#f0f0f0' }}
          >
            {logs.length === 0
              ? (
                  <span className="text-gray-400">暂无日志，在宿主页面点击试试...</span>
                )
              : (
                  logs.map((log, i) => (
                    <div key={i} className="py-0.5">
                      <span className="text-gray-400">
                        [
                        {new Date(log.time).toLocaleTimeString()}
                        ]
                      </span>
                      {' '}
                      {log.message}
                    </div>
                  ))
                )}
          </div>
        </div>

        {/* Plugin Options Card */}
        <div className="rounded-lg p-4 shadow" style={{ background: isDark ? '#262626' : '#fff' }}>
          <h2 className="mb-2 font-semibold" style={{ color: theme.colors.primary[500] }}>
            ⚙️ 插件选项
          </h2>
          <pre
            className="rounded p-2 text-xs"
            style={{ background: isDark ? '#333' : '#f0f0f0' }}
          >
            {JSON.stringify(options, null, 2)}
          </pre>
        </div>

        {/* DevTools Props Card */}
        <div className="rounded-lg p-4 shadow" style={{ background: isDark ? '#262626' : '#fff' }}>
          <h2 className="mb-2 font-semibold" style={{ color: theme.colors.primary[500] }}>
            📊 DevTools Props
          </h2>
          <div className="text-sm space-y-1">
            <div>
              <span className="text-gray-500">Theme:</span>
              {' '}
              {theme?.mode}
            </div>
            <div>
              <span className="text-gray-500">Selected:</span>
              {' '}
              <code className="text-xs">{selectedNodeId || 'none'}</code>
            </div>
            <div>
              <span className="text-gray-500">Tree:</span>
              {' '}
              {tree ? `Root ID: ${(tree as any).rootID || 'N/A'}` : 'loading...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
