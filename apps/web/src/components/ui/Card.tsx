import React from 'react'

export interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  style?: React.CSSProperties
  id?: string
}

export function Card({ children, className = '', hover, onClick, style, id }: CardProps) {
  return (
    <div
      id={id}
      className={className}
      onClick={onClick}
      style={{
        background: 'var(--surface-1, #FFFFFF)',
        border: '1px solid var(--border-subtle, #E7E9EE)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: 24,
        position: 'relative',
        boxShadow: 'var(--shadow-xs, 0 1px 2px 0 rgba(16, 24, 40, 0.03))',
        cursor: onClick ? 'pointer' : undefined,
        transition: hover ? 'border-color var(--transition), box-shadow var(--transition)' : undefined,
        ...style,
      }}
      onMouseEnter={
        hover
          ? (e) => {
              e.currentTarget.style.borderColor = 'var(--border-strong, #D1D5DF)'
              e.currentTarget.style.boxShadow = 'var(--shadow-sm, 0 1px 3px 0 rgba(16, 24, 40, 0.05))'
            }
          : undefined
      }
      onMouseLeave={
        hover
          ? (e) => {
              e.currentTarget.style.borderColor = (style?.border as string)?.split(' ')?.[2] || 'var(--border-subtle, #E7E9EE)'
              e.currentTarget.style.boxShadow = (style?.boxShadow as string) || 'var(--shadow-xs, 0 1px 2px 0 rgba(16, 24, 40, 0.03))'
            }
          : undefined
      }
    >
      {children}
    </div>
  )
}
