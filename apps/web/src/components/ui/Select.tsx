import { forwardRef } from 'react'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options?: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, children, style, ...props }, ref) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary, #657084)' }}>
          {label}
        </label>
      )}
      <select
        ref={ref}
        {...props}
        style={{
          width: '100%',
          height: 36,
          padding: '0 12px',
          background: 'var(--surface-1, #FFFFFF)',
          border: `1px solid ${error ? 'var(--error, #B83E45)' : 'var(--border-default, #E7E9EE)'}`,
          borderRadius: 'var(--radius-md, 8px)',
          color: props.value ? 'var(--text-primary, #172033)' : 'var(--text-tertiary, #8A93A3)',
          fontSize: 13,
          outline: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          boxShadow: 'var(--shadow-xs, 0 1px 2px 0 rgba(16, 24, 40, 0.03))',
          transition: 'border-color var(--transition), box-shadow var(--transition)',
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? 'var(--error, #B83E45)' : 'var(--brand-primary, #315EAA)'
          e.currentTarget.style.boxShadow = error
            ? 'var(--focus-ring-error, 0 0 0 3px rgba(184, 62, 69, 0.16))'
            : 'var(--focus-ring, 0 0 0 3px rgba(49, 94, 170, 0.16))'
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? 'var(--error, #B83E45)' : 'var(--border-default, #E7E9EE)'
          e.currentTarget.style.boxShadow = 'var(--shadow-xs, 0 1px 2px 0 rgba(16, 24, 40, 0.03))'
          props.onBlur?.(e)
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options ? options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>) : children}
      </select>
      {error && <p style={{ fontSize: 11, color: 'var(--error, #B83E45)', margin: 0 }}>{error}</p>}
    </div>
  )
)

Select.displayName = 'Select'
