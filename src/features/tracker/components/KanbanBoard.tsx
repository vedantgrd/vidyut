import React, { useCallback } from 'react';
import type { ApplicationStage } from '../types';
import { useTrackerStore } from '../store/trackerStore';
import { KanbanColumn } from './KanbanColumn';
import styles from './Tracker.module.css';

const COLUMNS: { id: ApplicationStage; title: string }[] = [
  { id: 'draft', title: 'Drafts' },
  { id: 'submitted', title: 'Submitted' },
  { id: 'under_review', title: 'Under Review' },
  { id: 'approved', title: 'Approved' },
  { id: 'rejected', title: 'Rejected' },
];

export const KanbanBoard: React.FC = () => {
  const { applications, moveApplication } = useTrackerStore();

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('applicationId', id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetStage: ApplicationStage) => {
    const appId = e.dataTransfer.getData('applicationId');
    if (appId) {
      moveApplication(appId, targetStage);
    }
  }, [moveApplication]);

  return (
    <div className={styles.board}>
      {COLUMNS.map(col => (
        <KanbanColumn
          key={col.id}
          title={col.title}
          stage={col.id}
          applications={applications.filter(app => app.stage === col.id)}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
};

KanbanBoard.displayName = 'KanbanBoard';
