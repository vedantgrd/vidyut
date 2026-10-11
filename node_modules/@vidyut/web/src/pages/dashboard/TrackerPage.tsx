import React, { useEffect } from 'react';
import { DashboardHeader, DashboardSection } from '@/features/dashboard/components/DashboardLayout';
import { useTrackerStore } from '@/features/tracker/store/trackerStore';
import { KanbanBoard } from '@/features/tracker/components/KanbanBoard';
import { SkeletonCard } from '@/features/dashboard/components/SkeletonCard';
import { Button } from '@/components/ui/Button';

const TrackerPage: React.FC = () => {
  const { isLoading, error, fetchApplications } = useTrackerStore();

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return (
    <div>
      <DashboardHeader 
        title="Application Workspace"
        subtitle="Track, draft, and submit your scholarship applications."
        actions={
          <Button variant="primary">
            New Application
          </Button>
        }
      />

      <DashboardSection>
        {error && (
          <div style={{ color: '#ef4444', padding: 'var(--space-xl)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-xl)' }}>
            {error}
          </div>
        )}

        {isLoading ? (
          <div style={{ display: 'flex', gap: 'var(--space-xl)', overflow: 'hidden' }}>
            <SkeletonCard height="70vh" className="flex-1" />
            <SkeletonCard height="70vh" className="flex-1" />
            <SkeletonCard height="70vh" className="flex-1" />
            <SkeletonCard height="70vh" className="flex-1" />
          </div>
        ) : (
          <KanbanBoard />
        )}
      </DashboardSection>
    </div>
  );
};

export default TrackerPage;
