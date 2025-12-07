import React, { useEffect, useRef, useState } from 'react'

interface IframeContainerProps {
  iframeRef: React.RefObject<HTMLIFrameElement | null>
  visible: boolean
  width: number
  height: number
  onResize: (size: { width: number, height: number }) => void
  enableDragResize?: boolean
}

export function IframeContainer({ iframeRef, visible, width, height, onResize, enableDragResize }: IframeContainerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    const iframe = iframeRef.current

    if (container && iframe && !container.contains(iframe)) {
      container.appendChild(iframe)
    }
  }, [iframeRef, visible])

  // Update iframe pointer-events during resize to prevent iframe from stealing mouse events
  useEffect(() => {
    const iframe = iframeRef.current
    if (iframe) {
      iframe.style.pointerEvents = isResizing ? 'none' : 'auto'
    }
  }, [isResizing, iframeRef])

  const handleResizeStart = (e: React.PointerEvent, direction: 'top' | 'left' | 'right') => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)

    const startX = e.clientX
    const startY = e.clientY
    const startWidth = width
    const startHeight = height

    const handlePointerMove = (e: PointerEvent) => {
      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY

      let newWidth = startWidth
      let newHeight = startHeight

      if (direction === 'top') {
        newHeight = Math.max(200, startHeight - deltaY)
      }
      else if (direction === 'left') {
        newWidth = Math.max(300, startWidth - deltaX * 2)
      }
      else if (direction === 'right') {
        newWidth = Math.max(300, startWidth + deltaX * 2)
      }

      // Limit max dimensions based on viewport
      newWidth = Math.min(newWidth, window.innerWidth - 40)
      newHeight = Math.min(newHeight, window.innerHeight - 40)

      onResize({ width: newWidth, height: newHeight })
    }

    const handlePointerUp = () => {
      setIsResizing(false)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  return (
    <div
      ref={containerRef}
      className={`react-devtools-iframe-container ${visible ? '' : 'react-devtools-iframe-container--hidden'}`}
      style={{ width, height }}
    >
      {/* Resize Handles */}
      {enableDragResize && (
        <>
          <div
            className="resize-handle resize-handle-top"
            onPointerDown={e => handleResizeStart(e, 'top')}
          />
          <div
            className="resize-handle resize-handle-left"
            onPointerDown={e => handleResizeStart(e, 'left')}
          />
          <div
            className="resize-handle resize-handle-right"
            onPointerDown={e => handleResizeStart(e, 'right')}
          />
        </>
      )}
    </div>
  )
}
