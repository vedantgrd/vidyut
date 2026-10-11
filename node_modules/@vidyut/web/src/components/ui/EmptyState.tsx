import React from 'react';
import clsx from 'clsx';
import { GlassCard } from './GlassCard.js';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <GlassCard
      variant="default"
      padding="lg"
      className={clsx('flex flex-col items-center justify-center text-center p-12 max-w-lg mx-auto border border-[var(--border-subtle)]', className)}
    >
      {icon && (
        <span className="w-16 h-16 rounded-2xl bg-[var(--surface-3)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--text-secondary)] mb-6 animate-pulse">
          {icon}
        </span>
      )}
      <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2">
        {title}
      </h4>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6 max-w-sm">
        {description}
      </p>
      {action && <div className="flex justify-center">{action}</div>}
    </GlassCard>
  );
};
