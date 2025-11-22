import { useEffect, useRef, useState } from 'react'

export function usePosition(panelVisible: boolean) {
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(true)
  const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight - 25 })
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const windowSizeRef = useRef({ width: window.innerWidth, height: window.innerHeight })

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!panelVisible) {
        setIsHovering(false)
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [panelVisible])

  useEffect(() => {
    // Sync ref with current window size on mount/update
    windowSizeRef.current = { width: window.innerWidth, height: window.innerHeight }

    const handleResize = () => {
      if (isDragging)
        return

      const prevWidth = windowSizeRef.current.width
      const prevHeight = windowSizeRef.current.height
      const currWidth = window.innerWidth
      const currHeight = window.innerHeight

      // Skip if dimensions haven't effectively changed
      if (prevWidth === currWidth && prevHeight === currHeight)
        return

      setPosition((prev) => {
        let newX = prev.x
        let newY = prev.y

        // Check alignment relative to PREVIOUS window dimensions
        const prevCenterX = prevWidth / 2
        const isCentered = Math.abs(prev.x - prevCenterX) < 50
        const isAtBottom = prev.y > prevHeight - 50

        // Horizontal positioning
        if (isCentered) {
          newX = currWidth / 2
        }
        else {
          // Maintain distance from the closest side
          if (prev.x > prevWidth / 2) {
            const distRight = prevWidth - prev.x
            newX = currWidth - distRight
          }
          // else keep x (distance from left)
        }

        // Vertical positioning
        if (isAtBottom) {
          newY = currHeight - 25
        }
        else {
          // Maintain distance from the closest vertical edge
          if (prev.y > prevHeight / 2) {
            const distBottom = prevHeight - prev.y
            newY = currHeight - distBottom
          }
          // else keep y (distance from top)
        }

        // Clamp within new bounds
        newX = Math.max(25, Math.min(currWidth - 25, newX))
        newY = Math.max(25, Math.min(currHeight - 25, newY))

        return { x: newX, y: newY }
      })

      // Update ref for next resize event
      windowSizeRef.current = { width: currWidth, height: currHeight }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isDragging])

  useEffect(() => {
    const handlePointerUp = () => {
      setIsDragging(false)
    }
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [])

  const bringUp = () => {
    setIsHovering(true)
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    hoverTimeoutRef.current = setTimeout(() => {
      if (!panelVisible && !isDragging) {
        setIsHovering(false)
      }
    }, 2000)
  }

  const handleButtonPointerDown = (
    e: React.PointerEvent,
    onToggle: () => void,
  ) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.target !== e.currentTarget && (e.target as HTMLElement).closest('iframe')) {
      return
    }

    const dragStart = { x: e.clientX, y: e.clientY, isDragging: false }

    const handlePointerMove = (e: PointerEvent) => {
      const deltaX = Math.abs(e.clientX - dragStart.x)
      const deltaY = Math.abs(e.clientY - dragStart.y)

      if (deltaX > 5 || deltaY > 5) {
        if (!dragStart.isDragging) {
          dragStart.isDragging = true
          setIsDragging(true)
        }

        setPosition({
          x: e.clientX,
          y: e.clientY,
        })
      }
    }

    const handlePointerUp = (upEvent: PointerEvent) => {
      const wasDragging = dragStart.isDragging
      setIsDragging(false)
      dragStart.isDragging = false
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)

      if (!wasDragging) {
        onToggle()
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const isHidden = !panelVisible && !isHovering && !isDragging
  const isAtBottom = position.y > window.innerHeight - 100

  // Calculate rotation based on position relative to edges
  const isVertical = position.x < 50 || position.x > window.innerWidth - 50
  const isRight = position.x > window.innerWidth - 50
  const isBottom = position.y > window.innerHeight - 50

  let rotation = 0
  if (isVertical) {
    rotation = isRight ? -90 : 90
  }
  else {
    rotation = isBottom ? 0 : 180
  }

  return {
    position,
    isDragging,
    isHovering,
    isHidden,
    isAtBottom,
    rotation,
    bringUp,
    handleButtonPointerDown,
  }
}
