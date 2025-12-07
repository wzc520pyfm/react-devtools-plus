import { Braces, FileCode, Hash, LucideIcon, Settings } from 'lucide-react'
import React, { useEffect, useState } from 'react'

export interface CodeTab {
  name: string
  icon?: 'hash' | 'file' | 'braces' | 'settings'
  language: string
  code: string
}

interface TabbedCodeBlockProps {
  tabs: CodeTab[]
  statusText?: string
  className?: string
}

const ICON_MAP: Record<string, LucideIcon> = {
  hash: Hash,
  file: FileCode,
  braces: Braces,
  settings: Settings,
}

const getIconColor = (name: string): string => {
  if (name.endsWith('.ts') || name.endsWith('.mts') || name.endsWith('.cts')) return 'text-blue-400'
  if (name.endsWith('.tsx') || name.endsWith('.jsx')) return 'text-yellow-400'
  if (name.endsWith('.json')) return 'text-green-400'
  if (name.endsWith('.js') || name.endsWith('.mjs') || name.endsWith('.cjs')) return 'text-yellow-300'
  return 'text-slate-400'
}

const getDefaultIcon = (name: string): 'hash' | 'file' | 'braces' | 'settings' => {
  if (name.endsWith('.json')) return 'braces'
  if (name.includes('config')) return 'settings'
  if (name.endsWith('.ts') || name.endsWith('.mts')) return 'hash'
  return 'file'
}

export const TabbedCodeBlock: React.FC<TabbedCodeBlockProps> = ({
  tabs,
  statusText = 'Debugging Session: Active',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState(0)
  const [highlightedCodes, setHighlightedCodes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const highlightAll = async () => {
      try {
        const { codeToHtml } = await import('shiki')
        const results = await Promise.all(
          tabs.map(tab =>
            codeToHtml(tab.code.trim(), {
              lang: tab.language,
              theme: 'material-theme-ocean',
            })
          )
        )
        if (mounted) {
          setHighlightedCodes(results)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Shiki highlighting error:', error)
        if (mounted) {
          setHighlightedCodes(tabs.map(tab => `<pre><code>${tab.code.trim()}</code></pre>`))
          setIsLoading(false)
        }
      }
    }

    highlightAll()
    return () => {
      mounted = false
    }
  }, [tabs])

  const currentTab = tabs[activeTab]
  const lines = currentTab?.code.trim().split('\n') || []

  return (
    <div className={`relative overflow-hidden border border-white/10 rounded-2xl bg-[#0F111A] shadow-2xl backdrop-blur-sm ${className}`}>
      {/* Toolbar / Header */}
      <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4">
        <div className="flex items-center">
          {/* Traffic Lights */}
          <div className="mr-4 flex space-x-2">
            <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
            <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
          </div>

          {/* Tabs */}
          <div className="flex">
            {tabs.map((tab, idx) => {
              const iconKey = tab.icon || getDefaultIcon(tab.name)
              const IconComponent = ICON_MAP[iconKey] || FileCode
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-center gap-2 border-r border-white/5 px-4 py-3 text-xs font-medium transition-colors ${
                    activeTab === idx
                      ? 'text-white bg-white/10'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <IconComponent className={`h-3.5 w-3.5 ${getIconColor(tab.name)}`} />
                  {tab.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Status Text */}
        {/* <div className="hidden text-[10px] text-slate-500 font-mono sm:block">
          {statusText.includes(':') ? (
            <>
              {statusText.split(':')[0]}:
              {' '}
              <span className="text-green-400">{statusText.split(':')[1]?.trim()}</span>
            </>
          ) : (
            statusText
          )}
        </div> */}
      </div>

      {/* Code Area */}
      <div className="min-h-[320px] overflow-x-auto bg-[#0F111A] p-6">
        {isLoading ? (
          <div className="flex h-[280px] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-slate-300" />
          </div>
        ) : (
          <div className="tabbed-code-content flex text-sm leading-6 font-mono">
            {/* Line Numbers */}
            <div className="shrink-0 select-none pr-4 text-right text-slate-700">
              {lines.map((_, idx) => (
                <div key={idx}>{idx + 1}</div>
              ))}
            </div>
            {/* Highlighted Code */}
            <div
              className="shiki-inline flex-1 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: highlightedCodes[activeTab] || '' }}
            />
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="flex items-center justify-between border-t border-white/5 bg-white/5 px-4 py-1.5 text-[10px] text-slate-500 font-mono">
        <div className="flex gap-3">
          <span>UTF-8</span>
          <span>{currentTab?.language === 'tsx' ? 'TypeScript JSX' : currentTab?.language === 'ts' ? 'TypeScript' : currentTab?.language?.toUpperCase() || 'Text'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-brand-500 h-1.5 w-1.5 animate-pulse rounded-full"></div>
          <span>Ln {lines.length}, Col 1</span>
        </div>
      </div>

      <style>{`
        .shiki-inline pre {
          background: transparent !important;
          margin: 0;
          padding: 0;
        }
        .shiki-inline code {
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
        }
        .tabbed-code-content {
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
        }
      `}</style>
    </div>
  )
}

