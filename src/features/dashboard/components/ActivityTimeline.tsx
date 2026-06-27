import React from 'react';
import { FileText, CheckCircle, Clock, Bell } from 'lucide-react';
import type { ActivityItem } from '../types';
import styles from './ActivityTimeline.module.css';

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

const getIconForType = (type: ActivityItem['type']) => {
  switch (type) {
    case 'application_update': return <FileText size={16} />;
    case 'document_verified': return <CheckCircle size={16} />;
    case 'deadline_reminder': return <Clock size={16} />;
    default: return <Bell size={16} />;
  }
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = React.memo(({ activities }) => {
  if (!activities || activities.length === 0) {
    return <div className={styles.empty}>No recent activity</div>;
  }

  return (
    <div className={styles.timeline}>
      {activities.map((activity, index) => (
        <div key={activity.id} className={`${styles.item} ${!activity.isRead ? styles.unread : ''}`}>
          <div className={styles.iconWrapper} data-type={activity.type}>
            {getIconForType(activity.type)}
          </div>
          
          <div className={styles.content}>
            <div className={styles.headerRow}>
              <h4 className={styles.title}>{activity.title}</h4>
              <time className={styles.time}>
                {new Intl.DateTimeFormat('en-IN', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                }).format(new Date(activity.timestamp))}
              </time>
            </div>
            <p className={styles.description}>{activity.description}</p>
          </div>
          
          {index !== activities.length - 1 && <div className={styles.connector} />}
        </div>
      ))}
    </div>
  );
});

ActivityTimeline.displayName = 'ActivityTimeline';
