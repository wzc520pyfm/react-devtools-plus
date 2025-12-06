import type { PropValue } from '@react-devtools-plus/kit'
import { getRpcClient } from '@react-devtools-plus/kit'
import { Badge, Checkbox, Input } from '@react-devtools-plus/ui'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Context Provider information (matches kit types)
 */
interface ContextProviderInfo {
  id: string
  name: string
  value: PropValue
  fiberId: string
  consumerCount: number
  consumers: ContextConsumerInfo[]
  children: ContextProviderInfo[]
  source?: {
    fileName: string
    lineNumber: number
    columnNumber: number
  }
}

interface ContextConsumerInfo {
  id: string
  name: string
  fiberId: string
}

interface ContextTree {
  providers: ContextProviderInfo[]
  totalProviders: number
  totalConsumers: number
}

interface ServerRpcFunctions {
  getContextTree: () => Promise<ContextTree | null>
  getContextProviderDetails: (fiberId: string) => Promise<ContextProviderInfo | null>
  highlightNode: (fiberId: string) => void
  hideHighlight: () => void
  openInEditor: (options: { fileName: string, line: number, column: number }) => void
  setContextValue: (fiberId: string, value: string, valueType: string) => Promise<boolean>
  setContextValueFromJson: (fiberId: string, jsonValue: string) => Promise<boolean>
  setContextValueAtPath: (fiberId: string, path: string, value: string, valueType: string) => Promise<boolean>
}

// Icons
function ContextIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
      <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
      <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
      <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  )
}

// Value display helpers
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
 * Check if a value type is editable
 */
function isEditableType(type: string): boolean {
  const editableTypes = ['string', 'number', 'boolean', 'null', 'undefined']
  return editableTypes.includes(type)
}

// Icons for editing
function PencilIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  )
}

function CancelIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  )
}

function SaveIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  )
}

/**
 * Inline editor with cancel and save buttons (Vue DevTools style)
 */
interface InlineEditorProps {
  value: string
  type: string
  onSave: (newValue: string) => void
  onCancel: () => void
}

function InlineEditor({ value, type, onSave, onCancel }: InlineEditorProps) {
  const initialValue = type === 'string' ? value.replace(/^"|"$/g, '') : value
  const [editValue, setEditValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      onSave(editValue)
    }
    else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      onCancel()
    }
  }

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onSave(editValue)
  }

  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onCancel()
  }

  return (
    <div className="inline-flex items-center gap-1">
      {type === 'boolean'
        ? (
            <select
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-6 border-2 border-primary-400 rounded bg-white px-1 text-xs text-purple-600 dark:bg-gray-800 dark:text-purple-400 focus:outline-none"
              autoFocus
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          )
        : (
            <Input
              ref={inputRef}
              size="sm"
              type={type === 'number' ? 'number' : 'text'}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-w-[96px] text-sm font-mono"
              style={{ width: `${Math.max(96, editValue.length * 8 + 32)}px` }}
            />
          )}

      {/* Cancel button */}
      <button
        type="button"
        onClick={handleCancelClick}
        className="h-6 w-6 flex items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        title="Cancel (Esc)"
      >
        <CancelIcon />
      </button>

      {/* Save button */}
      <button
        type="button"
        onClick={handleSaveClick}
        className="h-6 w-6 flex items-center justify-center rounded text-primary-500 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/30"
        title="Save (Enter)"
      >
        <SaveIcon />
      </button>

      {/* Show current value for reference */}
      <span className="ml-1 text-xs text-gray-400">{value}</span>
    </div>
  )
}

/**
 * Convert PropValue back to actual JavaScript value for JSON serialization
 */
function propValueToJs(value: PropValue): any {
  switch (value.type) {
    case 'string':
      // Remove surrounding quotes
      return value.value.replace(/^"|"$/g, '')
    case 'number':
      return Number(value.value)
    case 'boolean':
      return value.value === 'true'
    case 'null':
      return null
    case 'undefined':
      return undefined
    case 'array':
      if (value.children) {
        return Object.keys(value.children)
          .sort((a, b) => Number(a) - Number(b))
          .map(key => propValueToJs(value.children![key]))
      }
      return []
    case 'object':
      if (value.children) {
        const result: Record<string, any> = {}
        for (const [key, childValue] of Object.entries(value.children)) {
          result[key] = propValueToJs(childValue)
        }
        return result
      }
      return {}
    default:
      return value.value
  }
}

/**
 * JSON Editor component for editing complex objects
 */
interface JsonEditorProps {
  value: PropValue
  onSave: (jsonValue: string) => void
  onCancel: () => void
}

function JsonEditor({ value, onSave, onCancel }: JsonEditorProps) {
  const jsValue = propValueToJs(value)
  const [jsonText, setJsonText] = useState(() => JSON.stringify(jsValue, null, 2))
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSave = () => {
    try {
      JSON.parse(jsonText) // Validate JSON
      setError(null)
      onSave(jsonText)
    }
    catch (e) {
      setError('Invalid JSON')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
    else if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSave()
    }
  }

  return (
    <div className="mt-2 space-y-2">
      <textarea
        ref={textareaRef}
        value={jsonText}
        onChange={e => setJsonText(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`h-48 w-full border rounded bg-white p-2 text-xs font-mono dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
        spellCheck={false}
      />
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-400">
          Cmd/Ctrl+S to save, Escape to cancel
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded bg-gray-100 px-3 py-1 text-xs text-gray-600 transition-colors dark:bg-gray-800 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded bg-primary-500 px-3 py-1 text-xs text-white transition-colors hover:bg-primary-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

interface EditableContextValueProps {
  value: PropValue
  fiberId: string
  /** Dot-separated path for nested properties (empty for root) */
  path?: string
  /** Property name to display (for nested properties) */
  propName?: string
  /** Indentation depth */
  depth?: number
  onValueChange?: () => void
}

function EditableContextValue({
  value,
  fiberId,
  path = '',
  propName,
  depth = 0,
  onValueChange,
}: EditableContextValueProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(depth < 2)
  const hasChildren = value.children && Object.keys(value.children).length > 0
  const isExpandable = hasChildren && (value.type === 'object' || value.type === 'array')
  const isSimpleEditable = isEditableType(value.type)
  const isComplexEditable = value.type === 'object' || value.type === 'array'

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isExpandable && !isEditing) {
      setIsExpanded(!isExpanded)
    }
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleSaveSimple = useCallback(async (newValue: string) => {
    const rpc = getRpcClient<ServerRpcFunctions>()

    try {
      let success = false
      if (path) {
        // Nested property - use setContextValueAtPath
        if (rpc?.setContextValueAtPath) {
          success = await rpc.setContextValueAtPath(fiberId, path, newValue, value.type)
        }
      }
      else {
        // Root value - use setContextValue
        if (rpc?.setContextValue) {
          success = await rpc.setContextValue(fiberId, newValue, value.type)
        }
      }
      if (success) {
        onValueChange?.()
      }
    }
    catch (error) {
      console.error('[ContextPage] Failed to set context value:', error)
    }
    setIsEditing(false)
  }, [fiberId, path, value.type, onValueChange])

  const handleSaveJson = useCallback(async (jsonValue: string) => {
    const rpc = getRpcClient<ServerRpcFunctions>()

    try {
      let success = false
      if (path) {
        // Nested property - parse JSON and use setContextValueAtPath
        if (rpc?.setContextValueAtPath) {
          success = await rpc.setContextValueAtPath(fiberId, path, jsonValue, 'object')
        }
      }
      else {
        // Root value - use setContextValueFromJson
        if (rpc?.setContextValueFromJson) {
          success = await rpc.setContextValueFromJson(fiberId, jsonValue)
        }
      }
      if (success) {
        onValueChange?.()
      }
    }
    catch (error) {
      console.error('[ContextPage] Failed to set context value:', error)
    }
    setIsEditing(false)
  }, [fiberId, path, onValueChange])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
  }, [])

  // For complex types (object/array) in edit mode, show JSON editor
  if (isEditing && isComplexEditable) {
    return (
      <div className="w-full">
        <JsonEditor
          value={value}
          onSave={handleSaveJson}
          onCancel={handleCancel}
        />
      </div>
    )
  }

  const paddingLeft = depth * 12

  return (
    <div className="text-xs font-mono">
      <div
        className={`group flex items-center gap-1 py-0.5 ${isExpandable && !isEditing ? 'cursor-pointer' : ''} rounded`}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={!isEditing ? handleToggle : undefined}
      >
        {isExpandable
          ? (
              <svg
                className={`h-3 w-3 flex-shrink-0 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
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

        {/* Property name (for nested properties) */}
        {propName !== undefined && (
          <>
            <span className="text-pink-600 dark:text-pink-400">{propName}</span>
            <span className="text-gray-400">:</span>
          </>
        )}

        {/* Value display or editor */}
        {isEditing && isSimpleEditable
          ? (
              <InlineEditor
                value={value.value}
                type={value.type}
                onSave={handleSaveSimple}
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

                {/* Edit button - appears on hover (Vue DevTools style) */}
                {(isSimpleEditable || isComplexEditable) && (
                  <button
                    type="button"
                    className="ml-1 h-5 w-5 flex items-center justify-center rounded text-gray-300 opacity-0 transition-all hover:bg-gray-100 dark:text-gray-600 hover:text-gray-600 group-hover:opacity-100 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    onClick={handleEditClick}
                    title={isComplexEditable ? 'Edit as JSON' : 'Edit value'}
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                  </button>
                )}
              </>
            )}
      </div>

      {isExpanded && hasChildren && !isEditing && (
        <div>
          {Object.entries(value.children!).map(([childName, childValue]) => {
            const childPath = path ? `${path}.${childName}` : childName
            return (
              <EditableContextValue
                key={childName}
                value={childValue}
                fiberId={fiberId}
                path={childPath}
                propName={childName}
                depth={depth + 1}
                onValueChange={onValueChange}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function ContextValueDisplay({ value, depth = 0 }: { value: PropValue, depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(depth < 2)
  const hasChildren = value.children && Object.keys(value.children).length > 0
  const isExpandable = hasChildren && (value.type === 'object' || value.type === 'array')

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isExpandable) {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <div className="text-xs font-mono">
      <div
        className={`flex items-start gap-1 py-0.5 ${isExpandable ? 'cursor-pointer hover:bg-gray-50 rounded dark:hover:bg-gray-800/50' : ''}`}
        style={{ paddingLeft: `${depth * 12}px` }}
        onClick={handleToggle}
      >
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

        <span className={getValueColorClass(value.type)} title={value.preview || value.value}>
          {value.value}
          {value.preview && !isExpanded && (
            <span className="ml-1 text-gray-400">{value.preview}</span>
          )}
        </span>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {Object.entries(value.children!).map(([childName, childValue]) => (
            <div key={childName} className="flex items-start gap-1 py-0.5" style={{ paddingLeft: `${(depth + 1) * 12}px` }}>
              <span className="w-3 flex-shrink-0" />
              <span className="text-pink-600 dark:text-pink-400">{childName}</span>
              <span className="text-gray-400">:</span>
              <ContextValueDisplay value={childValue} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Provider card component
interface ProviderCardProps {
  provider: ContextProviderInfo
  level?: number
  onSelectConsumer?: (fiberId: string) => void
  onValueChange?: () => void
}

function ProviderCard({ provider, level = 0, onSelectConsumer, onValueChange }: ProviderCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showConsumers, setShowConsumers] = useState(false)

  const handleMouseEnter = useCallback(() => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (rpc?.highlightNode) {
      rpc.highlightNode(provider.fiberId)
    }
  }, [provider.fiberId])

  const handleMouseLeave = useCallback(() => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (rpc?.hideHighlight) {
      rpc.hideHighlight()
    }
  }, [])

  const handleOpenInEditor = useCallback(() => {
    if (provider.source) {
      const rpc = getRpcClient<ServerRpcFunctions>()
      if (rpc?.openInEditor) {
        rpc.openInEditor({
          fileName: provider.source.fileName,
          line: provider.source.lineNumber,
          column: provider.source.columnNumber,
        })
      }
    }
  }, [provider.source])

  const handleConsumerClick = useCallback((fiberId: string) => {
    onSelectConsumer?.(fiberId)
  }, [onSelectConsumer])

  const handleConsumerMouseEnter = useCallback((fiberId: string) => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (rpc?.highlightNode) {
      rpc.highlightNode(fiberId)
    }
  }, [])

  const handleConsumerMouseLeave = useCallback(() => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (rpc?.hideHighlight) {
      rpc.hideHighlight()
    }
  }, [])

  return (
    <div
      className={`border rounded-lg bg-white shadow-sm transition-shadow dark:bg-neutral-900 hover:shadow-md ${level > 0 ? 'ml-4 mt-2 border-dashed border-gray-300 dark:border-gray-600' : 'border-gray-200 dark:border-gray-700'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded p-0.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDownIcon
              className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
            />
          </button>

          <div className="flex items-center gap-2">
            <ContextIcon className="h-4 w-4 text-purple-500" />
            <span className="text-gray-900 font-medium font-mono dark:text-white">
              {provider.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Consumer count badge */}
          <button
            type="button"
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors ${
              showConsumers
                ? 'bg-purple-500 text-white'
                : 'bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-400 dark:hover:bg-purple-900'
            }`}
            onClick={() => setShowConsumers(!showConsumers)}
            title={`${provider.consumerCount} consumers`}
          >
            <UsersIcon className="h-3 w-3" />
            <span>{provider.consumerCount}</span>
          </button>

          {/* Open in editor button */}
          {provider.source && (
            <button
              type="button"
              className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              onClick={handleOpenInEditor}
              title="Open in editor"
            >
              <ExternalLinkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Value section */}
          <div className="mb-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-gray-500 font-medium tracking-wide uppercase dark:text-gray-400">
              Value
              <span className="rounded bg-primary-100 px-1.5 py-0.5 text-[10px] text-primary-600 font-normal normal-case dark:bg-primary-900/50 dark:text-primary-400">
                editable
              </span>
            </div>
            <div className="rounded bg-gray-50 p-2 dark:bg-gray-800/50">
              <EditableContextValue
                value={provider.value}
                fiberId={provider.fiberId}
                onValueChange={onValueChange}
              />
            </div>
          </div>

          {/* Consumers list */}
          {showConsumers && provider.consumers.length > 0 && (
            <div className="mb-3">
              <div className="mb-1 text-xs text-gray-500 font-medium tracking-wide uppercase dark:text-gray-400">
                Consumers (
                {provider.consumers.length}
                )
              </div>
              <div className="max-h-40 overflow-y-auto rounded bg-gray-50 p-2 space-y-1 dark:bg-gray-800/50">
                {provider.consumers.map(consumer => (
                  <button
                    key={consumer.id}
                    type="button"
                    className="w-full rounded px-2 py-1 text-left text-xs text-primary-600 font-mono transition-colors hover:bg-gray-100 dark:text-primary-400 dark:hover:bg-gray-700"
                    onClick={() => handleConsumerClick(consumer.fiberId)}
                    onMouseEnter={() => handleConsumerMouseEnter(consumer.fiberId)}
                    onMouseLeave={handleConsumerMouseLeave}
                  >
                    {'<'}
                    {consumer.name}
                    {'>'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Source info */}
          {provider.source && (
            <div className="text-xs text-gray-400">
              <span className="font-mono">
                {provider.source.fileName.split('/').pop()}
                :
                {provider.source.lineNumber}
              </span>
            </div>
          )}

          {/* Nested providers */}
          {provider.children.length > 0 && (
            <div className="mt-3">
              <div className="mb-1 text-xs text-gray-500 font-medium tracking-wide uppercase dark:text-gray-400">
                Nested Providers (
                {provider.children.length}
                )
              </div>
              {provider.children.map(child => (
                <ProviderCard
                  key={child.id}
                  provider={child}
                  level={level + 1}
                  onSelectConsumer={onSelectConsumer}
                  onValueChange={onValueChange}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Main ContextPage component
export function ContextPage() {
  const [contextTree, setContextTree] = useState<ContextTree | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchContextTree = useCallback(async () => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (!rpc)
      return

    try {
      const tree = await rpc.getContextTree()
      setContextTree(tree)
    }
    catch (e) {
      console.debug('[ContextPage] Failed to fetch context tree:', e)
    }
    finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContextTree()

    if (autoRefresh) {
      const interval = setInterval(fetchContextTree, 2000)
      return () => clearInterval(interval)
    }
  }, [fetchContextTree, autoRefresh])

  const handleSelectConsumer = useCallback((_fiberId: string) => {
    // TODO: Navigate to components page and select the consumer
    // This would need integration with the parent App component
  }, [])

  // Filter providers based on search query
  const filteredProviders = contextTree?.providers.filter((provider) => {
    if (!searchQuery)
      return true
    const query = searchQuery.toLowerCase()
    return provider.name.toLowerCase().includes(query)
      || provider.consumers.some(c => c.name.toLowerCase().includes(query))
  }) ?? []

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50/50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="h-8 w-8 animate-spin border-2 border-primary-500 border-t-transparent rounded-full" />
          <span>Loading contexts...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-gray-50/50 dark:bg-neutral-950">
      {/* Header */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-[#121212]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ContextIcon className="h-5 w-5 text-primary-500" />
            <h1 className="text-lg text-gray-900 font-semibold dark:text-white">Context</h1>
            <div className="flex items-center gap-2">
              <Badge color="primary" size="sm">
                {contextTree?.totalProviders || 0}
                {' '}
                providers
              </Badge>
              <Badge color="neutral" size="sm">
                {contextTree?.totalConsumers || 0}
                {' '}
                consumers
              </Badge>
            </div>
          </div>

          <div className="flex flex-nowrap items-center gap-3">
            {/* Search */}
            <div>
              <Input
                size="sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                prefix={(
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                )}
                allowClear
                onClear={() => setSearchQuery('')}
              />
            </div>

            {/* Auto refresh toggle */}
            <Checkbox
              className="flex-shrink-0"
              label="Auto"
              checked={autoRefresh}
              onChange={setAutoRefresh}
            />

            {/* Refresh button */}
            <button
              type="button"
              className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              onClick={() => fetchContextTree()}
              title="Refresh"
            >
              <RefreshIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {filteredProviders.length === 0
          ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <ContextIcon className="mb-4 h-16 w-16 opacity-30" />
                <p className="text-lg font-medium">
                  {searchQuery ? 'No matching contexts found' : 'No Context Providers detected'}
                </p>
                <p className="mt-2 text-sm opacity-70">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Create a Context.Provider in your app to see it here'}
                </p>
              </div>
            )
          : (
              <div className="mx-auto max-w-4xl space-y-4">
                {filteredProviders.map(provider => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    onSelectConsumer={handleSelectConsumer}
                    onValueChange={fetchContextTree}
                  />
                ))}
              </div>
            )}
      </div>

      {/* Info footer */}
      <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-2 dark:border-gray-800 dark:bg-[#121212]">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            Hover over a provider to highlight it in the page
          </span>
          <span>
            Click on consumers to navigate to them
          </span>
        </div>
      </div>
    </div>
  )
}
