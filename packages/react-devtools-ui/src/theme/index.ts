import type { Theme, ThemeConfig, ThemeMode } from './types'
import {
  generateNeutralColors,
  generateSemanticColors,
  PRESET_COLORS,
  resolveThemeColor,
} from './colors'
import {
  borderRadius,
  generateCSSVariables,
  shadows,
  spacing,
  transitions,
  typography,
  zIndex,
} from './tokens'

/**
 * Detect system dark mode preference
 * 检测系统暗黑模式偏好
 */
export function detectSystemDarkMode(): boolean {
  if (typeof window === 'undefined')
    return false

  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Resolve theme mode (auto -> light/dark)
 * 解析主题模式
 */
export function resolveThemeMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'auto') {
    return detectSystemDarkMode() ? 'dark' : 'light'
  }
  return mode
}

/**
 * Create theme from configuration
 * 根据配置创建完整主题
 */
export function createTheme(config: ThemeConfig = {}): Theme {
  const {
    mode = 'auto',
    primaryColor = 'react',
    colors: customColors = {},
  } = config

  // Resolve mode
  const resolvedMode = resolveThemeMode(mode)

  // Resolve primary color
  const resolvedPrimaryColor = resolveThemeColor(primaryColor)

  // Generate semantic colors from primary color
  const semanticColors = generateSemanticColors(resolvedPrimaryColor)

  // Merge with custom colors
  const colors = {
    primary: { ...semanticColors.primary, ...customColors.primary },
    success: { ...semanticColors.success, ...customColors.success },
    warning: { ...semanticColors.warning, ...customColors.warning },
    error: { ...semanticColors.error, ...customColors.error },
    info: { ...semanticColors.info, ...customColors.info },
    neutral: generateNeutralColors(resolvedMode === 'dark'),
  }

  // Generate CSS variables
  const cssVars = generateCSSVariables(colors, colors.neutral, resolvedMode)

  return {
    mode: resolvedMode,
    colors,
    spacing,
    borderRadius,
    shadows,
    typography,
    transitions,
    zIndex,
    cssVars,
  }
}

/**
 * Apply theme to DOM
 * 将主题应用到DOM
 */
export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined')
    return

  const root = document.documentElement

  // Use a style tag instead of inline styles to avoid clutter
  let styleTag = document.getElementById('react-devtools-theme-styles')
  if (!styleTag) {
    styleTag = document.createElement('style')
    styleTag.id = 'react-devtools-theme-styles'
    document.head.appendChild(styleTag)
  }

  // Build CSS string
  const cssRules = Object.entries(theme.cssVars)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n')

  styleTag.textContent = `:root {\n${cssRules}\n}`

  // Set data-theme attribute for CSS selectors
  root.setAttribute('data-theme', theme.mode)

  // Toggle 'dark' class for Tailwind/UnoCSS
  if (theme.mode === 'dark') {
    root.classList.add('dark')
  }
  else {
    root.classList.remove('dark')
  }
}

/**
 * Watch system dark mode changes
 * 监听系统暗黑模式变化
 */
export function watchSystemDarkMode(callback: (isDark: boolean) => void): () => void {
  if (typeof window === 'undefined')
    return () => {}

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handler = (e: MediaQueryListEvent | MediaQueryList) => {
    callback(e.matches)
  }

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }

  // Legacy browsers
  mediaQuery.addListener(handler as any)
  return () => mediaQuery.removeListener(handler as any)
}

// Export utilities
export * from './colors'
export * from './tokens'
export * from './types'

// Export preset colors for easy access
export { PRESET_COLORS }
