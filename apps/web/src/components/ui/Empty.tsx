import React from 'react'

export interface EmptyProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

export function Empty({ icon, title, description, action, style, className = '' }: EmptyProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        padding: '56px 24px',
        textAlign: 'center',
        background: 'var(--surface-1, #FFFFFF)',
        border: '1px solid var(--border-subtle, #E7E9EE)',
        borderRadius: 'var(--radius-lg, 12px)',
        boxShadow: 'var(--shadow-xs, 0 1px 2px 0 rgba(16, 24, 40, 0.03))',
        ...style,
      }}
    >
      {icon && (
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-md, 8px)',
            background: 'var(--surface-2, #F7F8F9)',
            border: '1px solid var(--border-subtle, #E7E9EE)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary, #657084)',
          }}
        >
          {icon}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 420 }}>
        <h4
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--text-primary, #172033)',
            margin: 0,
            letterSpacing: 'var(--tracking-tight, -0.01em)',
          }}
        >
          {title}
        </h4>
        {description && (
          <p
            style={{
              fontSize: 13,
              color: 'var(--text-secondary, #657084)',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div style={{ marginTop: 4 }}>{action}</div>}
    </div>
  )
}
