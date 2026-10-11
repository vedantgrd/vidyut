import React from 'react';
import clsx from 'clsx';
import { format } from 'date-fns';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string | React.ReactNode;
  date?: Date | string;
  icon?: React.ReactNode;
  status?: 'completed' | 'current' | 'upcoming';
}

export interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ events, className }) => {
  return (
    <div className={clsx('relative pl-8 border-l border-[var(--border-subtle)] space-y-8 py-2', className)}>
      {events.map((event, idx) => {
        const isCompleted = event.status === 'completed';
        const isCurrent = event.status === 'current';

        return (
          <div key={event.id || idx} className="relative">
            {/* Timeline dot */}
            <span
              className={clsx(
                'absolute -left-[41px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full border text-xs transition-colors',
                isCompleted
                  ? 'bg-[var(--interactive-primary)] border-[var(--interactive-primary)] text-white'
                  : isCurrent
                  ? 'bg-[var(--surface-2)] border-[var(--interactive-primary)] text-[var(--interactive-primary)] shadow-[0_0_8px_var(--border-glow)]'
                  : 'bg-[var(--surface-3)] border-[var(--border-strong)] text-[var(--text-tertiary)]'
              )}
            >
              {event.icon ?? (idx + 1)}
            </span>

            {/* Content block */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
              <div>
                <h4
                  className={clsx(
                    'text-sm font-semibold leading-tight',
                    isCurrent ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                  )}
                >
                  {event.title}
                </h4>
                {event.description && (
                  <p className="mt-1 text-xs text-[var(--text-tertiary)] leading-relaxed">
                    {event.description}
                  </p>
                )}
              </div>
              {event.date && (
                <span className="text-[11px] text-[var(--text-tertiary)] select-none shrink-0 md:mt-0.5">
                  {typeof event.date === 'string' ? event.date : format(event.date, 'dd MMM yyyy, hh:mm a')}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
