import { forwardRef } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightElement?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightElement, rightIcon, className = '', style, ...props }, ref) => {
    const trailingElem = rightElement ?? rightIcon

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {label && (
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary, #657084)' }}>
            {label}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {leftIcon && (
            <span
              style={{
                position: 'absolute',
                left: 10,
                color: 'var(--text-tertiary, #8A93A3)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            {...props}
            className={className}
            style={{
              width: '100%',
              height: 36,
              padding: leftIcon ? '0 12px 0 34px' : '0 12px',
              paddingRight: trailingElem ? 36 : 12,
              background: 'var(--surface-1, #FFFFFF)',
              border: `1px solid ${error ? 'var(--error, #B83E45)' : 'var(--border-default, #E7E9EE)'}`,
              borderRadius: 'var(--radius-md, 8px)',
              color: 'var(--text-primary, #172033)',
              fontSize: 13,
              outline: 'none',
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
          />
          {trailingElem && (
            <span
              style={{
                position: 'absolute',
                right: 10,
                color: 'var(--text-tertiary, #8A93A3)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {trailingElem}
            </span>
          )}
        </div>
        {error && <p style={{ fontSize: 11, color: 'var(--error, #B83E45)', margin: 0 }}>{error}</p>}
        {hint && !error && <p style={{ fontSize: 11, color: 'var(--text-muted, #8A93A3)', margin: 0 }}>{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
