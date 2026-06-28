import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import type { ApplicationRecord } from '../types';
import styles from './Tracker.module.css';

interface ApplicationCardProps {
  application: ApplicationRecord;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = React.memo(({ application, onDragStart }) => {
  const daysLeft = Math.ceil((new Date(application.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysLeft <= 7 && application.stage !== 'approved' && application.stage !== 'rejected';

  return (
    <motion.div
      className={styles.card}
      draggable
      onDragStart={(e: any) => onDragStart(e, application.id)}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      whileDrag={{ scale: 1.05, zIndex: 50, boxShadow: '0 12px 24px rgba(0,0,0,0.2)' }}
    >
      <h4 className={styles.cardTitle}>{application.title}</h4>
      <p className={styles.cardProvider}>{application.provider}</p>
      
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${application.completionPercentage}%`, height: '100%' }}
        />
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.amount}>₹{application.amount.toLocaleString('en-IN')}</span>
        <div className={`${styles.deadline} ${isUrgent ? styles.deadlineUrgent : ''}`}>
          <Clock size={12} />
          {daysLeft > 0 ? `${daysLeft}d left` : 'Ended'}
        </div>
      </div>
    </motion.div>
  );
});

ApplicationCard.displayName = 'ApplicationCard';
