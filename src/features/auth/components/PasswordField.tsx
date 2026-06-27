import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input, type InputProps } from '@/components/ui/Input';
import styles from './PasswordField.module.css';

/**
 * PasswordField
 * Encapsulates password visibility toggle logic while utilizing the base Input component.
 */
export const PasswordField = forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'rightIcon'>>(
  (props, ref) => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsVisible(!isVisible);
    };

    const icon = isVisible ? (
      <EyeOff className={styles.icon} aria-hidden="true" />
    ) : (
      <Eye className={styles.icon} aria-hidden="true" />
    );

    const rightIcon = (
      <button
        type="button"
        className={styles.toggleButton}
        onClick={toggleVisibility}
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        tabIndex={-1} // Prevent tabbing to this to keep form navigation fast, or allow it based on accessibility preference.
      >
        {icon}
      </button>
    );

    return (
      <Input
        {...props}
        ref={ref}
        type={isVisible ? 'text' : 'password'}
        rightIcon={rightIcon}
      />
    );
  }
);

PasswordField.displayName = 'PasswordField';
