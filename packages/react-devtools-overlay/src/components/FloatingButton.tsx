import type { ReactNode } from 'react'
import React from 'react'

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
          ? `translate(-50%, -50%) rotate(${rotation}deg) translateY(24px) scale(0.9)` // Sinks further down and shrinks slightly
          : `translate(-50%, -50%) rotate(${rotation}deg)`,
      }}
      onPointerDown={onPointerDown} // Dragging handler on the container
    >
      <div className="react-devtools-button" title="Toggle React DevTools">
        <div className="react-devtools-button-icon" style={{ transform: `rotate(${-rotation}deg)` }}>
          {children || (
            <svg viewBox="0 0 128 128" width="24" height="24">
              <circle fill="var(--color-primary-500, #00D8FF)" cx="64" cy="64" r="14" />
              <ellipse fill="none" stroke="var(--color-primary-500, #00D8FF)" strokeWidth="4" cx="64" cy="64" rx="22" ry="54" transform="rotate(30 64 64)" />
              <ellipse fill="none" stroke="var(--color-primary-500, #00D8FF)" strokeWidth="4" cx="64" cy="64" rx="22" ry="54" transform="rotate(-30 64 64)" />
              <ellipse fill="none" stroke="var(--color-primary-500, #00D8FF)" strokeWidth="4" cx="64" cy="64" rx="22" ry="54" transform="rotate(90 64 64)" />
            </svg>
          )}
        </div>
      </div>

      <div className={`react-devtools-expandable ${isHidden ? 'react-devtools-expandable--hidden' : ''}`}>
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary-500, #00D8FF)' }}>
              <circle cx="12" cy="12" r="7" />
              <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
              <path d="M12 2v3" />
              <path d="M12 19v3" />
              <path d="M2 12h3" />
              <path d="M19 12h3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
