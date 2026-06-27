import React, { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './RememberMeCheckbox.module.css';

interface RememberMeProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const RememberMeCheckbox = forwardRef<HTMLInputElement, RememberMeProps>(
  ({ label = 'Remember me for 30 days', className, ...props }, ref) => {
    return (
      <label className={clsx(styles.container, className)}>
        <input 
          type="checkbox" 
          ref={ref}
          className={styles.checkbox} 
          {...props} 
        />
        <span className={styles.checkmark} />
        <span className={styles.label}>{label}</span>
      </label>
    );
  }
);

RememberMeCheckbox.displayName = 'RememberMeCheckbox';
