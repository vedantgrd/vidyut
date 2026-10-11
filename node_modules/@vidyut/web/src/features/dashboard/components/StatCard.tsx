import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import styles from './DashboardWidgets.module.css';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = React.memo(({ label, value, trend }) => {
  return (
    <div className={styles.statCard}>
      <h3 className={styles.statLabel}>{label}</h3>
      <div className={styles.statValueRow}>
        <span className={styles.statValue}>{value}</span>
        {trend && (
          <div className={`${styles.trend} ${trend.isPositive ? styles.trendPositive : styles.trendNegative}`}>
            {trend.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';
