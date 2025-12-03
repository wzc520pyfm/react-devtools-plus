import { useEffect, useRef, useState } from 'react'

// CSS animation keyframes
const styleSheet = `
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(var(--color-primary-500-rgb, 0 216 255), 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(var(--color-primary-500-rgb, 0 216 255), 0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-fade-slide-in {
  animation: fadeSlideIn 0.3s ease-out;
}

.animate-pulse-glow {
  animation: pulseGlow 1s ease-in-out;
}

.animate-slide-in-right {
  animation: slideInRight 0.25s ease-out;
}
`

// Inject styles once
if (typeof document !== 'undefined') {
  const styleId = 'render-reason-panel-styles'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = styleSheet
    document.head.appendChild(style)
  }
}

interface ChangeInfo {
  name: string
  previousValue: any
  currentValue: any
  count: number
}

interface AggregatedChanges {
  propsChanges: ChangeInfo[]
  stateChanges: ChangeInfo[]
  contextChanges: ChangeInfo[]
}

interface FocusedComponentRenderInfo {
  componentName: string
  renderCount: number
  changes: AggregatedChanges
  timestamp: number
}

interface RenderReasonPanelProps {
  componentName: string
  renderCount: number
  renderInfo: FocusedComponentRenderInfo | null
  onClear?: () => void
}

/**
 * Format a value for display
 */
function formatValue(value: any): string {
  if (value === undefined)
    return 'undefined'
  if (value === null)
    return 'null'
  if (typeof value === 'string')
    return `"${value}"`
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value)
  if (Array.isArray(value))
    return `[${value.length} items]`
  if (typeof value === 'object')
    return JSON.stringify(value, null, 0).slice(0, 50)
  return String(value)
}

/**
 * ChangeRow - A single row showing a state/prop/context change
 */
function ChangeRow({ change, index }: { change: ChangeInfo, index: number }) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div
      className="group animate-slide-in-right"
      style={{
        animationDelay: `${index * 80}ms`,
        animationFillMode: 'backwards',
      }}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50"
      >
        <svg
          className={`h-3 w-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>

        <span className="text-sm text-gray-500 dark:text-gray-400">
          {index + 1}
          {getSuffix(index + 1)}
          {' '}
          hook
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          called in
        </span>
        <span className="text-sm text-purple-600 font-medium dark:text-purple-400">
          {change.name}
        </span>
        <span className="ml-auto rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700 font-medium dark:bg-purple-900/40 dark:text-purple-300">
          x
          {change.count}
        </span>
      </button>

      {isExpanded && (
        <div className="ml-6 space-y-1 pb-2 pl-2">
          {/* Previous value */}
          <div className="flex items-start gap-2 rounded-md bg-red-50 px-3 py-2 dark:bg-red-950/30">
            <span className="select-none text-red-500 font-mono dark:text-red-400">-</span>
            <code className="text-sm text-red-700 font-mono dark:text-red-300">
              {formatValue(change.previousValue)}
            </code>
          </div>

          {/* Current value */}
          <div className="flex items-start gap-2 rounded-md bg-green-50 px-3 py-2 dark:bg-green-950/30">
            <span className="select-none text-green-500 font-mono dark:text-green-400">+</span>
            <code className="text-sm text-green-700 font-mono dark:text-green-300">
              {formatValue(change.currentValue)}
            </code>
          </div>
        </div>
      )}
    </div>
  )
}

function getSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}

/**
 * ChangesSection - A section showing a type of changes (props, state, context)
 */
function ChangesSection({ title, changes }: { title: string, changes: ChangeInfo[] }) {
  if (changes.length === 0)
    return null

  return (
    <div className="space-y-2">
      <h4 className="px-1 text-xs text-gray-500 font-semibold uppercase tracking-wider dark:text-gray-400">
        {title}
      </h4>
      <div className="space-y-1">
        {changes.map((change, index) => (
          <ChangeRow key={`${change.name}-${index}`} change={change} index={index} />
        ))}
      </div>
    </div>
  )
}

/**
 * RenderReasonPanel - Shows why a component rendered
 */
export function RenderReasonPanel({ componentName, renderCount, renderInfo, onClear }: RenderReasonPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const prevRenderCountRef = useRef(renderCount)
  const [isFlashing, setIsFlashing] = useState(false)

  // Flash effect when render count increases
  useEffect(() => {
    if (renderCount > prevRenderCountRef.current) {
      setIsFlashing(true)
      const timer = setTimeout(() => setIsFlashing(false), 300)
      prevRenderCountRef.current = renderCount
      return () => clearTimeout(timer)
    }
  }, [renderCount])

  const hasChanges = renderInfo && (
    renderInfo.changes.propsChanges.length > 0
    || renderInfo.changes.stateChanges.length > 0
    || renderInfo.changes.contextChanges.length > 0
  )

  return (
    <div
      ref={panelRef}
      className={`relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-neutral-900 ${isFlashing ? 'ring-2 ring-primary-400 ring-opacity-50' : ''}`}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-50/50 via-transparent to-purple-50/50 dark:from-primary-900/20 dark:to-purple-900/20" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-4 py-3 dark:border-gray-800 dark:from-gray-900 dark:to-neutral-900">
        <div className="flex items-center gap-3">
          <h3 className="text-lg text-gray-900 font-semibold tracking-tight dark:text-gray-100">
            {componentName}
          </h3>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-bold transition-all ${
              isFlashing
                ? 'scale-110 bg-primary-500 text-white'
                : 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
            }`}
          >
            •
            {' '}
            x
            {renderCount}
          </span>
        </div>

        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            title="Clear history"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Why did it render? */}
      <div className="p-4">
        <h4 className="mb-4 flex items-center gap-2 text-base text-gray-800 font-medium dark:text-gray-200">
          <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Why did
          {' '}
          <span className="text-primary-600 dark:text-primary-400">{componentName}</span>
          {' '}
          render?
        </h4>

        {/* Fixed min-height container to prevent layout jumps */}
        <div className="min-h-[120px]">
          {hasChanges
            ? (
                <div className="space-y-4">
                  <ChangesSection title="Changed State" changes={renderInfo!.changes.stateChanges} />
                  <ChangesSection title="Changed Props" changes={renderInfo!.changes.propsChanges} />
                  <ChangesSection title="Changed Context" changes={renderInfo!.changes.contextChanges} />
                </div>
              )
            : (
                <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 py-8 text-center dark:bg-gray-800/50">
                  <svg className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Waiting for component to re-render...
                  </p>
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    Interact with the page to trigger a render
                  </p>
                </div>
              )}
        </div>
      </div>

      {/* Footer with timestamp */}
      {renderInfo && renderInfo.timestamp > 0 && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 dark:border-gray-800 dark:bg-gray-900/50">
          <p className="text-xs text-gray-400">
            Last render:
            {' '}
            {new Date(renderInfo.timestamp).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  )
}

