import type { ComponentTreeNode } from '@react-devtools-plus/kit'
import { getRpcClient } from '@react-devtools-plus/kit'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactLogo from '~/components/assets/ReactLogo'
import { useComponentTreeHook } from '~/composables/useComponentTreeHook'
import pkg from '../../package.json'

interface ServerRpcFunctions {
  getReactVersion: () => Promise<string | null>
}

interface OverviewPageProps {
  tree: ComponentTreeNode | null
}

function countComponents(node: ComponentTreeNode): number {
  let count = 1
  for (const child of node.children) {
    count += countComponents(child)
  }
  return count
}

function SpotlightCard({
  children,
  className = '',
  to,
  spotlightColor = 'rgb(var(--color-primary-500-rgb) / 0.5)',
}: {
  children: React.ReactNode
  className?: string
  to?: string
  spotlightColor?: string
}) {
  const navigate = useNavigate()
  const divRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current)
      return

    const rect = divRef.current.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleFocus = () => {
    setOpacity(1)
  }

  const handleBlur = () => {
    setOpacity(0)
  }

  const handleMouseEnter = () => {
    setOpacity(1)
  }

  const handleMouseLeave = () => {
    setOpacity(0)
  }

  const handleClick = () => {
    if (to) {
      navigate(to)
    }
  }

  return (
    <div
      ref={divRef}
      className={`relative overflow-hidden rounded-xl bg-gray-100 shadow-sm transition-colors duration-300 dark:bg-gray-800/50 ${to ? 'cursor-pointer' : ''}  ${className}`}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Spotlight Border Layer - High intensity */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-300"
        style={{
          opacity: 1,
          background: `radial-gradient(340px circle at var(--mouse-x) var(--mouse-y), ${spotlightColor}, transparent 42%)`,
        }}
      />

      {/* Content with inner border */}
      <div className={`relative z-10 m-[1px] h-[calc(100%-2px)] w-[calc(100%-2px)] flex flex-col items-center justify-center gap-3 rounded-[11px] bg-white p-6 dark:bg-[#121212] ${to ? 'transition-colors duration-300 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]' : ''}`}>
        {/* Inner Spotlight (Hover effect) - Optional/Subtle */}
        <div
          className="pointer-events-none absolute rounded-[11px] opacity-0 transition duration-300 -inset-px"
          style={{
            opacity,
            background: `radial-gradient(420px circle at ${position.x}px ${position.y}px, ${spotlightColor.replace('/ 0.5)', '/ 0.05')}, transparent 42%)`,
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center gap-3">
          {children}
        </div>
      </div>
    </div>
  )
}

export function OverviewPage({ tree }: OverviewPageProps) {
  const componentCount = tree ? countComponents(tree) : 0
  const [reactVersion, setReactVersion] = useState<string | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Get React version from the host page
  useEffect(() => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (rpc) {
      rpc.getReactVersion().then((version: string | null) => {
        setReactVersion(version)
      }).catch(() => {
        // Fallback if RPC fails
        setReactVersion(null)
      })
    }
  }, [])

  // Handle global mouse move for border proximity
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!gridRef.current)
        return

      const cards = Array.from(gridRef.current.getElementsByClassName('spotlight-card')) as HTMLElement[]
      for (const card of cards) {
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        // Update CSS variables for border light
        card.style.setProperty('--mouse-x', `${x}px`)
        card.style.setProperty('--mouse-y', `${y}px`)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Ensure component tree hook is installed
  useComponentTreeHook(tree)

  return (
    <div className="h-full w-full overflow-auto bg-gray-50/50 p-6 panel-grids dark:bg-neutral-950">
      <div className="min-h-full flex flex-col items-center justify-center">
        <div className="mb-8 flex flex-col items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-primary-500 opacity-20 blur-[80px] dark:opacity-30" />
            <div className="relative flex items-center gap-3">
              <ReactLogo className="animate-spin-slow h-16 w-16 text-primary-500" />
              <h1 className="m-0 from-gray-900 to-gray-600 bg-gradient-to-r bg-clip-text text-5xl text-transparent font-bold dark:from-white dark:to-gray-400">
                DevTools
              </h1>
              <span
                className="absolute"
                style={{
                  top: -2,
                  right: -24,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingInline: '6px',
                  lineHeight: 1,
                  fontSize: '24px',
                  fontWeight: 600,
                  color: 'var(--color-primary-300)',
                  filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.35))',
                }}
                aria-label="Plus Edition"
                title="DevTools Plus"
              >
                +
              </span>
            </div>
          </div>
          <div className="text-center">
            <div className="rounded-full bg-gray-200/50 px-3 py-1 text-xs text-gray-500 font-mono backdrop-blur-sm dark:bg-neutral-800/50 dark:text-gray-400">
              v
              {pkg.version}
            </div>
          </div>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 mb-8 max-w-5xl w-full gap-5 md:grid-cols-3 sm:grid-cols-2"
        >
          <SpotlightCard className="spotlight-card group min-h-[160px]">
            <div className="rounded-full bg-primary-500/10 p-4 transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary-500/20">
              <ReactLogo className="h-8 w-8 text-primary-500" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl text-gray-900 font-bold dark:text-white">
                {reactVersion ? `v${reactVersion}` : 'React'}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Detected Version</span>
            </div>
          </SpotlightCard>

          <SpotlightCard className="spotlight-card group min-h-[160px]" to="/components">
            <div className="rounded-full bg-primary-500/10 p-4 transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" />
              </svg>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl text-gray-900 font-bold dark:text-white">
                {componentCount}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Components Found</span>
            </div>
          </SpotlightCard>

          <SpotlightCard className="spotlight-card group min-h-[160px]">
            <div className="rounded-full bg-primary-500/10 p-4 transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl text-gray-900 font-bold dark:text-white">1</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Active Page</span>
            </div>
          </SpotlightCard>
        </div>

        <div className="flex flex-col gap-6 text-center text-gray-500 dark:text-gray-400">
          <div className="flex justify-center gap-8 text-sm">
            <a href="https://github.com/facebook/react/tree/main/packages/react-devtools" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors hover:text-primary-500">
              <span className="i-carbon-logo-github text-lg" />
              Star on GitHub
            </a>
            <a href="https://react.dev" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors hover:text-primary-500">
              <span className="i-carbon-document text-lg" />
              Documentation
            </a>
          </div>

          <div className="flex items-center gap-3 border border-base rounded-full bg-white px-6 py-2 text-xs shadow-sm dark:bg-[#121212]">
            <span className="font-medium">Shortcuts</span>
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center gap-1.5">
              <kbd className="min-w-[20px] border border-gray-200 rounded-md bg-gray-50 px-1.5 py-0.5 text-center font-medium font-sans shadow-sm dark:border-gray-700 dark:bg-gray-800">⇧</kbd>
              <span>+</span>
              <kbd className="min-w-[20px] border border-gray-200 rounded-md bg-gray-50 px-1.5 py-0.5 text-center font-medium font-sans shadow-sm dark:border-gray-700 dark:bg-gray-800">⌥</kbd>
              <span>+</span>
              <kbd className="min-w-[20px] border border-gray-200 rounded-md bg-gray-50 px-1.5 py-0.5 text-center font-medium font-sans shadow-sm dark:border-gray-700 dark:bg-gray-800">R</kbd>
            </div>
            <span className="text-gray-400 dark:text-gray-500">to toggle</span>
          </div>
        </div>
      </div>
    </div>
  )
}
