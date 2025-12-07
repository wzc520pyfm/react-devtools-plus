import React, { useEffect, useRef, useState } from 'react'

interface GlowCardProps {
  children: React.ReactNode
  className?: string
  mousePosition?: { x: number, y: number } | null
}

export const GlowCard: React.FC<GlowCardProps> = ({ children, className = '', mousePosition }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [localPosition, setLocalPosition] = useState({ x: 0, y: 0 })
  const [isNear, setIsNear] = useState(false)

  useEffect(() => {
    if (!cardRef.current || !mousePosition) {
      setIsNear(false)
      return
    }

    const rect = cardRef.current.getBoundingClientRect()
    const cardCenterX = rect.left + rect.width / 2
    const cardCenterY = rect.top + rect.height / 2

    // Calculate distance from mouse to card center
    const distance = Math.sqrt(
      (mousePosition.x - cardCenterX) ** 2
      + (mousePosition.y - cardCenterY) ** 2,
    )

    // If mouse is within 400px of card center, show glow
    const threshold = 400
    setIsNear(distance < threshold)

    // Calculate local position relative to card
    setLocalPosition({
      x: mousePosition.x - rect.left,
      y: mousePosition.y - rect.top,
    })
  }, [mousePosition])

  return (
    <div
      ref={cardRef}
      className={`group relative ${className}`}
    >
      {/* Border glow container */}
      <div
        className="absolute rounded-3xl blur-[2px] transition-opacity duration-300 -inset-[1px]"
        style={{
          opacity: isNear ? 1 : 0,
          background: `radial-gradient(350px circle at ${localPosition.x}px ${localPosition.y}px, rgba(56, 189, 248, 0.5), transparent 50%)`,
        }}
      />

      {/* Card border */}
      <div
        className="absolute inset-0 rounded-3xl transition-all duration-300"
        style={{
          background: isNear
            ? `radial-gradient(350px circle at ${localPosition.x}px ${localPosition.y}px, rgba(56, 189, 248, 0.35), rgba(255, 255, 255, 0.1) 50%)`
            : 'rgba(255, 255, 255, 0.1)',
          padding: '1px',
        }}
      >
        <div className="h-full w-full rounded-[23px] bg-slate-900/95" />
      </div>

      {/* Inner glow effect */}
      <div
        className="pointer-events-none absolute inset-[1px] rounded-[23px] transition-opacity duration-300"
        style={{
          opacity: isNear ? 1 : 0,
          background: `radial-gradient(400px circle at ${localPosition.x}px ${localPosition.y}px, rgba(56, 189, 248, 0.08), transparent 50%)`,
        }}
      />

      {/* Card content */}
      <div className="relative h-full rounded-3xl p-6">
        {children}
      </div>
    </div>
  )
}

// Container component that tracks mouse position for all cards
interface GlowCardGridProps {
  children: (mousePosition: { x: number, y: number } | null) => React.ReactNode
  className?: string
}

export const GlowCardGrid: React.FC<GlowCardGridProps> = ({ children, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | null>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY,
    })
  }

  const handleMouseLeave = () => {
    setMousePosition(null)
  }

  return (
    <div
      ref={containerRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children(mousePosition)}
    </div>
  )
}
