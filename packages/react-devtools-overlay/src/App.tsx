import type { MouseEvent } from 'react'
import { toggleInspector } from '@react-devtools-plus/kit'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FloatingButton } from './components/FloatingButton'
import { IframeContainer } from './components/IframeContainer'
import { useIframe } from './composables/useIframe'
import { usePanelVisible } from './composables/usePanelVisible'
import { usePosition } from './composables/usePosition'
import './styles.css'

/**
 * Preset color themes
 * Must match packages/react-devtools-ui/src/theme/colors.ts
 */
const PRESET_COLORS: Record<string, string> = {
  react: '#00D8FF', // Use our brighter cyan for overlay to match styles.css default, or use #61dafb if strictly matching client
  // user previously used #00D8FF for 'react' case, keeping it or switching?
  // The client PRESET_COLORS says #61dafb.
  // But styles.css fallback is #00D8FF.
  // Let's use the one from PRESET_COLORS to match client, but maybe #00D8FF is better for visibility on white?
  // Let's stick to the list from colors.ts for consistency across preset names.
  // EXCEPTION: 'react' in overlay seems to use #00D8FF in styles.css. I'll allow #00D8FF as a special override or just use the standard one.
  // Let's use the standard ones for the named colors.
  blue: '#3b82f6',
  green: '#10b981',
  purple: '#8b5cf6',
  pink: '#ec4899',
  orange: '#f97316',
  red: '#ef4444',
  yellow: '#f59e0b',
  teal: '#14b8a6',
  indigo: '#6366f1',
}

function useInitialTheme() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Apply theme immediately on mount to avoid flicker
    const applyTheme = () => {
      try {
        const config = (window as any).__REACT_DEVTOOLS_CONFIG__
        const theme = config?.theme

        if (!theme)
          return

        const shouldBeDark = theme?.mode === 'dark'
          || (theme?.mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)

        setIsDark(!!shouldBeDark)

        // Always set the variable, using default if not provided
        const rawPrimaryColor = theme?.primaryColor
        const primaryColor = rawPrimaryColor || '#00D8FF'

        // Resolve preset colors (case-insensitive)
        const normalizedColor = primaryColor.toLowerCase().trim()
        const presetColor = PRESET_COLORS[normalizedColor]
        const resolvedColor = presetColor || (primaryColor === 'react' ? '#00D8FF' : primaryColor)

        // console.log('[React DevTools Overlay] Theme Init:', { rawPrimaryColor, normalizedColor, presetColor, resolvedColor, PRESET_COLORS })

        // Set CSS variable on document root to ensure it's available everywhere in overlay
        document.documentElement.style.setProperty('--color-primary-500', resolvedColor)

        // Convert hex to rgb for box-shadow usage
        if (resolvedColor.startsWith('#')) {
          const r = Number.parseInt(resolvedColor.slice(1, 3), 16)
          const g = Number.parseInt(resolvedColor.slice(3, 5), 16)
          const b = Number.parseInt(resolvedColor.slice(5, 7), 16)
          document.documentElement.style.setProperty('--color-primary-500-rgb', `${r}, ${g}, ${b}`)
        }
      }
      catch (e) {
        // Ignore
      }
    }

    applyTheme()
    // Optional: Listen for theme changes if config object is mutable or if we want to support HMR updates to config
  }, [])

  return [isDark, setIsDark] as const
}

export function App() {
  const anchorRef = useRef<HTMLDivElement | null>(null)
  const { panelVisible, setPanelVisible, togglePanel } = usePanelVisible()
  const [isDark, setIsDark] = useInitialTheme()
  const [isDragResizeEnabled, setIsDragResizeEnabled] = useState(false)

  const handleThemeChange = useCallback((data: { mode: 'light' | 'dark', primaryColor: string }) => {
    const shouldBeDark = data.mode === 'dark'
    setIsDark(shouldBeDark)
  }, [])

  const { iframeRef } = useIframe(panelVisible, setPanelVisible, setIsDragResizeEnabled, handleThemeChange)

  const {
    position,
    isDragging,
    isHidden,
    isAtBottom,
    rotation,
    bringUp,
    handleButtonPointerDown,
  } = usePosition(panelVisible)

  const [size, setSize] = useState({
    width: Math.min(window.innerWidth * 0.8, 1000),
    height: Math.min(window.innerHeight * 0.6, 800),
  })

  const handleToggle = useCallback(() => {
    const newVisible = !panelVisible
    togglePanel()
    if (newVisible) {
      // Bring up button when opening panel
      bringUp()
    }
  }, [panelVisible, togglePanel, bringUp])

  // Listen for keyboard shortcut event (Alt + Shift + D)
  useEffect(() => {
    const handleToggleEvent = () => {
      handleToggle()
    }
    window.addEventListener('react-devtools:toggle-panel', handleToggleEvent)
    return () => {
      window.removeEventListener('react-devtools:toggle-panel', handleToggleEvent)
    }
  }, [handleToggle])

  const handleInspectorClick = (e: MouseEvent) => {
    toggleInspector(true, { mode: 'open-in-editor' })
    setPanelVisible(false)
  }

  // Determine orientation for positioning styles
  const positionAttr
    = rotation === 0
      ? 'bottom'
      : rotation === 180
        ? 'top'
        : rotation === 90
          ? 'left'
          : 'right'

  return (
    <div
      ref={anchorRef}
      className={`react-devtools-anchor ${panelVisible ? 'react-devtools-anchor--active' : ''}  ${isDark ? 'dark' : ''}`}
      data-position={positionAttr}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: isDragging ? 'none' : 'left 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), top 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      }}
      onMouseMove={bringUp}
    >
      <FloatingButton
        isHidden={isHidden}
        isAtBottom={isAtBottom}
        isDragging={isDragging}
        panelVisible={panelVisible}
        rotation={rotation}
        onPointerDown={e => handleButtonPointerDown(e, handleToggle)}
        onInspectorClick={handleInspectorClick}
      />
      <IframeContainer
        iframeRef={iframeRef}
        visible={panelVisible}
        width={size.width}
        height={size.height}
        onResize={setSize}
        enableDragResize={isDragResizeEnabled}
      />
    </div>
  )
}
