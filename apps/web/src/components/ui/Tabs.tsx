import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export interface TabOption {
  key: string;
  label: React.ReactNode;
}

export interface TabsProps {
  options: TabOption[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
  variant?: 'pills' | 'underline';
}

export const Tabs: React.FC<TabsProps> = ({
  options,
  activeKey,
  onChange,
  className,
  variant = 'underline'
}) => {
  return (
    <div
      className={clsx(
        'flex border-[var(--border-subtle)]',
        variant === 'underline' ? 'border-b gap-6' : 'bg-[var(--surface-2)] p-1 rounded-xl border gap-1',
        className
      )}
    >
      {options.map((option) => {
        const isActive = option.key === activeKey;

        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={clsx(
              'relative text-sm font-semibold transition-colors focus:outline-none select-none',
              variant === 'underline'
                ? clsx('pb-3.5 px-1', isActive ? 'text-[var(--interactive-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]')
                : clsx('px-4 py-2 rounded-lg flex-1 text-center z-10', isActive ? 'text-white' : 'text-[var(--text-secondary)] hover:text-white')
            )}
          >
            {variant === 'underline' && isActive && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--interactive-primary)]"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            {variant === 'pills' && isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-[var(--interactive-primary)] rounded-lg -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
