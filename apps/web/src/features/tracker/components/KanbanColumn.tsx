import React from 'react';
import type { ApplicationRecord } from '../services/tracker.service';
import { ApplicationCard } from './ApplicationCard';
import styles from './Tracker.module.css';

interface KanbanColumnProps {
  title: string;
  status: ApplicationRecord['status'];
  applications: ApplicationRecord[];
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDrop: (e: React.DragEvent, status: ApplicationRecord['status']) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = React.memo(({
  title,
  status,
  applications,
  onDragStart,
  onDrop
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  return (
    <div
      className={styles.column}
      onDragOver={handleDragOver}
      onDrop={(e: React.DragEvent) => onDrop(e, status)}
    >
      <div className={styles.columnHeader}>
        <h3 className={styles.columnTitle}>{title}</h3>
        <span className={styles.badge}>{applications.length}</span>
      </div>

      <div className={styles.cardList}>
        {(Array.isArray(applications) ? applications : []).map(app => (
          <ApplicationCard
            key={app.id}
            application={app}
            onDragStart={onDragStart}
          />
        ))}
        {applications.length === 0 && (
          <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: 'var(--space-xl) 0', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            Drop here
          </div>
        )}
      </div>
    </div>
  );
});

KanbanColumn.displayName = 'KanbanColumn';
