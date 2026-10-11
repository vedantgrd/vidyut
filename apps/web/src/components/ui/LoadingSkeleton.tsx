import React from 'react';
import clsx from 'clsx';

export interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'title' | 'circle' | 'rect';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  variant = 'rect'
}) => {
  const baseStyles = 'bg-[var(--surface-3)] animate-pulse border border-[var(--border-subtle)]';

  const variants = {
    text: 'h-4 w-full rounded-md',
    title: 'h-6 w-2/3 rounded-lg',
    circle: 'rounded-full shrink-0',
    rect: 'h-32 w-full rounded-2xl',
  };

  return (
    <div
      className={clsx(
        baseStyles,
        variants[variant],
        className
      )}
    />
  );
};
