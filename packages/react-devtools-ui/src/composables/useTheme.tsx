import type { FC, ReactNode } from 'react'
import type { Theme, ThemeConfig, ThemeMode } from '../theme/types'
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { applyTheme, createTheme, resolveThemeMode, watchSystemDarkMode } from '../theme'

/**
 * Theme context
 */
interface ThemeContextValue {
  theme: Theme
  config: ThemeConfig
  setMode: (mode: ThemeMode) => void
  setPrimaryColor: (color: string) => void
  toggleMode: (event?: React.MouseEvent) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/**
 * Theme Provider Props
 */
export interface ThemeProviderProps {
  children: ReactNode
  config?: ThemeConfig
  /**
   * Storage key for persisting theme config
   * @default 'react-devtools-theme'
   */
  storageKey?: string
}

const DEFAULT_CONFIG: ThemeConfig = {}

/**
 * Theme Provider Component
 */
export const ThemeProvider: FC<ThemeProviderProps> = ({
  children,
  config: initialConfig = DEFAULT_CONFIG,
  storageKey = 'react-devtools-theme',
}) => {
  // Load persisted config from localStorage
  const [config, setConfig] = useState<ThemeConfig>(() => {
    if (typeof window === 'undefined')
      return initialConfig

    try {
      const stored = localStorage.getItem(storageKey)
      const storedInitial = localStorage.getItem(`${storageKey}-initial`)

      if (stored) {
        const parsedStored = JSON.parse(stored)

        // Check if initial config changed since last time (e.g. developer updated vite.config.ts)
        // If it changed, the new initial config should take precedence over stored user preference
        // for the keys that are defined in initialConfig.
        const initialConfigChanged = storedInitial
          ? JSON.stringify(JSON.parse(storedInitial)) !== JSON.stringify(initialConfig)
          : JSON.stringify(initialConfig) !== '{}' // Treat first time non-empty config as change

        if (initialConfigChanged) {
          return { ...parsedStored, ...initialConfig }
        }

        // Otherwise, user preference (stored) takes precedence
        return { ...initialConfig, ...parsedStored }
      }
    }
    catch (err) {
      console.warn('[Theme] Failed to load persisted config:', err)
    }

    return initialConfig
  })

  // Sync initialConfig changes during runtime (e.g. HMR)
  const initialConfigRef = useRef(initialConfig)
  useEffect(() => {
    if (JSON.stringify(initialConfig) !== JSON.stringify(initialConfigRef.current)) {
      initialConfigRef.current = initialConfig
      setConfig(prev => ({ ...prev, ...initialConfig }))
    }
  }, [initialConfig])

  // Create theme from config
  const theme = useMemo(() => createTheme(config), [config])

  // Persist config changes
  useEffect(() => {
    if (typeof window === 'undefined')
      return

    try {
      localStorage.setItem(storageKey, JSON.stringify(config))
      // Also persist the initialConfig we started with, so we can detect changes next time
      localStorage.setItem(`${storageKey}-initial`, JSON.stringify(initialConfig))
    }
    catch (err) {
      console.warn('[Theme] Failed to persist config:', err)
    }
  }, [config, storageKey, initialConfig])

  // Apply theme to DOM
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Watch system dark mode changes (only when mode is 'auto')
  useEffect(() => {
    if (config.mode !== 'auto')
      return

    const unwatch = watchSystemDarkMode(() => {
      // Force re-render by updating config
      setConfig(prev => ({ ...prev, mode: 'auto' }))
    })

    return unwatch
  }, [config.mode])

  // Context value
  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    config,

    setMode: (mode: ThemeMode) => {
      setConfig(prev => ({ ...prev, mode }))
    },

    setPrimaryColor: (primaryColor: string) => {
      setConfig(prev => ({ ...prev, primaryColor }))
    },

    toggleMode: (event?: React.MouseEvent) => {
      const currentMode = resolveThemeMode(config.mode || 'auto')
      const nextMode = currentMode === 'light' ? 'dark' : 'light'

      // Use View Transitions API if available
      // View Transition API is experimental
      if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setConfig(prev => ({ ...prev, mode: nextMode }))
        return
      }

      // Get click position or center of screen
      const x = event?.clientX ?? window.innerWidth / 2
      const y = event?.clientY ?? window.innerHeight / 2

      // Calculate distance to furthest corner
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      )

      // View Transition API is experimental
      const transition = document.startViewTransition(() => {
        // eslint-disable-next-line react-dom/no-flush-sync
        flushSync(() => {
          setConfig(prev => ({ ...prev, mode: nextMode }))
        })
      })

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ]

        // Animate the new view expanding from the click point
        document.documentElement.animate(
          {
            clipPath,
          },
          {
            duration: 400,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)',
          },
        )
      })
    },
  }), [theme, config])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Use theme hook
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}

/**
 * Use theme mode hook
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useThemeMode() {
  const { theme, setMode, toggleMode } = useTheme()

  return {
    mode: theme.mode,
    setMode,
    toggleMode,
  }
}

/**
 * Use theme colors hook
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useThemeColors() {
  const { theme } = useTheme()
  return theme.colors
}
