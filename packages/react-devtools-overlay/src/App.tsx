import type { MouseEvent } from 'react'
import { toggleInspector } from '@react-devtools/kit'
import { useEffect, useRef, useState } from 'react'
import { FloatingButton } from './components/FloatingButton'
import { IframeContainer } from './components/IframeContainer'
import { useIframe } from './composables/useIframe'
import { usePanelVisible } from './composables/usePanelVisible'
import { usePosition } from './composables/usePosition'
import './styles.css'

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
        const primaryColor = theme?.primaryColor || '#00D8FF'
        const resolvedColor = primaryColor === 'react' ? '#00D8FF' : primaryColor

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

  return isDark
}

export function App() {
  const anchorRef = useRef<HTMLDivElement | null>(null)
  const { panelVisible, setPanelVisible, togglePanel } = usePanelVisible()
  const isDark = useInitialTheme()
  const { iframeRef } = useIframe(panelVisible, setPanelVisible)

  const {
    position,
    isDragging,
    isHidden,
    isAtBottom,
    rotation,
    bringUp,
    handleButtonPointerDown,
  } = usePosition(panelVisible)

  const handleToggle = () => {
    const newVisible = !panelVisible
    togglePanel()
    if (newVisible) {
      // Bring up button when opening panel
      bringUp()
    }
  }

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
      <IframeContainer iframeRef={iframeRef} visible={panelVisible} />
    </div>
  )
}
