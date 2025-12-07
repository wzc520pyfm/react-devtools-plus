import type { InputHTMLAttributes } from 'react'
import styles from './Checkbox.module.css'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
}

export const Checkbox = ({ ref, checked, onChange, label, disabled, className = '', ...props }: CheckboxProps & { ref?: React.RefObject<HTMLInputElement | null> }) => {
  return (
    <label className={`${styles.checkbox}  ${disabled ? styles.disabled : ''}  ${className}`}>
      <input
        type="checkbox"
        className={styles.input}
        checked={checked}
        onChange={e => onChange?.(e.target.checked)}
        disabled={disabled}
        ref={ref}
        {...props}
      />
      <div className={styles.box}>
        <svg className={styles.checkIcon} viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  )
}

Checkbox.displayName = 'Checkbox'
