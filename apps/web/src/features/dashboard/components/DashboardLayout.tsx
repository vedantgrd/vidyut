import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/utils/animations';
import styles from './DashboardLayout.module.css';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = React.memo(({ title, subtitle, actions }) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
});

DashboardHeader.displayName = 'DashboardHeader';

interface DashboardSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const DashboardSection: React.FC<DashboardSectionProps> = React.memo(({ title, children, className, style }) => {
  return (
    <motion.section 
      className={`${styles.section} ${className || ''}`} 
      style={style}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {title && (
        <motion.h2 variants={staggerItem} className={styles.sectionTitle}>
          {title}
        </motion.h2>
      )}
      {React.Children.map(children, child => (
        <motion.div variants={staggerItem}>
          {child}
        </motion.div>
      ))}
    </motion.section>
  );
});

DashboardSection.displayName = 'DashboardSection';

interface DashboardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
}

export const DashboardGrid: React.FC<DashboardGridProps> = React.memo(({ children, columns = 3 }) => {
  return (
    <div className={styles.grid} data-columns={columns}>
      {children}
    </div>
  );
});

DashboardGrid.displayName = 'DashboardGrid';
