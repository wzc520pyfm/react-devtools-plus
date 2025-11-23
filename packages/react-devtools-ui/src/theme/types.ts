/**
 * Color palette with shades from 50 to 950
 */
export interface ColorPalette {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950: string
}

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'auto'

/**
 * Theme configuration
 */
export interface ThemeConfig {
  /**
   * Theme mode
   * @default 'auto'
   */
  mode?: ThemeMode

  /**
   * Primary color (preset name or hex color)
   * @default 'react' (#61dafb)
   */
  primaryColor?: string

  /**
   * Custom color palettes
   */
  colors?: {
    primary?: Partial<ColorPalette>
    success?: Partial<ColorPalette>
    warning?: Partial<ColorPalette>
    error?: Partial<ColorPalette>
    info?: Partial<ColorPalette>
  }
}

/**
 * Complete theme object
 */
export interface Theme {
  mode: 'light' | 'dark'
  colors: {
    primary: ColorPalette
    success: ColorPalette
    warning: ColorPalette
    error: ColorPalette
    info: ColorPalette
    neutral: ColorPalette
  }
  spacing: Record<string, string>
  borderRadius: Record<string, string>
  shadows: Record<string, string>
  typography: {
    fontFamily: Record<string, string>
    fontSize: Record<string, string>
    fontWeight: Record<string, string>
    lineHeight: Record<string, string>
  }
  transitions: {
    duration: Record<string, string>
    timing: Record<string, string>
  }
  zIndex: Record<string, number>
  cssVars: Record<string, string>
}
