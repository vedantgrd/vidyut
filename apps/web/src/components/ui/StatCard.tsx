import React from 'react'

export interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  description?: string
  className?: string
  style?: React.CSSProperties
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  description,
  className = '',
  style,
}) => {
  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--surface-1, #FFFFFF)',
        border: '1px solid var(--border-subtle, #E7E9EE)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '16px 20px',
        boxShadow: 'var(--shadow-xs, 0 1px 2px 0 rgba(16, 24, 40, 0.03))',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        ...style,
      }}
    >
      {icon && (
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: 'var(--brand-subtle, #EDF3FC)',
            border: '1px solid var(--border-subtle, #E7E9EE)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand-primary, #315EAA)',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: 'block',
            fontSize: '11.5px',
            fontWeight: 600,
            color: 'var(--text-secondary, #657084)',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            marginBottom: 3,
          }}
        >
          {label}
        </span>
        <h3
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--text-primary, #172033)',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            margin: 0,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </h3>
        {description && (
          <p
            style={{
              margin: '4px 0 0',
              fontSize: '12px',
              color: 'var(--text-muted, #8A93A3)',
              lineHeight: 1.4,
            }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
