'use client'

import { useState } from 'react'

interface FeatureCardProps {
  title: string
  description: string
}

export default function FeatureCard({ title, description }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered
          ? '0 8px 30px rgba(97, 218, 251, 0.15)'
          : 'none',
      }}
    >
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}
