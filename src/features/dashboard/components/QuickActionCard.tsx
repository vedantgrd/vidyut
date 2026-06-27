import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './QuickActionCard.module.css';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  primary?: boolean;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = React.memo(({ 
  title, 
  description, 
  icon: Icon, 
  onClick,
  primary = false
}) => {
  return (
    <motion.button 
      className={`${styles.card} ${primary ? styles.primary : ''}`}
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={styles.iconWrapper}>
        <Icon size={24} />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </motion.button>
  );
});

QuickActionCard.displayName = 'QuickActionCard';
