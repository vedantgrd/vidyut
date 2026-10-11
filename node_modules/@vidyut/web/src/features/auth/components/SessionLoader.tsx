import React from 'react';
import { motion } from 'framer-motion';
import styles from './SessionLoader.module.css';

export const SessionLoader: React.FC = () => {
  return (
    <div className={styles.container}>
      <motion.div
        className={styles.spinner}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      />
      <p className={styles.text}>Restoring secure session...</p>
    </div>
  );
};

SessionLoader.displayName = 'SessionLoader';
