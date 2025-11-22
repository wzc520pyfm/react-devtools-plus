import type { ReactNode } from 'react'

interface FloatingButtonProps {
  isHidden: boolean
  isAtBottom: boolean
  isDragging: boolean
  panelVisible: boolean
  rotation: number
  onPointerDown: (e: React.PointerEvent) => void
  onInspectorClick: (e: React.MouseEvent) => void
  children?: ReactNode
}

export function FloatingButton({
  isHidden,
  isAtBottom,
  isDragging,
  panelVisible,
  rotation,
  onPointerDown,
  onInspectorClick,
  children,
}: FloatingButtonProps) {
  return (
    <div
      className={`react-devtools-button-group ${isHidden ? 'react-devtools-button--hidden' : ''}  ${panelVisible ? 'react-devtools-button--active' : ''}`}
      style={{
        cursor: isDragging ? 'grabbing' : 'default',
        transform: isHidden
          ? `translate(-50%, -50%) rotate(${rotation}deg) translateY(24px)`
          : `translate(-50%, -50%) rotate(${rotation}deg)`,
      }}
      onPointerDown={onPointerDown} // Dragging handler on the container
    >
      <div className="react-devtools-button" title="Toggle React DevTools">
        <div className="react-devtools-button-icon" style={{ transform: `rotate(${-rotation}deg)` }}>
          {children || (
            <svg viewBox="0 0 128 128" width="24" height="24">
              <path
                fill="#61dafb"
                d="M64 0C28.7 0 0 28.7 0 64s28.7 64 64 64 64-28.7 64-64S99.3 0 64 0zm0 116c-28.7 0-52-23.3-52-52S35.3 12 64 12s52 23.3 52 52-23.3 52-52 52z"
              />
              <circle fill="#61dafb" cx="64" cy="64" r="14" />
              <ellipse fill="none" stroke="#61dafb" strokeWidth="4" cx="64" cy="64" rx="22" ry="54" transform="rotate(30 64 64)" />
              <ellipse fill="none" stroke="#61dafb" strokeWidth="4" cx="64" cy="64" rx="22" ry="54" transform="rotate(-30 64 64)" />
              <ellipse fill="none" stroke="#61dafb" strokeWidth="4" cx="64" cy="64" rx="22" ry="54" transform="rotate(90 64 64)" />
            </svg>
          )}
        </div>
      </div>
      <div className="react-devtools-divider" />
      <div
        className="react-devtools-button react-devtools-inspector-button"
        title="Inspector (Select DOM element)"
        onClick={(e) => {
          e.stopPropagation()
          onInspectorClick(e)
        }}
        onPointerDown={e => e.stopPropagation()} // Prevent dragging when clicking this button
      >
        <div className="react-devtools-button-icon" style={{ transform: `rotate(${-rotation}deg)` }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#61dafb' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </div>
      </div>
    </div>
  )
}
