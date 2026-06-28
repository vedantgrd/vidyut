import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { DashboardHeader, DashboardSection } from '@/features/dashboard/components/DashboardLayout';
import { useCalendarStore } from '@/features/calendar/store/calendarStore';
import { MonthGrid } from '@/features/calendar/components/MonthGrid';
import { SkeletonCard } from '@/features/dashboard/components/SkeletonCard';
import { Button } from '@/components/ui/Button';

const CalendarPage: React.FC = () => {
  const { events, isLoading, error, fetchEvents, currentDate, setCurrentDate } = useCalendarStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handlePrevMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const handleNextMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div>
      <DashboardHeader 
        title="Calendar"
        subtitle="Manage your deadlines and interviews."
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <Button variant="secondary" onClick={handleToday}>Today</Button>
            <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
              <button onClick={handlePrevMonth} style={{ padding: 'var(--space-sm) var(--space-md)', background: 'none', border: 'none', cursor: 'pointer', borderRight: '1px solid var(--border-subtle)' }}>&lt;</button>
              <div style={{ padding: 'var(--space-sm) var(--space-lg)', fontWeight: 600 }}>{format(currentDate, 'MMMM yyyy')}</div>
              <button onClick={handleNextMonth} style={{ padding: 'var(--space-sm) var(--space-md)', background: 'none', border: 'none', cursor: 'pointer', borderLeft: '1px solid var(--border-subtle)' }}>&gt;</button>
            </div>
          </div>
        }
      />

      <DashboardSection>
        {error && (
          <div style={{ color: '#ef4444', padding: 'var(--space-xl)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-xl)' }}>
            {error}
          </div>
        )}

        {isLoading ? (
          <SkeletonCard height={600} />
        ) : (
          <MonthGrid currentDate={currentDate} events={events} />
        )}
      </DashboardSection>
    </div>
  );
};

export default CalendarPage;
