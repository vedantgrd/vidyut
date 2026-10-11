import React, { useCallback } from 'react';
import { useTrackerStore } from '../store/trackerStore';
import type { ApplicationRecord } from '../services/tracker.service';
import { KanbanColumn } from './KanbanColumn';
import styles from './Tracker.module.css';

const COLUMNS: { id: ApplicationRecord['status']; title: string }[] = [
  { id: 'DRAFT', title: 'Drafts' },
  { id: 'SUBMITTED', title: 'Submitted' },
  { id: 'UNDER_REVIEW', title: 'Under Review' },
  { id: 'APPROVED', title: 'Approved' },
  { id: 'REJECTED', title: 'Rejected' },
];

export const KanbanBoard: React.FC = () => {
  const { applications, moveApplication } = useTrackerStore();

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('applicationId', id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetStatus: ApplicationRecord['status']) => {
    const appId = e.dataTransfer.getData('applicationId');
    if (appId) {
      moveApplication(appId, targetStatus);
    }
  }, [moveApplication]);

  return (
    <div className={styles.board}>
      {COLUMNS.map(col => (
        <KanbanColumn
          key={col.id}
          title={col.title}
          status={col.id}
          applications={applications.filter(app => app.status === col.id)}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
};

KanbanBoard.displayName = 'KanbanBoard';
