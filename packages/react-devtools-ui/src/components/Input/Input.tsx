import type { InputHTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'
import styles from './Input.module.css'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  /**
   * Input size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'
  
  /**
   * Input status
   */
  status?: 'error' | 'warning' | 'success'
  
  /**
   * Prefix icon or text
   */
  prefix?: ReactNode
  
  /**
   * Suffix icon or text
   */
  suffix?: ReactNode
  
  /**
   * Allow clear
   * @default false
   */
  allowClear?: boolean
  
  /**
   * Clear callback
   */
  onClear?: () => void
  
  /**
   * Full width
   * @default false
   */
  block?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  size = 'md',
  status,
  prefix,
  suffix,
  allowClear = false,
  onClear,
  block = false,
  className = '',
  disabled,
  value,
  ...rest
}, ref) => {
  const wrapperClassNames = [
    styles.wrapper,
    styles[`size-${size}`],
    status && styles[`status-${status}`],
    disabled && styles.disabled,
    block && styles.block,
    className,
  ].filter(Boolean).join(' ')
  
  const showClear = allowClear && value && !disabled
  
  return (
    <div className={wrapperClassNames}>
      {prefix && (
        <span className={styles.prefix}>{prefix}</span>
      )}
      <input
        ref={ref}
        className={styles.input}
        disabled={disabled}
        value={value}
        {...rest}
      />
      {showClear && (
        <button
          type="button"
          className={styles.clear}
          onClick={onClear}
          tabIndex={-1}
        >
          ×
        </button>
      )}
      {suffix && !showClear && (
        <span className={styles.suffix}>{suffix}</span>
      )}
    </div>
  )
})

Input.displayName = 'Input'

