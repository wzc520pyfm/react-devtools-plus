import type { ComponentDetails, HookInfo, PropValue, RenderedByInfo } from '@react-devtools/kit'
import { getRpcClient, REACT_TAGS } from '@react-devtools/kit'
import { useState } from 'react'

interface ComponentDetailsPanelProps {
  details: ComponentDetails | null
  onSelectNode?: (id: string) => void
}

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: React.ReactNode
}

function CollapsibleSection({ title, children, defaultOpen = true, badge }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        type="button"
        className="w-full flex items-center justify-between px-3 py-2 text-left text-sm text-gray-700 font-medium hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <svg
            className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-90' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
          <span>{title}</span>
        </div>
        {badge}
      </button>
      {isOpen && (
        <div className="overflow-x-auto px-3 pb-3">
          <div className="min-w-fit">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

function PropValueDisplay({ value, name }: { value: PropValue, name?: string }) {
  const getColorClass = () => {
    switch (value.type) {
      case 'string':
        return 'text-green-600 dark:text-green-400'
      case 'number':
        return 'text-blue-600 dark:text-blue-400'
      case 'boolean':
        return 'text-purple-600 dark:text-purple-400'
      case 'null':
      case 'undefined':
        return 'text-gray-400 dark:text-gray-500'
      case 'function':
        return 'text-cyan-600 dark:text-cyan-400'
      case 'element':
        return 'text-primary-600 dark:text-primary-400'
      case 'array':
      case 'object':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className="flex items-start gap-2 py-1 text-xs font-mono">
      {name && (
        <>
          <span className="text-pink-600 dark:text-pink-400">{name}</span>
          <span className="text-gray-400">:</span>
        </>
      )}
      <span className={getColorClass()} title={value.preview || value.value}>
        {value.value}
      </span>
    </div>
  )
}

function PropsSection({ props }: { props: Record<string, PropValue> }) {
  const entries = Object.entries(props)

  if (entries.length === 0) {
    return (
      <div className="py-1 text-xs text-gray-400 italic">No props</div>
    )
  }

  return (
    <div className="space-y-0.5">
      {entries.map(([name, value]) => (
        <PropValueDisplay key={name} name={name} value={value} />
      ))}
    </div>
  )
}

function HookDisplay({ hook, index }: { hook: HookInfo, index: number }) {
  return (
    <div className="flex items-start gap-2 py-1 text-xs font-mono">
      <span className="text-gray-400">{index}</span>
      <span className="text-cyan-600 dark:text-cyan-400">{hook.name}</span>
      {hook.value && (
        <>
          <span className="text-gray-400">:</span>
          <PropValueDisplay value={hook.value} />
        </>
      )}
    </div>
  )
}

function HooksSection({ hooks }: { hooks: HookInfo[] }) {
  if (hooks.length === 0) {
    return (
      <div className="py-1 text-xs text-gray-400 italic">No hooks</div>
    )
  }

  return (
    <div className="space-y-0.5">
      {hooks.map((hook, index) => (
        <HookDisplay key={index} hook={hook} index={index} />
      ))}
    </div>
  )
}

function getBadgeForTag(tag?: number) {
  if (tag === undefined)
    return null

  if (tag === REACT_TAGS.ForwardRef) {
    return <span className="rounded bg-yellow-100 px-1 py-0.5 text-[10px] text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300">forwardRef</span>
  }
  if (tag === REACT_TAGS.MemoComponent || tag === REACT_TAGS.SimpleMemoComponent) {
    return <span className="rounded bg-orange-100 px-1 py-0.5 text-[10px] text-orange-600 dark:bg-orange-900/30 dark:text-orange-300">memo</span>
  }
  if (tag === REACT_TAGS.ContextProvider) {
    return <span className="rounded bg-purple-100 px-1 py-0.5 text-[10px] text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">provider</span>
  }

  return null
}

function RenderedBySection({ renderedBy, onSelectNode }: { renderedBy: RenderedByInfo[], onSelectNode?: (id: string) => void }) {
  if (renderedBy.length === 0) {
    return (
      <div className="py-1 text-xs text-gray-400 italic">Root component</div>
    )
  }

  const handleClick = (id: string) => {
    onSelectNode?.(id)
  }

  const handleMouseEnter = (id: string) => {
    const rpc = getRpcClient() as any
    if (rpc?.highlightNode) {
      rpc.highlightNode(id)
    }
  }

  const handleMouseLeave = () => {
    const rpc = getRpcClient() as any
    if (rpc?.hideHighlight) {
      rpc.hideHighlight()
    }
  }

  return (
    <div className="space-y-1">
      {renderedBy.map(parent => (
        <button
          key={parent.id}
          type="button"
          className="w-full flex items-center gap-2 rounded px-2 py-1 text-left text-xs font-mono transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => handleClick(parent.id)}
          onMouseEnter={() => handleMouseEnter(parent.id)}
          onMouseLeave={handleMouseLeave}
        >
          <span className="text-primary-600 dark:text-primary-400">{parent.name}</span>
          {getBadgeForTag(parent.tag)}
        </button>
      ))}
    </div>
  )
}

function SourceSection({ source, onOpenInEditor }: { source?: ComponentDetails['source'], onOpenInEditor?: () => void }) {
  if (!source) {
    return (
      <div className="py-1 text-xs text-gray-400 italic">Source not available</div>
    )
  }

  const fileName = source.fileName.split('/').pop() || source.fileName

  return (
    <button
      type="button"
      className="w-full flex items-center gap-2 rounded px-2 py-1 text-left text-xs font-mono transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
      onClick={onOpenInEditor}
      title={`${source.fileName}:${source.lineNumber}:${source.columnNumber}`}
    >
      <svg className="h-3 w-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <polyline points="13 2 13 9 20 9" />
      </svg>
      <span className="text-blue-600 dark:text-blue-400">{fileName}</span>
      <span className="text-gray-400">
        :
        {source.lineNumber}
      </span>
    </button>
  )
}

export function ComponentDetailsPanel({ details, onSelectNode }: ComponentDetailsPanelProps) {
  if (!details) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-sm text-gray-400">
        <svg className="mb-2 h-12 w-12 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
          <path d="m12 12 4 10 1.7-4.3L22 16Z" />
        </svg>
        Select a component to inspect
      </div>
    )
  }

  const handleOpenInEditor = () => {
    if (details.source) {
      const rpc = getRpcClient() as any
      if (rpc?.openInEditor) {
        rpc.openInEditor({
          fileName: details.source.fileName,
          line: details.source.lineNumber,
          column: details.source.columnNumber,
        })
      }
    }
  }

  const propsCount = Object.keys(details.props).length
  const hooksCount = details.hooks.length

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm text-primary-600 font-mono dark:text-primary-400">
            {'<'}
            {details.name}
            {'>'}
          </span>
          {getBadgeForTag(details.tag)}
        </div>
        {details.source && (
          <button
            type="button"
            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            onClick={handleOpenInEditor}
            title="Open in editor"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <CollapsibleSection
          title="props"
          badge={propsCount > 0 ? <span className="text-xs text-gray-400">{propsCount}</span> : undefined}
        >
          <PropsSection props={details.props} />
        </CollapsibleSection>

        <CollapsibleSection
          title="hooks"
          badge={hooksCount > 0 ? <span className="text-xs text-gray-400">{hooksCount}</span> : undefined}
        >
          <HooksSection hooks={details.hooks} />
        </CollapsibleSection>

        <CollapsibleSection title="rendered by">
          <RenderedBySection renderedBy={details.renderedBy} onSelectNode={onSelectNode} />
        </CollapsibleSection>

        {details.source && (
          <CollapsibleSection title="source" defaultOpen={false}>
            <SourceSection source={details.source} onOpenInEditor={handleOpenInEditor} />
          </CollapsibleSection>
        )}

        {details.key !== undefined && details.key !== null && (
          <CollapsibleSection title="key" defaultOpen={false}>
            <div className="py-1 text-xs text-yellow-600 font-mono dark:text-yellow-400">
              "
              {details.key}
              "
            </div>
          </CollapsibleSection>
        )}
      </div>
    </div>
  )
}
