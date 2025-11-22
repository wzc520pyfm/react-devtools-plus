import type { FC, ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Theme, ThemeConfig, ThemeMode } from '../theme/types'
import { applyTheme, createTheme, resolveThemeMode, watchSystemDarkMode } from '../theme'

/**
 * Theme context
 */
interface ThemeContextValue {
  theme: Theme
  config: ThemeConfig
  setMode: (mode: ThemeMode) => void
  setPrimaryColor: (color: string) => void
  toggleMode: () => void
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

/**
 * Theme Provider Component
 */
export const ThemeProvider: FC<ThemeProviderProps> = ({
  children,
  config: initialConfig = {},
  storageKey = 'react-devtools-theme',
}) => {
  // Load persisted config from localStorage
  const [config, setConfig] = useState<ThemeConfig>(() => {
    if (typeof window === 'undefined')
      return initialConfig
    
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        return { ...initialConfig, ...JSON.parse(stored) }
      }
    }
    catch (err) {
      console.warn('[Theme] Failed to load persisted config:', err)
    }
    
    return initialConfig
  })
  
  // Create theme from config
  const theme = useMemo(() => createTheme(config), [config])
  
  // Persist config changes
  useEffect(() => {
    if (typeof window === 'undefined')
      return
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(config))
    }
    catch (err) {
      console.warn('[Theme] Failed to persist config:', err)
    }
  }, [config, storageKey])
  
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
    
    toggleMode: () => {
      const currentMode = resolveThemeMode(config.mode || 'auto')
      const nextMode = currentMode === 'light' ? 'dark' : 'light'
      setConfig(prev => ({ ...prev, mode: nextMode }))
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
export function useThemeColors() {
  const { theme } = useTheme()
  return theme.colors
}

