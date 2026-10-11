import React from 'react';
import clsx from 'clsx';

export interface ProgressProps {
  value: number; // 0 to 100
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  className,
  size = 'md',
  showLabel = false
}) => {
  const percent = Math.min(100, Math.max(0, value));

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={clsx('w-full flex flex-col gap-2', className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-[var(--text-secondary)] select-none">
          <span>Progress</span>
          <span>{percent}%</span>
        </div>
      )}
      <div className={clsx('w-full bg-[var(--surface-3)] border border-[var(--border-subtle)] rounded-full overflow-hidden', heights[size])}>
        <div
          className="h-full bg-[var(--interactive-primary)] transition-all duration-500 ease-[var(--motion-expo)] rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
