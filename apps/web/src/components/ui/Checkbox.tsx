import React, { forwardRef } from 'react';
import clsx from 'clsx';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className={clsx('flex flex-col gap-1', className)}>
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            ref={ref}
            className="sr-only peer"
            {...props}
          />
          <div className="w-5 h-5 rounded border border-[var(--border-strong)] bg-[var(--surface-2)] flex items-center justify-center transition-all peer-checked:bg-[var(--interactive-primary)] peer-checked:border-[var(--interactive-primary)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--interactive-primary)] mt-0.5">
            <svg
              className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
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

Checkbox.displayName = 'Checkbox';
