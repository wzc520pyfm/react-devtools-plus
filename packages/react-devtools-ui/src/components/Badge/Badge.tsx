import type { CSSProperties, FC, ReactNode } from 'react'
import styles from './Badge.module.css'

export interface BadgeProps {
  /**
   * Badge content
   */
  children?: ReactNode

  /**
   * Badge count or text
   */
  count?: number | string

  /**
   * Show dot instead of count
   * @default false
   */
  dot?: boolean

  /**
   * Max count to display
   * @default 99
   */
  max?: number

  /**
   * Badge color
   * @default 'primary'
   */
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'

  /**
   * Badge size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Show zero count
   * @default false
   */
  showZero?: boolean

  /**
   * Additional CSS class
   */
  className?: string

  /**
   * Custom styles
   */
  style?: CSSProperties
}

export const Badge: FC<BadgeProps> = ({
  children,
  count = 0,
  dot = false,
  max = 99,
  color = 'primary',
  size = 'md',
  showZero = false,
  className = '',
  style,
}) => {
  const numericCount = typeof count === 'number' ? count : 0
  const displayCount = numericCount > max ? `${max}+` : count
  const showBadge = dot || showZero || (numericCount > 0) || (typeof count === 'string' && count)

  if (!children) {
    // Standalone badge
    return (
      <span
        className={[
          styles.standalone,
          styles[`color-${color}`],
          styles[`size-${size}`],
          dot && styles.dot,
          className,
        ].filter(Boolean).join(' ')}
        style={style}
      >
        {!dot && displayCount}
      </span>
    )
  }

  return (
    <span className={[styles.wrapper, className].filter(Boolean).join(' ')} style={style}>
      {children}
      {showBadge && (
        <span
          className={[
            styles.badge,
            styles[`color-${color}`],
            styles[`size-${size}`],
            dot && styles.dot,
          ].filter(Boolean).join(' ')}
        >
          {!dot && displayCount}
        </span>
      )}
    </span>
  )
}
