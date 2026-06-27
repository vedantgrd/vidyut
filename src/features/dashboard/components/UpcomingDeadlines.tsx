import React from 'react';
import { Calendar } from 'lucide-react';
import type { ScholarshipPreview } from '../types';
import styles from './DashboardWidgets.module.css';

interface UpcomingDeadlinesProps {
  deadlines: ScholarshipPreview[];
}

export const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = React.memo(({ deadlines }) => {
  if (!deadlines || deadlines.length === 0) {
    return (
      <div style={{ padding: 'var(--space-xl) 0', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>
        No upcoming deadlines
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      {deadlines.map((item) => {
        const daysLeft = Math.ceil((new Date(item.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const isUrgent = daysLeft <= 3;

        return (
          <div key={item.id} className={styles.scholarshipCard} style={{ padding: 'var(--space-md) var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', color: isUrgent ? '#ef4444' : 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
                  <Calendar size={14} />
                  <span>{daysLeft} days left</span>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', color: '#4ade80', fontWeight: 600 }}>
                ₹{item.amount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

UpcomingDeadlines.displayName = 'UpcomingDeadlines';
