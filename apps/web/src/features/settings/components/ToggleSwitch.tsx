import React from 'react';
import { motion } from 'framer-motion';
import styles from './Settings.module.css';

interface ToggleSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = React.memo(({
  label,
  description,
  checked,
  onChange,
  disabled
}) => {
  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleInfo}>
        <span className={styles.toggleLabel}>{label}</span>
        {description && <span className={styles.toggleDescription}>{description}</span>}
      </div>
      <button 
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        disabled={disabled}
        className={`${styles.track} ${checked ? styles.trackChecked : ''} ${disabled ? styles.disabled : ''}`}
      >
        <motion.div 
          className={styles.thumb}
          layout
          initial={false}
          animate={{ x: checked ? 20 : 2 }}
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
        />
      </button>
    </div>
  );
});

ToggleSwitch.displayName = 'ToggleSwitch';
