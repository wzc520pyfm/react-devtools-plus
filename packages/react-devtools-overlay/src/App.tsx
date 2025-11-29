import type { MouseEvent } from 'react'
import { toggleInspector } from '@react-devtools/kit'
import { useRef } from 'react'
import { FloatingButton } from './components/FloatingButton'
import { IframeContainer } from './components/IframeContainer'
import { useIframe } from './composables/useIframe'
import { usePanelVisible } from './composables/usePanelVisible'
import { usePosition } from './composables/usePosition'
import './styles.css'

export function App() {
  const anchorRef = useRef<HTMLDivElement | null>(null)
  const { panelVisible, setPanelVisible, togglePanel } = usePanelVisible()
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
      className={`react-devtools-anchor ${panelVisible ? 'react-devtools-anchor--active' : ''}`}
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
