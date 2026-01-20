/**
 * Network Plugin Panel
 * 网络插件面板
 */

import type { DevToolsPluginProps } from '@react-devtools-plus/api'
import type { NetworkRequest, NetworkStats } from './types'
import { usePluginEvent, usePluginRpc } from '@react-devtools-plus/api'
import { useEffect, useState } from 'react'

export default function NetworkPanel({ theme }: DevToolsPluginProps) {
  const [requests, setRequests] = useState<NetworkRequest[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<NetworkRequest | null>(null)
  const [stats, setStats] = useState<NetworkStats>({ total: 0, success: 0, error: 0, pending: 0 })
  const [filter, setFilter] = useState<'all' | 'fetch' | 'xhr' | 'resource'>('all')

  const rpc = usePluginRpc('network-inspector')

  // Initial load
  useEffect(() => {
    rpc.call<NetworkRequest[]>('getRequests').then(setRequests)
    rpc.call<NetworkStats>('getStats').then(setStats)
  }, [rpc])

  // Listen for new requests
  usePluginEvent('request:add', (req: NetworkRequest) => {
    setRequests(prev => [...prev, req])
    setStats(prev => ({ ...prev, total: prev.total + 1, pending: prev.pending + 1 }))
  })

  // Listen for request updates
  usePluginEvent('request:update', (req: NetworkRequest) => {
    setRequests(prev => prev.map(r => r.id === req.id ? req : r))
    if (selectedId === req.id) {
      setDetail(req)
    }
    // Refresh stats
    rpc.call<NetworkStats>('getStats').then(setStats)
  })

  const handleSelect = async (id: string) => {
    setSelectedId(id)
    const req = await rpc.call<NetworkRequest>('getRequest', id)
    setDetail(req || null)
  }

  const handleClear = () => {
    rpc.call('clearRequests')
    setRequests([])
    setDetail(null)
    setSelectedId(null)
    setStats({ total: 0, success: 0, error: 0, pending: 0 })
  }

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(r => r.type === filter)

  const isDark = theme.mode === 'dark'

  const getStatusColor = (req: NetworkRequest) => {
    if (req.error)
      return 'text-red-500'
    if (!req.status)
      return 'text-yellow-500'
    if (req.status >= 400)
      return 'text-red-500'
    if (req.status >= 300)
      return 'text-yellow-500'
    return 'text-green-500'
  }

  return (
    <div
      className="h-full flex flex-col"
      style={{
        background: isDark ? '#1a1a1a' : '#fafafa',
        color: isDark ? '#e5e5e5' : '#171717',
      }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 border-b p-2"
        style={{ borderColor: isDark ? '#333' : '#e5e5e5' }}
      >
        <button
          onClick={handleClear}
          className="rounded px-3 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
          style={{
            background: isDark ? '#333' : '#e5e5e5',
          }}
        >
          🗑️ Clear
        </button>

        <div className="ml-4 flex gap-1">
          {(['all', 'fetch', 'xhr', 'resource'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="rounded px-2 py-1 text-xs"
              style={{
                background: filter === f
                  ? theme.colors.primary[500]
                  : isDark ? '#333' : '#e5e5e5',
                color: filter === f ? 'white' : undefined,
              }}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-4 text-sm">
          <span>
            Total:
            {' '}
            {stats.total}
          </span>
          <span className="text-green-500">
            ✓
            {' '}
            {stats.success}
          </span>
          <span className="text-red-500">
            ✗
            {' '}
            {stats.error}
          </span>
          <span className="text-yellow-500">
            ⏳
            {' '}
            {stats.pending}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Request List */}
        <div
          className="w-1/2 overflow-auto border-r"
          style={{ borderColor: isDark ? '#333' : '#e5e5e5' }}
        >
          {filteredRequests.length === 0
            ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No requests recorded
                </div>
              )
            : (
                filteredRequests.map(req => (
                  <div
                    key={req.id}
                    className="cursor-pointer border-b p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                    style={{
                      borderColor: isDark ? '#333' : '#f0f0f0',
                      background: selectedId === req.id
                        ? isDark ? '#2a2a2a' : '#e5e5e5'
                        : undefined,
                    }}
                    onClick={() => handleSelect(req.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono ${getStatusColor(req)}`}>
                        {req.status || '...'}
                      </span>
                      <span className="text-sm font-medium">{req.method}</span>
                      <span
                        className="rounded px-1 text-xs"
                        style={{ background: isDark ? '#333' : '#e5e5e5' }}
                      >
                        {req.type}
                      </span>
                    </div>
                    <div className="mt-1 truncate text-sm text-gray-500">
                      {(() => {
                        try {
                          return new URL(req.url, window.location.origin).pathname
                        }
                        catch {
                          return req.url
                        }
                      })()}
                    </div>
                    {req.duration !== undefined && (
                      <div className="mt-1 text-xs text-gray-400">
                        {req.duration.toFixed(0)}
                        ms
                      </div>
                    )}
                  </div>
                ))
              )}
        </div>

        {/* Request Detail */}
        <div className="w-1/2 overflow-auto p-4">
          {detail
            ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Request Detail</h3>

                  <div>
                    <div className="text-sm text-gray-500 font-medium">URL</div>
                    <div className="break-all text-sm">{detail.url}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 font-medium">Method</div>
                      <div className="text-sm">{detail.method}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 font-medium">Status</div>
                      <div className={`text-sm ${getStatusColor(detail)}`}>
                        {detail.status || 'Pending'}
                        {detail.statusText && ` ${detail.statusText}`}
                      </div>
                    </div>
                  </div>

                  {detail.duration !== undefined && (
                    <div>
                      <div className="text-sm text-gray-500 font-medium">Duration</div>
                      <div className="text-sm">
                        {detail.duration.toFixed(2)}
                        ms
                      </div>
                    </div>
                  )}

                  {detail.error && (
                    <div>
                      <div className="text-sm text-red-500 font-medium">Error</div>
                      <div className="text-sm text-red-400">{detail.error}</div>
                    </div>
                  )}

                  {detail.responseBody && (
                    <div>
                      <div className="text-sm text-gray-500 font-medium">Response Body</div>
                      <pre
                        className="max-h-64 overflow-auto rounded p-2 text-xs"
                        style={{ background: isDark ? '#333' : '#f0f0f0' }}
                      >
                        {typeof detail.responseBody === 'string'
                          ? detail.responseBody
                          : JSON.stringify(detail.responseBody, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )
            : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  Select a request to view details
                </div>
              )}
        </div>
      </div>
    </div>
  )
}
