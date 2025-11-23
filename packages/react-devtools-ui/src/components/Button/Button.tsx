import type { ButtonHTMLAttributes, CSSProperties, FC, ReactNode } from 'react'
import styles from './Button.module.css'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /**
   * Button content
   */
  children?: ReactNode

  /**
   * Button type
   * @default 'button'
   */
  htmlType?: 'button' | 'submit' | 'reset'

  /**
   * Button variant
   * @default 'default'
   */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'ghost' | 'text'

  /**
   * Button size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean

  /**
   * Loading state
   * @default false
   */
  loading?: boolean

  /**
   * Block level button
   * @default false
   */
  block?: boolean

  /**
   * Icon before content
   */
  icon?: ReactNode

  /**
   * Additional CSS class
   */
  className?: string

  /**
   * Custom styles
   */
  style?: CSSProperties
}

export const Button: FC<ButtonProps> = ({
  children,
  htmlType = 'button',
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  block = false,
  icon,
  className = '',
  style,
  onClick,
  ...rest
}) => {
  const classNames = [
    styles.button,
    styles[`variant-${variant}`],
    styles[`size-${size}`],
    block && styles.block,
    (disabled || loading) && styles.disabled,
    loading && styles.loading,
    className,
  ].filter(Boolean).join(' ')

  return (
    <button
      type={htmlType}
      className={classNames}
      disabled={disabled || loading}
      style={style}
      onClick={onClick}
      {...rest}
    >
      {loading && (
        <span className={styles.spinner} />
      )}
      {!loading && icon && (
        <span className={styles.icon}>{icon}</span>
      )}
      {children && (
        <span className={styles.content}>{children}</span>
      )}
    </button>
  )
}
