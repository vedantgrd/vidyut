import React from 'react';
import clsx from 'clsx';
import { Check } from 'lucide-react';

export interface StepItem {
  id: number;
  label: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number; // 1-indexed
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  className
}) => {
  return (
    <div className={clsx('flex items-center justify-between w-full py-4 px-2', className)}>
      {steps.map((step, idx) => {
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-2 select-none relative z-10">
              <span
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors',
                  isCompleted
                    ? 'bg-[var(--interactive-primary)] border-[var(--interactive-primary)] text-white'
                    : isActive
                    ? 'bg-[var(--surface-2)] border-[var(--interactive-primary)] text-[var(--interactive-primary)] shadow-[0_0_8px_var(--border-glow)]'
                    : 'bg-[var(--surface-3)] border-[var(--border-strong)] text-[var(--text-tertiary)]'
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.id}
              </span>
              <span
                className={clsx(
                  'text-[11px] font-semibold tracking-wide uppercase',
                  isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connecting lines */}
            {idx < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 bg-[var(--border-subtle)] relative -top-3">
                <div
                  className="h-full bg-[var(--interactive-primary)] transition-all duration-300"
                  style={{ width: isCompleted ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
