import React from 'react';
import clsx from 'clsx';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  className,
  ...props
}) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[var(--status-success)] shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-[var(--status-warning)] shrink-0" />,
    error: <XCircle className="w-5 h-5 text-[var(--status-error)] shrink-0" />,
    info: <Info className="w-5 h-5 text-[var(--status-info)] shrink-0" />,
  };

  const bgStyles = {
    success: 'bg-[rgba(16,185,129,0.08)] border-[rgba(16,185,129,0.2)]',
    warning: 'bg-[rgba(245,158,11,0.08)] border-[rgba(245,158,11,0.2)]',
    error: 'bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.2)]',
    info: 'bg-[rgba(59,130,246,0.08)] border-[rgba(59,130,246,0.2)]',
  };

  return (
    <div
      className={clsx(
        'flex gap-3.5 p-4 rounded-xl border',
        bgStyles[variant],
        className
      )}
      role="alert"
      {...props}
    >
      {icons[variant]}
      <div className="flex-1">
        {title && (
          <h5 className="font-semibold text-sm text-[var(--text-primary)] mb-1">
            {title}
          </h5>
        )}
        <div className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};
