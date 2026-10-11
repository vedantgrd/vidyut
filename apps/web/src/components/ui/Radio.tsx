import React, { forwardRef } from 'react';
import clsx from 'clsx';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className={clsx('flex flex-col gap-1', className)}>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="radio"
            ref={ref}
            className="sr-only peer"
            {...props}
          />
          <div className="w-5 h-5 rounded-full border border-[var(--border-strong)] bg-[var(--surface-2)] flex items-center justify-center transition-all peer-checked:border-[var(--interactive-primary)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--interactive-primary)]">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--interactive-primary)] scale-0 peer-checked:scale-100 transition-transform" />
          </div>
          {label && (
            <span className="text-sm font-medium text-[var(--text-secondary)] peer-checked:text-[var(--text-primary)] transition-colors">
              {label}
            </span>
          )}
        </label>
        {error && <span className="text-xs text-[var(--status-error)] ml-8">{error}</span>}
      </div>
    );
  }
);

Radio.displayName = 'Radio';
