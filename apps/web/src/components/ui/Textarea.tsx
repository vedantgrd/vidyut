import React, { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './Input.module.css';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, fullWidth = false, className, ...props }, ref) => {
    return (
      <div className={clsx(styles.container, fullWidth && styles.fullWidth, className)}>
        {label && <label className={styles.label}>{label}</label>}
        <div className={styles.inputWrapper}>
          <textarea
            ref={ref}
            className={clsx(
              styles.input,
              error && styles.inputError,
              'py-3 min-h-[100px] resize-y'
            )}
            {...props}
          />
        </div>
        {error && <span className={styles.error}>{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
