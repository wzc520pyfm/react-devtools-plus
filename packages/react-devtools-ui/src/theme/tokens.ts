import type { ColorPalette } from './types'
import { colord, extend } from 'colord'
import a11yPlugin from 'colord/plugins/a11y'

extend([a11yPlugin])

// Choose an accessible text color (black/white) based on background contrast
function pickTextColor(bg: string): string {
  const whiteContrast = colord(bg).contrast('#ffffff')
  const darkContrast = colord(bg).contrast('#0f172a')
  return whiteContrast >= darkContrast ? '#ffffff' : '#0f172a'
}

/**
 * Design tokens for spacing
 * 间距设计令牌
 */
export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
}

/**
 * Design tokens for border radius
 * 圆角设计令牌
 */
export const borderRadius = {
  'none': '0px',
  'sm': '6px',
  'base': '10px',
  'md': '14px',
  'lg': '18px',
  'xl': '24px',
  '2xl': '32px',
  '3xl': '48px',
  'full': '9999px',
}

/**
 * Design tokens for shadows
 * 阴影设计令牌
 */
export const shadows = {
  'none': 'none',
  'sm': '0 8px 24px rgba(15, 23, 42, 0.06)',
  'base': '0 10px 30px rgba(15, 23, 42, 0.08)',
  'md': '0 14px 40px rgba(15, 23, 42, 0.1)',
  'lg': '0 18px 55px rgba(15, 23, 42, 0.14)',
  'xl': '0 22px 70px rgba(15, 23, 42, 0.18)',
  '2xl': '0 32px 90px rgba(15, 23, 42, 0.22)',
  'inner': 'inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(15, 23, 42, 0.06)',
}

/**
 * Design tokens for typography
 * 字体设计令牌
 */
export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  fontSize: {
    'xs': '12px',
    'sm': '14px',
    'base': '16px',
    'lg': '18px',
    'xl': '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
  },
  fontWeight: {
    thin: '100',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
}

/**
 * Design tokens for transitions
 * 过渡动画设计令牌
 */
export const transitions = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  timing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    smoothSpring: 'cubic-bezier(0.16, 1, 0.3, 1)',
    softExit: 'cubic-bezier(0.33, 1, 0.68, 1)',
  },
}

/**
 * Design tokens for z-index
 * 层级设计令牌
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
}

/**
 * Generate CSS variables from color palette
 * 从色板生成CSS变量
 */
export function generateCSSVariables(
  colors: Record<string, ColorPalette>,
  neutral: ColorPalette,
  mode: 'light' | 'dark',
) {
  const vars: Record<string, string> = {}

  const setVar = (name: string, value: string) => {
    vars[name] = value
    // Generate RGB variable for opacity support
    // Handle hex colors
    if (value.startsWith('#')) {
      const rgb = colord(value).toRgb()
      vars[`${name}-rgb`] = `${rgb.r} ${rgb.g} ${rgb.b}`
    }
  }

  // Color palettes
  Object.entries(colors).forEach(([name, palette]) => {
    Object.entries(palette).forEach(([shade, value]) => {
      setVar(`--color-${name}-${shade}`, value)
    })
  })

  // Neutral colors
  Object.entries(neutral).forEach(([shade, value]) => {
    setVar(`--color-neutral-${shade}`, value)
  })

  // Semantic colors (based on mode) with opinionated surfaces
  if (mode === 'light') {
    const surfaces = {
      surface: '#f7f9fb',
      panel: 'rgba(255, 255, 255, 0.82)',
      control: 'rgba(255, 255, 255, 0.92)',
      controlStrong: 'rgba(255, 255, 255, 0.98)',
      controlActive: '#e9eef5',
      line: '#dfe5ec',
      lineStrong: '#c6d2e1',
      textPrimary: '#0f172a',
      textSecondary: '#334155',
      textTertiary: '#4b5563',
      textMuted: '#94a3b8',
      glowAccent: 'rgba(77, 163, 255, 0.35)',
      glowAmbient: 'rgba(148, 163, 184, 0.25)',
      contrast: '#111827',
      blur: '12px',
      blurStrong: '18px',
    }

    setVar('--color-bg-base', surfaces.surface)
    setVar('--color-bg-elevated', surfaces.panel)
    setVar('--color-bg-hover', surfaces.control)
    setVar('--color-bg-active', surfaces.controlActive)

    setVar('--color-text-primary', surfaces.textPrimary)
    setVar('--color-text-secondary', surfaces.textSecondary)
    setVar('--color-text-tertiary', surfaces.textTertiary)
    setVar('--color-text-disabled', surfaces.textMuted)

    setVar('--color-border-base', surfaces.line)
    setVar('--color-border-hover', surfaces.lineStrong)
    setVar('--color-border-focus', colors.primary[500])

    setVar('--surface-base', surfaces.surface)
    setVar('--surface-panel', surfaces.panel)
    setVar('--surface-control', surfaces.control)
    setVar('--surface-control-strong', surfaces.controlStrong)
    setVar('--surface-contrast', surfaces.contrast)
    setVar('--border-subtle', surfaces.line)
    setVar('--border-strong', surfaces.lineStrong)
    setVar('--glow-accent', surfaces.glowAccent)
    setVar('--glow-ambient', surfaces.glowAmbient)
    setVar('--blur-base', surfaces.blur)
    setVar('--blur-strong', surfaces.blurStrong)
  }
  else {
    const surfaces = {
      surface: '#0d1117',
      panel: 'rgba(22, 27, 34, 0.72)',
      control: 'rgba(25, 32, 43, 0.78)',
      controlStrong: 'rgba(30, 38, 52, 0.82)',
      controlActive: '#1c2533',
      line: '#222b36',
      lineStrong: '#2f3a48',
      textPrimary: '#e8ecf3',
      textSecondary: '#cbd5e1',
      textTertiary: '#94a3b8',
      textMuted: '#64748b',
      glowAccent: 'rgba(108, 182, 255, 0.35)',
      glowAmbient: 'rgba(15, 23, 42, 0.45)',
      contrast: '#0b1017',
      blur: '12px',
      blurStrong: '18px',
    }

    setVar('--color-bg-base', surfaces.surface)
    setVar('--color-bg-elevated', surfaces.panel)
    setVar('--color-bg-hover', surfaces.control)
    setVar('--color-bg-active', surfaces.controlActive)

    setVar('--color-text-primary', surfaces.textPrimary)
    setVar('--color-text-secondary', surfaces.textSecondary)
    setVar('--color-text-tertiary', surfaces.textTertiary)
    setVar('--color-text-disabled', surfaces.textMuted)

    setVar('--color-border-base', surfaces.line)
    setVar('--color-border-hover', surfaces.lineStrong)
    setVar('--color-border-focus', colors.primary[500])

    setVar('--surface-base', surfaces.surface)
    setVar('--surface-panel', surfaces.panel)
    setVar('--surface-control', surfaces.control)
    setVar('--surface-control-strong', surfaces.controlStrong)
    setVar('--surface-contrast', surfaces.contrast)
    setVar('--border-subtle', surfaces.line)
    setVar('--border-strong', surfaces.lineStrong)
    setVar('--glow-accent', surfaces.glowAccent)
    setVar('--glow-ambient', surfaces.glowAmbient)
    setVar('--blur-base', surfaces.blur)
    setVar('--blur-strong', surfaces.blurStrong)
  }

  // Accent + semantics
  setVar('--accent', colors.primary[500])
  setVar('--accent-strong', colors.primary[600])
  setVar('--accent-weak', colors.primary[300])
  setVar('--semantic-success', colors.success[500])
  setVar('--semantic-warning', colors.warning[500])
  setVar('--semantic-error', colors.error[500])
  setVar('--on-accent', pickTextColor(colors.primary[500]))
  setVar('--on-success', pickTextColor(colors.success[500]))
  setVar('--on-warning', pickTextColor(colors.warning[500]))
  setVar('--on-error', pickTextColor(colors.error[500]))
  setVar('--on-info', pickTextColor(colors.info[500]))
  setVar('--on-neutral', pickTextColor(colors.neutral[500]))

  // Spacing
  Object.entries(spacing).forEach(([key, value]) => {
    vars[`--spacing-${key}`] = value
  })

  // Border radius
  Object.entries(borderRadius).forEach(([key, value]) => {
    vars[`--radius-${key}`] = value
  })

  // Shadows
  Object.entries(shadows).forEach(([key, value]) => {
    vars[`--shadow-${key}`] = value
  })

  // Motion primitives
  vars['--motion-hover'] = `${transitions.duration.fast} ${transitions.timing.easeOut}`
  vars['--motion-press'] = `${transitions.duration.fast} ${transitions.timing.smoothSpring}`
  vars['--motion-overlay'] = `${transitions.duration.slow} ${transitions.timing.smoothSpring}`
  vars['--motion-overlay-exit'] = `${transitions.duration.slower} ${transitions.timing.softExit}`

  // Blur layers
  vars['--blur-1'] = '12px'
  vars['--blur-2'] = '18px'

  return vars
}
