import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import styles from './PasswordStrengthIndicator.module.css';

interface PasswordStrengthProps {
  password?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthProps> = ({ password = '' }) => {
  const strength = useMemo(() => {
    let score = 0;
    if (!password) return score;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[\W_]/.test(password)) score += 1;
    return Math.min(score, 4); // Max score 4 for 4 bars
  }, [password]);

  const getLabel = () => {
    switch (strength) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  };

  const getColor = () => {
    switch (strength) {
      case 0: case 1: return '#ef4444'; // red
      case 2: return '#eab308'; // yellow
      case 3: return '#6366f1'; // primary
      case 4: return '#22c55e'; // green
      default: return 'var(--surface-3)';
    }
  };

  if (!password) return null;

  return (
    <div className={styles.container}>
      <div className={styles.bars}>
        {[1, 2, 3, 4].map((level) => (
          <motion.div
            key={level}
            className={styles.bar}
            initial={{ backgroundColor: 'var(--surface-3)' }}
            animate={{ 
              backgroundColor: level <= strength ? getColor() : 'var(--surface-3)'
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
      <span className={styles.label} style={{ color: getColor() }}>
        {getLabel()}
      </span>
    </div>
  );
};

PasswordStrengthIndicator.displayName = 'PasswordStrengthIndicator';
