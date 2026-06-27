import React, { forwardRef, useState, useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isAiFilling?: boolean;
}

/**
 * Input
 * Standard form input with floating label capabilities, error states,
 * and a special 'isAiFilling' state that triggers a flowing light animation.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      leftIcon,
      rightIcon,
      isAiFilling = false,
      id,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    
    // React 18 useId ensures hydration-safe unique IDs for accessibility
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className={clsx(styles.wrapper, className)}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        
        <div className={clsx(
          styles.inputContainer,
          isFocused && styles.focused,
          error && styles.hasError,
          isAiFilling && styles.aiFilling
        )}>
          {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
          
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              styles.input,
              leftIcon && styles.hasLeftIcon,
              rightIcon && styles.hasRightIcon
            )}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          
          {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
          
          {/* AI Flowing Light Effect */}
          <AnimatePresence>
            {isAiFilling && (
              <motion.div
                className={styles.aiLightBeam}
                initial={{ x: '-100%' }}
                animate={{ x: '300%' }}
                transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
              />
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              id={`${inputId}-error`}
              className={styles.errorText}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';
