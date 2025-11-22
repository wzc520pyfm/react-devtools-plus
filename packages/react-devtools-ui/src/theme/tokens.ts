import type { ColorPalette } from './types'

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
  none: '0px',
  sm: '2px',
  base: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
}

/**
 * Design tokens for shadows
 * 阴影设计令牌
 */
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
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
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
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
  
  // Color palettes
  Object.entries(colors).forEach(([name, palette]) => {
    Object.entries(palette).forEach(([shade, value]) => {
      vars[`--color-${name}-${shade}`] = value
    })
  })
  
  // Neutral colors
  Object.entries(neutral).forEach(([shade, value]) => {
    vars[`--color-neutral-${shade}`] = value
  })
  
  // Semantic colors (based on mode)
  if (mode === 'light') {
    vars['--color-bg-base'] = neutral[50]
    vars['--color-bg-elevated'] = neutral[100]
    vars['--color-bg-hover'] = neutral[200]
    vars['--color-bg-active'] = neutral[300]
    
    vars['--color-text-primary'] = neutral[900]
    vars['--color-text-secondary'] = neutral[700]
    vars['--color-text-tertiary'] = neutral[500]
    vars['--color-text-disabled'] = neutral[400]
    
    vars['--color-border-base'] = neutral[300]
    vars['--color-border-hover'] = neutral[400]
    vars['--color-border-focus'] = colors.primary[500]
  }
  else {
    vars['--color-bg-base'] = neutral[950]
    vars['--color-bg-elevated'] = neutral[900]
    vars['--color-bg-hover'] = neutral[800]
    vars['--color-bg-active'] = neutral[700]
    
    vars['--color-text-primary'] = neutral[50]
    vars['--color-text-secondary'] = neutral[300]
    vars['--color-text-tertiary'] = neutral[500]
    vars['--color-text-disabled'] = neutral[600]
    
    vars['--color-border-base'] = neutral[700]
    vars['--color-border-hover'] = neutral[600]
    vars['--color-border-focus'] = colors.primary[500]
  }
  
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
  
  return vars
}

