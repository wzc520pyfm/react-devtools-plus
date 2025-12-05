import type { ComponentDetails, HookInfo, PropValue, RenderedByInfo } from '@react-devtools/kit'
import { getRpcClient, REACT_TAGS } from '@react-devtools/kit'
import { useCallback, useRef, useState } from 'react'

interface ServerRpcFunctions {
  setComponentProp: (fiberId: string, propPath: string, value: string, valueType: string) => boolean
  isEditableProp: (propName: string, valueType: string) => boolean
}

interface ComponentDetailsPanelProps {
  details: ComponentDetails | null
  onSelectNode?: (id: string) => void
  onScrollToComponent?: () => void
  onPropChange?: () => void
}

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: React.ReactNode
}

// Smart Tooltip component - auto-adjusts position based on available space
function Tooltip({ content, children }: { content: string, children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<'bottom' | 'left'>('bottom')
  const triggerRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const tooltipWidth = content.length * 7 + 16 // Estimate tooltip width

      // Check if tooltip would overflow on the right
      if (rect.right + tooltipWidth / 2 > window.innerWidth) {
        setPosition('left')
      }
      else {
        setPosition('bottom')
      }
    }
    setVisible(true)
  }

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && position === 'bottom' && (
        <div className="absolute left-1/2 top-full z-[9999] mt-1.5 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-lg -translate-x-1/2 dark:bg-gray-700">
          {content}
          <div className="absolute bottom-full left-1/2 border-4 border-transparent border-b-gray-900 -translate-x-1/2 dark:border-b-gray-700" />
        </div>
      )}
      {visible && position === 'left' && (
        <div className="absolute right-full top-1/2 z-[9999] mr-1.5 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-lg -translate-y-1/2 dark:bg-gray-700">
          {content}
          <div className="absolute left-full top-1/2 border-4 border-transparent border-l-gray-900 -translate-y-1/2 dark:border-l-gray-700" />
        </div>
      )}
    </div>
  )
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

function getValueColorClass(type: PropValue['type']) {
  switch (type) {
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

/**
 * Check if a prop type is editable
 */
function isEditableType(type: string): boolean {
  const editableTypes = ['string', 'number', 'boolean', 'null', 'undefined']
  return editableTypes.includes(type)
}

/**
 * Check if a prop name is editable
 */
function isEditablePropName(name: string): boolean {
  const nonEditableProps = ['children', 'key', 'ref', '$$typeof']
  return !nonEditableProps.includes(name)
}

interface EditableValueInputProps {
  value: string
  type: string
  onSave: (newValue: string) => void
  onCancel: () => void
}

function EditableValueInput({ value, type, onSave, onCancel }: EditableValueInputProps) {
  // Remove quotes from string values for editing
  const initialValue = type === 'string' ? value.replace(/^"|"$/g, '') : value
  const [editValue, setEditValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSave(editValue)
    }
    else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  const handleBlur = () => {
    onSave(editValue)
  }

  // Auto focus and select on mount
  useState(() => {
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
  })

  if (type === 'boolean') {
    return (
      <select
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onBlur={() => onSave(editValue)}
        onKeyDown={handleKeyDown}
        className="h-5 border border-primary-400 rounded bg-white px-1 text-xs text-purple-600 dark:bg-gray-800 dark:text-purple-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
        autoFocus
      >
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    )
  }

  return (
    <input
      ref={inputRef}
      type={type === 'number' ? 'number' : 'text'}
      value={editValue}
      onChange={e => setEditValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className={`h-5 min-w-[60px] max-w-[200px] border border-primary-400 rounded bg-white px-1 text-xs font-mono dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-primary-500 ${getValueColorClass(type)}`}
      style={{ width: `${Math.max(60, editValue.length * 7 + 16)}px` }}
    />
  )
}

interface PropValueDisplayProps {
  value: PropValue
  name?: string
  depth?: number
  fiberId?: string
  propPath?: string
  onPropChange?: () => void
}

function PropValueDisplay({ value, name, depth = 0, fiberId, propPath, onPropChange }: PropValueDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const hasChildren = value.children && Object.keys(value.children).length > 0
  const isExpandable = hasChildren && (value.type === 'object' || value.type === 'array')

  const isEditable = name !== undefined
    && fiberId
    && propPath
    && isEditableType(value.type)
    && isEditablePropName(name)

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isExpandable) {
      setIsExpanded(!isExpanded)
    }
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isEditable && !isEditing) {
      setIsEditing(true)
    }
  }

  const handleSave = useCallback(async (newValue: string) => {
    if (!fiberId || !propPath)
      return

    const rpc = getRpcClient<ServerRpcFunctions>()
    if (rpc?.setComponentProp) {
      try {
        const success = await rpc.setComponentProp(fiberId, propPath, newValue, value.type)
        if (success) {
          onPropChange?.()
        }
      }
      catch (error) {
        console.error('[ComponentDetailsPanel] Failed to set prop:', error)
      }
    }
    setIsEditing(false)
  }, [fiberId, propPath, value.type, onPropChange])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
  }, [])

  // Build the full prop path for nested properties
  const getChildPropPath = (childName: string) => {
    if (!propPath)
      return childName
    return `${propPath}.${childName}`
  }

  return (
    <div className="text-xs font-mono">
      <div
        className={`group flex items-start gap-1 py-0.5 ${isExpandable ? 'cursor-pointer' : ''} ${isEditable ? 'hover:bg-primary-50 dark:hover:bg-primary-900/20' : ''} rounded`}
        style={{ paddingLeft: `${depth * 12}px` }}
        onClick={handleToggle}
        onDoubleClick={handleDoubleClick}
      >
        {/* Expand/collapse arrow */}
        {isExpandable
          ? (
              <svg
                className={`mt-0.5 h-3 w-3 flex-shrink-0 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            )
          : (
              <span className="w-3 flex-shrink-0" />
            )}

        {/* Property name */}
        {name !== undefined && (
          <>
            <span className="text-pink-600 dark:text-pink-400">{name}</span>
            <span className="text-gray-400">:</span>
          </>
        )}

        {/* Value - editable or readonly */}
        {isEditing
          ? (
              <EditableValueInput
                value={value.value}
                type={value.type}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            )
          : (
              <>
                <span className={getValueColorClass(value.type)} title={value.preview || value.value}>
                  {value.value}
                  {value.preview && !isExpanded && (
                    <span className="ml-1 text-gray-400">{value.preview}</span>
                  )}
                </span>
                {/* Edit hint */}
                {isEditable && (
                  <span className="ml-1 text-[10px] text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-gray-600">
                    (double-click to edit)
                  </span>
                )}
              </>
            )}
      </div>

      {/* Expanded children */}
      {isExpanded && hasChildren && (
        <div>
          {Object.entries(value.children!).map(([childName, childValue]) => (
            <PropValueDisplay
              key={childName}
              name={childName}
              value={childValue}
              depth={depth + 1}
              fiberId={fiberId}
              propPath={getChildPropPath(childName)}
              onPropChange={onPropChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface PropsSectionProps {
  props: Record<string, PropValue>
  fiberId?: string
  onPropChange?: () => void
}

function PropsSection({ props, fiberId, onPropChange }: PropsSectionProps) {
  const entries = Object.entries(props)

  if (entries.length === 0) {
    return (
      <div className="py-1 text-xs text-gray-400 italic">No props</div>
    )
  }

  return (
    <div className="space-y-0.5">
      {entries.map(([name, value]) => (
        <PropValueDisplay
          key={name}
          name={name}
          value={value}
          fiberId={fiberId}
          propPath={name}
          onPropChange={onPropChange}
        />
      ))}
    </div>
  )
}

function HookDisplay({ hook, index }: { hook: HookInfo, index: number }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = hook.value?.children && Object.keys(hook.value.children).length > 0
  const isExpandable = hasChildren && (hook.value?.type === 'object' || hook.value?.type === 'array')

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isExpandable) {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <div className="text-xs font-mono">
      <div
        className={`flex items-start gap-1 py-0.5 ${isExpandable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded' : ''}`}
        onClick={handleToggle}
      >
        {/* Expand/collapse arrow */}
        {isExpandable
          ? (
              <svg
                className={`mt-0.5 h-3 w-3 flex-shrink-0 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            )
          : (
              <span className="w-3 flex-shrink-0" />
            )}

        <span className="text-gray-400">{index}</span>
        <span className="text-cyan-600 dark:text-cyan-400">{hook.name}</span>
        {hook.value && (
          <>
            <span className="text-gray-400">:</span>
            <span className={getValueColorClass(hook.value.type)}>
              {hook.value.value}
              {hook.value.preview && !isExpanded && (
                <span className="ml-1 text-gray-400">{hook.value.preview}</span>
              )}
            </span>
          </>
        )}
      </div>

      {/* Expanded children */}
      {isExpanded && hasChildren && (
        <div>
          {Object.entries(hook.value!.children!).map(([childName, childValue]) => (
            <PropValueDisplay
              key={childName}
              name={childName}
              value={childValue}
              depth={1}
            />
          ))}
        </div>
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

export function ComponentDetailsPanel({ details, onSelectNode, onScrollToComponent, onPropChange }: ComponentDetailsPanelProps) {
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

  // Try to get source from details.source or from data-source-path prop
  const getSourceInfo = () => {
    if (details.source) {
      return details.source
    }
    // Try to parse data-source-path from props
    const dataSourcePath = details.props['data-source-path']
    if (dataSourcePath && dataSourcePath.type === 'string') {
      // Format: "fileName:line:column" or just "fileName"
      const pathValue = dataSourcePath.value.replace(/^"|"$/g, '') // Remove quotes
      const parts = pathValue.split(':')
      if (parts.length >= 1) {
        return {
          fileName: parts[0],
          lineNumber: parts[1] ? Number.parseInt(parts[1], 10) : 1,
          columnNumber: parts[2] ? Number.parseInt(parts[2], 10) : 1,
        }
      }
    }
    return null
  }

  const sourceInfo = getSourceInfo()

  const handleOpenInEditor = () => {
    if (sourceInfo) {
      const rpc = getRpcClient() as any
      if (rpc?.openInEditor) {
        rpc.openInEditor({
          fileName: sourceInfo.fileName,
          line: sourceInfo.lineNumber,
          column: sourceInfo.columnNumber,
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
        <div className="min-w-0 flex flex-1 items-center gap-2">
          <span className="truncate text-sm text-primary-600 font-mono dark:text-primary-400">
            {'<'}
            {details.name}
            {'>'}
          </span>
          {getBadgeForTag(details.tag)}
        </div>
        <div className="flex items-center gap-0.5">
          {/* Scroll to component button - crosshair/target icon like Vue DevTools */}
          <Tooltip content="Scroll to component">
            <button
              type="button"
              className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              onClick={onScrollToComponent}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4" />
                <path d="M12 18v4" />
                <path d="M2 12h4" />
                <path d="M18 12h4" />
              </svg>
            </button>
          </Tooltip>
          {/* Open in editor button - external link icon like Vue DevTools */}
          {sourceInfo && (
            <Tooltip content="Open in editor">
              <button
                type="button"
                className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                onClick={handleOpenInEditor}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <CollapsibleSection
          title="props"
          badge={propsCount > 0 ? <span className="text-xs text-gray-400">{propsCount}</span> : undefined}
        >
          <PropsSection
            props={details.props}
            fiberId={details.id}
            onPropChange={onPropChange}
          />
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
