import React from 'react'

interface LogoProps {
  size?: number
  className?: string
}

export const Logo: React.FC<LogoProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={{ width: size, height: size }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Main gradient */}
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* React orbitals - increased ry for more center space */}
      <g filter="url(#glow)">
        {/* Orbital 1 - horizontal */}
        <ellipse
          cx="50"
          cy="50"
          rx="40"
          ry="18"
          stroke="url(#logoGradient)"
          strokeWidth="3"
          fill="none"
        />

        {/* Orbital 2 - tilted right */}
        <ellipse
          cx="50"
          cy="50"
          rx="40"
          ry="18"
          stroke="url(#logoGradient)"
          strokeWidth="3"
          fill="none"
          transform="rotate(60 50 50)"
        />

        {/* Orbital 3 - tilted left */}
        <ellipse
          cx="50"
          cy="50"
          rx="40"
          ry="18"
          stroke="url(#logoGradient)"
          strokeWidth="3"
          fill="none"
          transform="rotate(-60 50 50)"
        />
      </g>

      {/* Center - smaller gear with more breathing room */}
      <g filter="url(#glow)">
        {/* Gear teeth - 6 teeth */}
        {[...Array.from({ length: 6 })].map((_, i) => {
          const angle = (i * 60) * Math.PI / 180
          const innerR = 6
          const outerR = 9.5
          const halfWidth = 0.4
          const x1 = 50 + innerR * Math.cos(angle - halfWidth)
          const y1 = 50 + innerR * Math.sin(angle - halfWidth)
          const x2 = 50 + outerR * Math.cos(angle - halfWidth * 0.5)
          const y2 = 50 + outerR * Math.sin(angle - halfWidth * 0.5)
          const x3 = 50 + outerR * Math.cos(angle + halfWidth * 0.5)
          const y3 = 50 + outerR * Math.sin(angle + halfWidth * 0.5)
          const x4 = 50 + innerR * Math.cos(angle + halfWidth)
          const y4 = 50 + innerR * Math.sin(angle + halfWidth)
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`}
              fill="url(#logoGradient)"
            />
          )
        })}

        {/* Center gear body */}
        <circle
          cx="50"
          cy="50"
          r="6"
          fill="url(#logoGradient)"
        />

        {/* Center hole */}
        <circle
          cx="50"
          cy="50"
          r="2.5"
          fill="#0f172a"
        />
      </g>
    </svg>
  )
}
