import React from 'react';
import { Zap } from 'lucide-react';
import type { ScholarshipPreview } from '../types';
import styles from './DashboardWidgets.module.css';

interface ScholarshipPreviewCardProps {
  scholarship: ScholarshipPreview;
}

export const ScholarshipPreviewCard: React.FC<ScholarshipPreviewCardProps> = React.memo(({ scholarship }) => {
  return (
    <div className={styles.scholarshipCard}>
      <div className={styles.scholarshipHeader}>
        <div>
          <h4 className={styles.scholarshipTitle}>{scholarship.title}</h4>
          <span className={styles.scholarshipProvider}>{scholarship.provider}</span>
        </div>
        <div className={styles.matchScore}>
          <Zap size={14} />
          {scholarship.matchScore}%
        </div>
      </div>
      
      <div className={styles.scholarshipAmount}>
        ₹{scholarship.amount.toLocaleString('en-IN')}
      </div>
      
      <div className={styles.tags}>
        {scholarship.tags.map(tag => (
          <span key={tag} className={styles.tag}>{tag}</span>
        ))}
      </div>
    </div>
  );
});

ScholarshipPreviewCard.displayName = 'ScholarshipPreviewCard';
