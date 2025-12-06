import type { CSSProperties, FC, ReactNode } from 'react'
import styles from './Tag.module.css'

export type TagColor = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
export type TagVariant = 'solid' | 'outline'
export type TagSize = 'sm' | 'md'

export interface TagProps {
  children?: ReactNode
  color?: TagColor
  variant?: TagVariant
  size?: TagSize
  closable?: boolean
  onClose?: (event: React.MouseEvent<HTMLButtonElement>) => void
  onClick?: (event: React.MouseEvent<HTMLSpanElement | HTMLButtonElement>) => void
  className?: string
  style?: CSSProperties
}

export const Tag: FC<TagProps> = ({
  children,
  color = 'neutral',
  variant = 'outline',
  size = 'md',
  closable = false,
  onClose,
  onClick,
  className = '',
  style,
}) => {
  const TagElement: 'button' | 'span' = onClick ? 'button' : 'span'

  const tagClassName = [
    styles.tag,
    styles[`size-${size}`],
    styles[`variant-${variant}`],
    styles[`color-${color}`],
    onClick && styles.clickable,
    closable && styles.closable,
    className,
  ].filter(Boolean).join(' ')

  return (
    <TagElement
      type={onClick ? 'button' : undefined}
      className={tagClassName}
      style={style}
      onClick={onClick}
    >
      <span>{children}</span>
      {closable && (
        <button
          type="button"
          className={styles.close}
          onClick={(e) => {
            e.stopPropagation()
            onClose?.(e)
          }}
          aria-label="Close"
        >
          ×
        </button>
      )}
    </TagElement>
  )
}
