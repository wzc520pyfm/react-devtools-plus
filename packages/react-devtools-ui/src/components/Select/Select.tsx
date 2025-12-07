import type { SelectHTMLAttributes } from 'react'
import styles from './Select.module.css'

export interface SelectOption {
  label: string
  value: string | number
}

export type SelectSize = 'sm' | 'md' | 'lg'

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'size'> {
  options?: SelectOption[]
  onChange?: (value: string) => void
  value?: string | number
  size?: SelectSize
}

export const Select = ({ ref, options = [], onChange, className = '', size = 'md', children, ...props }: SelectProps & { ref?: React.RefObject<HTMLSelectElement | null> }) => {
  const selectClass = [
    styles.select,
    styles[`size-${size}`],
  ].filter(Boolean).join(' ')

  const arrowClass = [
    styles.arrow,
    size === 'sm' && styles['arrow-sm'],
  ].filter(Boolean).join(' ')

  return (
    <div className={`${styles.wrapper}  ${className}`}>
      <select
        className={selectClass}
        onChange={e => onChange?.(e.target.value)}
        ref={ref}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
      <svg className={arrowClass} viewBox="0 0 20 20" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 8l4 4 4-4" />
      </svg>
    </div>
  )
}

Select.displayName = 'Select'
