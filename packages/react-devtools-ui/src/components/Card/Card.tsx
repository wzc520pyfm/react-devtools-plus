import type { CSSProperties, FC, ReactNode } from 'react'
import styles from './Card.module.css'

export interface CardProps {
  /**
   * Card title
   */
  title?: string

  /**
   * Card content
   */
  children?: ReactNode

  /**
   * Additional CSS class
   */
  className?: string

  /**
   * Show border
   * @default true
   */
  bordered?: boolean

  /**
   * Hoverable effect
   * @default false
   */
  hoverable?: boolean

  /**
   * Card padding size
   * @default 'md'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg'

  /**
   * Custom styles
   */
  style?: CSSProperties

  /**
   * Click handler
   */
  onClick?: () => void
}

export const Card: FC<CardProps> = ({
  title,
  children,
  className = '',
  bordered = true,
  hoverable = false,
  padding = 'md',
  style,
  onClick,
}) => {
  const classNames = [
    styles.card,
    bordered && styles.bordered,
    hoverable && styles.hoverable,
    styles[`padding-${padding}`],
    className,
  ].filter(Boolean).join(' ')

  return (
    <div
      className={classNames}
      style={style}
      onClick={onClick}
    >
      {title && (
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
        </div>
      )}
      <div className={styles.body}>
        {children}
      </div>
    </div>
  )
}
