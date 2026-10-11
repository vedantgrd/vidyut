import React from 'react';
import clsx from 'clsx';
import { GlassCard } from './GlassCard.js';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  description,
  className
}) => {
  return (
    <GlassCard variant="default" padding="md" className={clsx('border border-[var(--border-subtle)] flex items-start gap-4', className)}>
      {icon && (
        <span className="w-11 h-11 rounded-xl bg-[var(--surface-3)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--interactive-primary)] shrink-0 shadow-[0_0_8px_rgba(124,58,237,0.15)]">
          {icon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <span className="block text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider select-none mb-1">
          {label}
        </span>
        <h3 className="text-2xl font-bold text-[var(--text-primary)] leading-tight tracking-tight truncate">
          {value}
        </h3>
        {description && (
          <p className="mt-1 text-xs text-[var(--text-tertiary)] truncate select-none">
            {description}
          </p>
        )}
      </div>
    </GlassCard>
  );
};
