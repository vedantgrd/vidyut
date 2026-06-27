import { forwardRef } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import styles from './GlassCard.module.css';

export interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  variant?: 'default' | 'floating' | 'solid';
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * GlassCard
 * The foundational container component for the Aura Design System.
 * Supports backdrop-filters, interactive hover states, and semantic HTML elements.
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      className,
      variant = 'default',
      interactive = false,
      padding = 'lg',
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        className={clsx(
          styles.card,
          styles[`variant-${variant}`],
          styles[`padding-${padding}`],
          interactive && styles.interactive,
          className
        )}
        // We defer complex physics hover to CSS for performance,
        // but Framer Motion handles entrance/exit animations via props.
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
