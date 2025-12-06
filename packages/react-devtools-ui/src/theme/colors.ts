import { colord } from 'colord'

/**
 * Generate a color palette from a base color
 * 基于基础色生成完整的色板（50-950）
 */
export function generateColorPalette(baseColor: string) {
  const color = colord(baseColor)

  return {
    50: color.lighten(0.4).saturate(0.1).toHex(),
    100: color.lighten(0.35).saturate(0.08).toHex(),
    200: color.lighten(0.28).saturate(0.06).toHex(),
    300: color.lighten(0.2).saturate(0.04).toHex(),
    400: color.lighten(0.1).saturate(0.02).toHex(),
    500: baseColor, // 基础色
    600: color.darken(0.1).saturate(0.02).toHex(),
    700: color.darken(0.2).saturate(0.04).toHex(),
    800: color.darken(0.28).saturate(0.06).toHex(),
    900: color.darken(0.35).saturate(0.08).toHex(),
    950: color.darken(0.4).saturate(0.1).toHex(),
  }
}

/**
 * Generate semantic colors from primary color
 * 基于主题色生成语义化颜色
 */
export function generateSemanticColors(primaryColor: string) {
  const primary = colord(primaryColor)

  // 从主题色推导其他语义色
  // Success: 偏向绿色
  const success = primary.hue() > 90 && primary.hue() < 150
    ? primaryColor
    : colord({ h: 120, s: primary.toHsl().s, l: primary.toHsl().l }).toHex()

  // Warning: 偏向黄色
  const warning = colord({ h: 45, s: 90, l: 55 }).toHex()

  // Error: 偏向红色
  const error = colord({ h: 0, s: 80, l: 55 }).toHex()

  // Info: 偏向蓝色
  const info = colord({ h: 210, s: 80, l: 55 }).toHex()

  return {
    primary: generateColorPalette(primaryColor),
    success: generateColorPalette(success),
    warning: generateColorPalette(warning),
    error: generateColorPalette(error),
    info: generateColorPalette(info),
  }
}

/**
 * Generate neutral colors (gray scale)
 * 生成中性色（灰阶）
 */
export function generateNeutralColors(isDark: boolean = false) {
  const baseGray = isDark ? '#1a1a1a' : '#f5f5f5'
  const gray = colord(baseGray)

  if (isDark) {
    return {
      50: gray.lighten(0.35).toHex(),
      100: gray.lighten(0.3).toHex(),
      200: gray.lighten(0.25).toHex(),
      300: gray.lighten(0.2).toHex(),
      400: gray.lighten(0.15).toHex(),
      500: gray.lighten(0.1).toHex(),
      600: gray.toHex(),
      700: gray.darken(0.05).toHex(),
      800: gray.darken(0.1).toHex(),
      900: gray.darken(0.15).toHex(),
      950: gray.darken(0.2).toHex(),
    }
  }

  return {
    50: '#ffffff',
    100: '#fafafa',
    200: '#f5f5f5',
    300: '#e5e5e5',
    400: '#d4d4d4',
    500: '#a3a3a3',
    600: '#737373',
    700: '#525252',
    800: '#404040',
    900: '#262626',
    950: '#171717',
  }
}

/**
 * Preset color themes
 * 预设的主题色
 */
export const PRESET_COLORS = {
  react: '#4fbff0', // React 蓝色（提升对比度的变体）
  blue: '#3b82f6', // 蓝色
  green: '#10b981', // 绿色
  purple: '#8b5cf6', // 紫色
  pink: '#ec4899', // 粉色
  orange: '#f97316', // 橙色
  red: '#ef4444', // 红色
  yellow: '#f59e0b', // 黄色
  teal: '#14b8a6', // 青色
  indigo: '#6366f1', // 靛青色
}

/**
 * Get preset color or custom color
 * 获取预设颜色或自定义颜色
 */
export function resolveThemeColor(color: string): string {
  return PRESET_COLORS[color as keyof typeof PRESET_COLORS] || color
}
