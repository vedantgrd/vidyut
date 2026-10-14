import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'success' | 'magic'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const VARIANTS: Record<string, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--brand-primary, #315EAA)',
    color: '#FFFFFF',
    border: '1px solid var(--brand-primary, #315EAA)',
    boxShadow: 'var(--shadow-xs, 0 1px 2px 0 rgba(16, 24, 40, 0.04))',
  },
  secondary: {
    backgroundColor: 'var(--surface-1, #FFFFFF)',
    color: 'var(--text-primary, #172033)',
    border: '1px solid var(--border-strong, #D1D5DF)',
    boxShadow: 'var(--shadow-xs, 0 1px 2px 0 rgba(16, 24, 40, 0.04))',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--text-secondary, #657084)',
    border: '1px solid transparent',
  },
  danger: {
    backgroundColor: 'var(--error-subtle, #FCEEEF)',
    color: 'var(--error, #B83E45)',
    border: '1px solid var(--error-border, rgba(184, 62, 69, 0.2))',
  },
  outline: {
    backgroundColor: 'var(--surface-1, #FFFFFF)',
    color: 'var(--brand-primary, #315EAA)',
    border: '1px solid var(--border-default, #E7E9EE)',
    boxShadow: 'var(--shadow-xs, 0 1px 2px 0 rgba(16, 24, 40, 0.04))',
  },
  success: {
    backgroundColor: 'var(--success, #247A55)',
    color: '#FFFFFF',
    border: '1px solid var(--success, #247A55)',
    boxShadow: 'var(--shadow-xs, 0 1px 2px 0 rgba(16, 24, 40, 0.04))',
  },
  magic: {
    backgroundColor: 'var(--brand-primary, #315EAA)',
    color: '#FFFFFF',
    border: '1px solid var(--brand-primary, #315EAA)',
    boxShadow: 'var(--shadow-xs, 0 1px 2px 0 rgba(16, 24, 40, 0.04))',
  },
}

const SIZES: Record<string, React.CSSProperties> = {
  sm: {
    padding: '0 10px',
    fontSize: '12px',
    height: '30px',
    borderRadius: 'var(--radius-sm, 6px)',
  },
  md: {
    padding: '0 14px',
    fontSize: '13px',
    height: '36px',
    borderRadius: 'var(--radius-md, 8px)',
  },
  lg: {
    padding: '0 18px',
    fontSize: '14px',
    height: '42px',
    borderRadius: 'var(--radius-md, 8px)',
  },
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading,
      leftIcon,
      rightIcon,
      fullWidth,
      children,
      className = '',
      disabled,
      style,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.985 }}
        disabled={disabled || isLoading}
        style={{
          display: fullWidth ? 'flex' : 'inline-flex',
          width: fullWidth ? '100%' : undefined,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          fontWeight: 500,
          cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
          outline: 'none',
          fontFamily: 'inherit',
          transition: 'background-color var(--transition), border-color var(--transition), box-shadow var(--transition)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          opacity: disabled || isLoading ? 0.55 : 1,
          letterSpacing: 'var(--tracking-tight, -0.01em)',
          ...VARIANTS[variant],
          ...SIZES[size],
          ...style,
        }}
        className={className}
        onMouseEnter={(e) => {
          if (disabled || isLoading) return
          if (variant === 'primary' || variant === 'magic') {
            e.currentTarget.style.backgroundColor = 'var(--brand-hover, #254B8D)'
            e.currentTarget.style.borderColor = 'var(--brand-hover, #254B8D)'
          } else if (variant === 'secondary') {
            e.currentTarget.style.backgroundColor = 'var(--surface-hover, #F2F4F7)'
            e.currentTarget.style.borderColor = 'var(--text-tertiary, #8A93A3)'
          } else if (variant === 'ghost') {
            e.currentTarget.style.backgroundColor = 'var(--surface-hover, #F2F4F7)'
          } else if (variant === 'outline') {
            e.currentTarget.style.backgroundColor = 'var(--brand-subtle, #EDF3FC)'
            e.currentTarget.style.borderColor = 'var(--brand-primary, #315EAA)'
          } else if (variant === 'success') {
            e.currentTarget.style.backgroundColor = 'var(--success-hover, #1E6446)'
          } else if (variant === 'danger') {
            e.currentTarget.style.backgroundColor = '#FAD9DB'
          }
          onMouseEnter?.(e)
        }}
        onMouseLeave={(e) => {
          if (disabled || isLoading) return
          const baseVariant = VARIANTS[variant]
          e.currentTarget.style.backgroundColor = (style?.backgroundColor as string) || (baseVariant.backgroundColor as string)
          e.currentTarget.style.borderColor = (style?.borderColor as string) || (baseVariant.borderColor as string)
          onMouseLeave?.(e)
        }}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {isLoading ? <Loader2 size={size === 'sm' ? 12 : 14} className="animate-spin" /> : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
