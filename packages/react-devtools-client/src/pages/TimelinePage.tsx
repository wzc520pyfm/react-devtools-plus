import type { TimelineEvent, TimelineLayersState } from '@react-devtools-plus/kit'
import { getRpcClient } from '@react-devtools-plus/kit'
import { Tag } from '@react-devtools-plus/ui'
import { useCallback, useEffect, useRef, useState } from 'react'
import { pluginEvents } from '../events'

// Server RPC functions
interface ServerRpcFunctions {
  getTimelineState: () => TimelineLayersState
  updateTimelineState: (state: Partial<TimelineLayersState>) => void
  clearTimeline: () => void
}

// Timeline layers configuration
const TIMELINE_LAYERS = [
  { id: 'mouse', label: 'Mouse', color: '#A451AF' },
  { id: 'keyboard', label: 'Keyboard', color: '#8151AF' },
  { id: 'component-event', label: 'Component events', color: '#4FC08D' },
  { id: 'performance', label: 'Performance', color: '#41B86A' },
]

// Format time helper
function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

// Event Info component
function EventInfo({ event }: { event: TimelineEvent | null }) {
  if (!event)
    return null

  const entries = Object.entries(event.data || {})

  return (
    <div className="p-4">
      <h3 className="mb-3 text-sm text-gray-900 font-medium dark:text-gray-100">
        Event Info
      </h3>
      <div className="space-y-2">
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-start gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {key}
              :
            </span>
            <span className="text-sm text-primary-600 font-mono dark:text-primary-400">
              {typeof value === 'object' && value !== null
                ? (value as any).display || JSON.stringify(value)
                : String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Group Info component
function GroupInfo({ events, selectedEvent }: { events: TimelineEvent[], selectedEvent: TimelineEvent | null }) {
  if (!selectedEvent?.groupId)
    return null

  const groupEvents = events.filter(e => e.groupId === selectedEvent.groupId)
  if (groupEvents.length <= 1)
    return null

  const duration = groupEvents.length > 1
    ? groupEvents[groupEvents.length - 1].time - groupEvents[0].time
    : 0

  return (
    <div className="border-t border-base p-4">
      <h3 className="mb-3 text-sm text-gray-900 font-medium dark:text-gray-100">
        Group Info
      </h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">events:</span>
          <span className="text-sm text-primary-600 font-mono dark:text-primary-400">
            {groupEvents.length}
          </span>
        </div>
        {duration > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">duration:</span>
            <span className="text-sm text-primary-600 font-mono dark:text-primary-400">
              {duration}
              ms
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// Timeline Event List Item
function TimelineEventItem({
  event,
  isSelected,
  isLast,
  color,
  onClick,
}: {
  event: TimelineEvent
  isSelected: boolean
  isLast: boolean
  color: string
  onClick: () => void
}) {
  return (
    <div
      className="relative mb-7 h-6 cursor-pointer"
      style={{ color: isSelected ? color : undefined }}
      onClick={onClick}
    >
      {/* Dot */}
      <span
        className="absolute top-1.5 inline-block h-3 w-3 rounded-full"
        style={{ border: `3px solid ${color}` }}
      />
      {/* Line */}
      {!isLast && (
        <span className="absolute left-[5px] top-4.5 h-10 w-0 border-l-2 border-gray-300 border-solid dark:border-gray-600" />
      )}
      {/* Content */}
      <div className="h-full flex items-center truncate pl-5">
        <span className="absolute top-5 pr-2 text-xs text-gray-400 dark:text-gray-500">
          [
          {formatTime(event.time)}
          ]
        </span>
        <span className={isSelected ? 'font-medium' : ''}>{event.title}</span>
        {event.subtitle && (
          <span className="pl-2 text-gray-400">{event.subtitle}</span>
        )}
      </div>
    </div>
  )
}

export function TimelinePage() {
  const [isRecording, setIsRecording] = useState(false)
  const [selectedLayer, setSelectedLayer] = useState('mouse')
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null)
  const [layerEnabled, setLayerEnabled] = useState<Record<string, boolean>>({
    'mouse': true,
    'keyboard': true,
    'component-event': true,
    'performance': true,
  })
  const eventListRef = useRef<HTMLDivElement>(null)

  // Get current layer color
  const currentLayerColor = TIMELINE_LAYERS.find(l => l.id === selectedLayer)?.color || '#4FC08D'

  // Get selected event
  const selectedEvent = selectedEventIndex !== null ? events[selectedEventIndex] : null

  // Group events by groupId for coloring
  const getEventColor = useCallback((event: TimelineEvent, index: number) => {
    const colors = ['#3e5770', '#42b983', '#0098c4']
    // Simple alternating colors based on group changes
    let colorIndex = 0
    for (let i = 0; i <= index; i++) {
      if (i > 0 && events[i].groupId !== events[i - 1].groupId) {
        colorIndex = (colorIndex + 1) % colors.length
      }
    }
    return colors[colorIndex]
  }, [events])

  // Fetch initial state
  useEffect(() => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (rpc?.getTimelineState) {
      rpc.getTimelineState().then((state: TimelineLayersState) => {
        if (state) {
          setIsRecording(state.recordingState)
          setSelectedLayer(state.selected || 'mouse')
          setLayerEnabled({
            'mouse': state.mouseEventEnabled,
            'keyboard': state.keyboardEventEnabled,
            'component-event': state.componentEventEnabled,
            'performance': state.performanceEventEnabled,
          })
        }
      }).catch(() => {})
    }

    // Subscribe to timeline events
    if (rpc && (rpc as any).subscribeToPluginEvent) {
      (rpc as any).subscribeToPluginEvent('timeline', 'event')
    }

    // Listen to timeline events
    const handleTimelineEvent = (data: { layerId: string, event: TimelineEvent }) => {
      if (data.layerId === selectedLayer) {
        setEvents(prev => [...prev, data.event])
      }
    }

    pluginEvents.on('timeline:event', handleTimelineEvent)

    return () => {
      pluginEvents.off('timeline:event', handleTimelineEvent)
    }
  }, [selectedLayer])

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (eventListRef.current) {
      eventListRef.current.scrollTop = eventListRef.current.scrollHeight
    }
  }, [events])

  // Toggle recording
  const toggleRecording = async () => {
    const newState = !isRecording
    setIsRecording(newState)

    const rpc = getRpcClient<ServerRpcFunctions>()
    if (rpc?.updateTimelineState) {
      await rpc.updateTimelineState({ recordingState: newState })
    }
  }

  // Clear events
  const clearEvents = async () => {
    setEvents([])
    setSelectedEventIndex(null)

    const rpc = getRpcClient<ServerRpcFunctions>()
    if (rpc?.clearTimeline) {
      await rpc.clearTimeline()
    }
  }

  // Select layer
  const selectLayer = async (layerId: string) => {
    setSelectedLayer(layerId)
    setEvents([])
    setSelectedEventIndex(null)

    const rpc = getRpcClient<ServerRpcFunctions>()
    if (rpc?.updateTimelineState) {
      await rpc.updateTimelineState({ selected: layerId })
    }
  }

  // Toggle layer enabled
  const toggleLayerEnabled = async (layerId: string) => {
    const newEnabled = !layerEnabled[layerId]
    setLayerEnabled(prev => ({ ...prev, [layerId]: newEnabled }))

    const rpc = getRpcClient<ServerRpcFunctions>()
    if (rpc?.updateTimelineState) {
      const stateKey = {
        'mouse': 'mouseEventEnabled',
        'keyboard': 'keyboardEventEnabled',
        'component-event': 'componentEventEnabled',
        'performance': 'performanceEventEnabled',
      }[layerId]

      if (stateKey) {
        await rpc.updateTimelineState({ [stateKey]: newEnabled })
      }
    }
  }

  return (
    <div className="h-full flex bg-base">
      {/* Left Panel - Layer Selector */}
      <div className="w-64 flex flex-col border-r border-base">
        {/* Recording Controls */}
        <div className="relative flex items-center justify-end border-b border-base border-dashed px-3 py-2">
          {!isRecording && (
            <span className="absolute left-3 text-xs text-gray-400 dark:text-gray-500">
              Not recording
            </span>
          )}
          <div className="flex items-center gap-2">
            {/* Record Button */}
            <button
              type="button"
              onClick={toggleRecording}
              title={isRecording ? 'Stop recording' : 'Start recording'}
              className="flex items-center"
            >
              <span
                className={`h-3.5 w-3.5 inline-flex cursor-pointer rounded-full transition-all ${
                  isRecording
                    ? 'animate-pulse bg-red-500 shadow-[0_0_8px_#ef4444]'
                    : 'bg-gray-900 opacity-70 hover:opacity-100 dark:bg-white'
                }`}
              />
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={clearEvents}
              title="Clear all timelines"
              className="text-gray-600 opacity-70 dark:text-gray-400 hover:opacity-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>

            {/* Info Button */}
            <button
              type="button"
              title="Timeline events can cause significant performance overhead in large applications, so we recommend enabling it only when needed and on-demand."
              className="text-gray-600 opacity-70 dark:text-gray-400 hover:opacity-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </button>
          </div>
        </div>

        {/* Layer List */}
        <div className="flex-1 overflow-auto p-2">
          <ul>
            {TIMELINE_LAYERS.map((layer) => {
              const isSelected = layer.id === selectedLayer
              const enabled = layerEnabled[layer.id]
              const baseRowClass = [
                'group',
                'flex',
                'w-full',
                'items-center',
                'justify-between',
                'gap-2',
                'rounded-md',
                'px-3',
                'py-2.5',
                'text-left',
                'transition-colors',
              ].join(' ')
              return (
                <li key={layer.id}>
                  <button
                    type="button"
                    onClick={() => selectLayer(layer.id)}
                    // eslint-disable-next-line unocss/order
                    className={`${baseRowClass} ${
                      isSelected
                        ? enabled
                          ? 'bg-[var(--color-primary-500)] text-[var(--on-accent)]'
                          : 'bg-[color-mix(in_srgb,var(--color-primary-500),transparent_80%)] text-[var(--color-text-primary)] opacity-70'
                        : enabled
                          ? 'bg-transparent hover:bg-[color-mix(in_srgb,var(--color-primary-500),transparent_80%)] text-[var(--color-text-primary)]'
                          : 'bg-transparent hover:bg-[var(--surface-control-strong)] text-[var(--color-text-tertiary)] opacity-70'
                    }`}
                  >
                    <span className="text-sm">{layer.label}</span>
                    <Tag
                      size="sm"
                      color="primary"
                      variant="solid"
                      // eslint-disable-next-line unocss/order
                      className="duration-200 opacity-0 transition-opacity group-hover:opacity-100"
                      style={{
                        background: enabled ? 'var(--color-primary-600)' : 'var(--surface-control)',
                        borderColor: enabled ? 'var(--color-primary-600)' : 'var(--border-strong)',
                        color: enabled ? 'var(--on-accent)' : 'var(--color-text-disabled)',
                        borderRadius: '6px',
                        paddingInline: '8px',
                        height: '20px',
                        fontSize: '11px',
                        lineHeight: 1,
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLayerEnabled(layer.id)
                      }}
                    >
                      {enabled ? 'Disable' : 'Enable'}
                    </Tag>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Middle Panel - Event List */}
      <div className="flex-1 border-r border-base">
        {events.length > 0
          ? (
              <div ref={eventListRef} className="h-full overflow-auto p-4">
                {events.map((event, index) => (
                  <TimelineEventItem
                    key={event.id}
                    event={event}
                    isSelected={index === selectedEventIndex}
                    isLast={index === events.length - 1}
                    color={getEventColor(event, index)}
                    onClick={() => setSelectedEventIndex(index)}
                  />
                ))}
              </div>
            )
          : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-3 opacity-50">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
                <span className="text-sm">No events</span>
                <span className="mt-1 text-xs opacity-70">
                  {isRecording ? 'Waiting for events...' : 'Start recording to capture events'}
                </span>
              </div>
            )}
      </div>

      {/* Right Panel - Event Details */}
      <div className="w-80 overflow-auto bg-gray-50 dark:bg-neutral-900">
        {selectedEvent
          ? (
              <>
                <EventInfo event={selectedEvent} />
                <GroupInfo events={events} selectedEvent={selectedEvent} />
              </>
            )
          : (
              <div className="h-full flex flex-col items-center justify-center p-4 text-gray-400">
                <span className="text-sm">Select an event to view details</span>
              </div>
            )}
      </div>
    </div>
  )
}
