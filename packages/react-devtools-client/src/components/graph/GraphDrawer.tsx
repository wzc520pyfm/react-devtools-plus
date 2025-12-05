/**
 * GraphDrawer component - Shows selected node details
 * 图表抽屉组件 - 显示选中节点详情
 */

import type { DrawerData } from '~/types/graph'
import { openInEditor } from '@react-devtools/kit'
import { useState } from 'react'

interface GraphDrawerProps {
  data?: DrawerData
  show: boolean
  onClose: () => void
  onFilterModule: (path: string) => void
}

const keys: Array<['refs' | 'deps', string]> = [
  ['refs', 'references'],
  ['deps', 'dependencies'],
]

export function GraphDrawer({
  data,
  show,
  onClose,
  onFilterModule,
}: GraphDrawerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
    catch (e) {
      console.error('Failed to copy:', e)
    }
  }

  const handleOpenInEditor = (path: string) => {
    openInEditor(path, 1, 1)
  }

  if (!show)
    return null

  return (
    <div
      className={`
        absolute right-0 top-0 z-20 h-full w-[300px] border-l border-base
        bg-white/95 shadow-lg backdrop-blur transition-transform duration-300
        dark:bg-neutral-900/95
        ${show ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-2 top-2 rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-neutral-800 dark:hover:text-gray-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>

      {/* Header */}
      <div className="flex h-20 flex-col gap-1 border-b border-base p-3">
        <span className="flex items-center gap-2 text-lg font-medium">
          {data?.name}
          {copied
            ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )
            : (
                <button
                  onClick={() => data?.name && handleCopy(data.name)}
                  className="text-gray-400 opacity-50 transition-opacity hover:opacity-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                </button>
              )}
        </span>
        <button
          onClick={() => data?.path && handleOpenInEditor(data.path)}
          className="truncate text-left text-sm text-gray-500 hover:underline"
          title={data?.displayPath}
        >
          {data?.displayPath}
        </button>
      </div>

      {/* References and Dependencies */}
      {keys.map(([key, keyDisplay]) => (
        <div key={key} className="max-h-60 overflow-auto border-b border-base p-3 text-sm">
          <div className="pb-2 text-gray-500">
            <span className="text-primary-500">{data?.[key].length ?? 0}</span>
            {' '}
            {keyDisplay}
          </div>
          <div className="flex flex-col items-start gap-2">
            {data?.[key].map(item => (
              <button
                key={item.path}
                onClick={() => handleOpenInEditor(item.path)}
                className="truncate whitespace-nowrap pr-3 text-gray-800 hover:underline dark:text-gray-200"
              >
                {item.displayPath}
              </button>
            ))}
            {(!data?.[key] || data[key].length === 0) && (
              <span className="text-gray-400 dark:text-gray-600">None</span>
            )}
          </div>
        </div>
      ))}

      {/* Filter button */}
      <div className="p-3">
        <button
          onClick={() => data?.path && onFilterModule(data.path)}
          className="w-full rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
        >
          Filter to this module
        </button>
      </div>
    </div>
  )
}

