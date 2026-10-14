import React from 'react'

export interface LoadingSkeletonProps {
  className?: string
  variant?: 'text' | 'title' | 'circle' | 'rect'
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  style?: React.CSSProperties
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  variant = 'rect',
  width,
  height,
  borderRadius,
  style,
}) => {
  const getDefaultDims = () => {
    switch (variant) {
      case 'text':
        return { width: width ?? '100%', height: height ?? 14, borderRadius: borderRadius ?? 4 }
      case 'title':
        return { width: width ?? '60%', height: height ?? 22, borderRadius: borderRadius ?? 6 }
      case 'circle':
        return { width: width ?? 36, height: height ?? 36, borderRadius: borderRadius ?? '50%' }
      case 'rect':
      default:
        return { width: width ?? '100%', height: height ?? 80, borderRadius: borderRadius ?? 8 }
    }
  }

  const dims = getDefaultDims()

  return (
    <div
      className={className}
      style={{
        width: dims.width,
        height: dims.height,
        borderRadius: dims.borderRadius,
        backgroundColor: 'var(--surface-2, #F7F8F9)',
        border: '1px solid var(--border-subtle, #E7E9EE)',
        animation: 'skeletonPulse 1.5s ease-in-out infinite',
        flexShrink: 0,
        ...style,
      }}
    />
  )
}
