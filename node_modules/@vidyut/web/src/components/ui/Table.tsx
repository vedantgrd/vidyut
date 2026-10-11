import React from 'react';
import clsx from 'clsx';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  headers: React.ReactNode[];
  className?: string;
  containerClassName?: string;
}

export const Table: React.FC<TableProps> = ({
  headers,
  children,
  className,
  containerClassName,
  ...props
}) => {
  return (
    <div className={clsx('w-full overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] shadow-[var(--elevation-1)]', containerClassName)}>
      <table className={clsx('w-full border-collapse text-left text-sm', className)} {...props}>
        <thead>
          <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-3)]">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="px-6 py-4 font-semibold text-[var(--text-secondary)] text-xs uppercase tracking-wider select-none"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  className?: string;
}

export const TableRow: React.FC<TableRowProps> = ({ children, className, ...props }) => {
  return (
    <tr
      className={clsx(
        'hover:bg-[rgba(255,255,255,0.02)] transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
};

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  className?: string;
}

export const TableCell: React.FC<TableCellProps> = ({ children, className, ...props }) => {
  return (
    <td className={clsx('px-6 py-4.5 align-middle', className)} {...props}>
      {children}
    </td>
  );
};
