import React from 'react';
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
}

export const DashboardSection: React.FC<DashboardSectionProps> = React.memo(({ title, children, className }) => {
  return (
    <section className={`${styles.section} ${className || ''}`}>
      {title && <h2 className={styles.sectionTitle}>{title}</h2>}
      {children}
    </section>
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
