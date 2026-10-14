import React from 'react'

const VARIANTS = {
  default: { bg: '#F4F5F7', color: '#657084', border: '#E7E9EE' },
  success: { bg: '#EAF5EF', color: '#247A55', border: 'rgba(36, 122, 85, 0.22)' },
  warning: { bg: '#FFF5E3', color: '#996416', border: 'rgba(153, 100, 22, 0.22)' },
  error: { bg: '#FCEEEF', color: '#B83E45', border: 'rgba(184, 62, 69, 0.22)' },
  info: { bg: '#EDF3FC', color: '#315EAA', border: 'rgba(49, 94, 170, 0.22)' },
  accent: { bg: '#EDF3FC', color: '#315EAA', border: 'rgba(49, 94, 170, 0.22)' },
}

export interface BadgeProps {
  children: React.ReactNode
  variant?: keyof typeof VARIANTS
  size?: 'sm' | 'md'
  dot?: boolean
  style?: React.CSSProperties
  className?: string
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  dot,
  style,
  className = '',
}: BadgeProps) {
  const v = VARIANTS[variant] ?? VARIANTS.default
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        borderRadius: 'var(--radius-pill, 9999px)',
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: 600,
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
        fontVariantNumeric: 'tabular-nums',
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: v.color,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  )
}
