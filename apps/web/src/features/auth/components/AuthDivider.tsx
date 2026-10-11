import React from 'react';
import styles from './AuthDivider.module.css';

export const AuthDivider: React.FC = React.memo(() => {
  return (
    <div className={styles.dividerContainer}>
      <div className={styles.line} />
      <span className={styles.text}>or continue with</span>
      <div className={styles.line} />
    </div>
  );
});

AuthDivider.displayName = 'AuthDivider';
