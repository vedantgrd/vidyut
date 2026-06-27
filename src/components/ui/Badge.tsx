import React from 'react';
import clsx from 'clsx';
import styles from './Badge.module.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'magic';
  size?: 'sm' | 'md';
}

/**
 * Badge
 * Used to indicate statuses, tags, or categories.
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}) => {
  return (
    <span
      className={clsx(
        styles.badge,
        styles[`variant-${variant}`],
        styles[`size-${size}`],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';
