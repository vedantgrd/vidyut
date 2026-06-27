import React, { useEffect } from 'react';
import { Sparkles, Search, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useDashboardStore } from '@/features/dashboard/store/dashboardStore';
import { DashboardHeader, DashboardSection, DashboardGrid } from '@/features/dashboard/components/DashboardLayout';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { QuickActionCard } from '@/features/dashboard/components/QuickActionCard';
import { ScholarshipPreviewCard } from '@/features/dashboard/components/ScholarshipPreviewCard';
import { ActivityTimeline } from '@/features/dashboard/components/ActivityTimeline';
import { UpcomingDeadlines } from '@/features/dashboard/components/UpcomingDeadlines';
import { SkeletonCard } from '@/features/dashboard/components/SkeletonCard';
import { Button } from '@/components/ui/Button';

const DashboardHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { data, isLoading, error, fetchData } = useDashboardStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return (
      <div style={{ padding: 'var(--space-4xl) 0', textAlign: 'center' }}>
        <p style={{ color: '#ef4444', marginBottom: 'var(--space-md)' }}>{error}</p>
        <Button variant="secondary" onClick={() => fetchData(true)}>Try Again</Button>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader 
        title={data?.greeting || `Welcome back, ${currentUser?.fullName?.split(' ')[0] || 'Student'}`}
        subtitle="Here's what's happening with your applications today."
        actions={
          <Button variant="primary" onClick={() => navigate('/discovery')}>
            Find Scholarships
          </Button>
        }
      />

      <DashboardSection>
        <DashboardGrid columns={3}>
          {isLoading ? (
            <>
              <SkeletonCard height={120} />
              <SkeletonCard height={120} />
              <SkeletonCard height={120} />
            </>
          ) : data?.stats.map(stat => (
            <StatCard key={stat.id} {...stat} />
          ))}
        </DashboardGrid>
      </DashboardSection>

      <DashboardGrid columns={2}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4xl)' }}>
          <DashboardSection title="AI Assistant Actions">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <QuickActionCard 
                title="Optimize Profile DNA"
                description="Our AI has identified 3 new data points that could increase your match rate."
                icon={Sparkles}
                onClick={() => navigate('/profile')}
                primary
              />
              <DashboardGrid columns={2}>
                <QuickActionCard 
                  title="Discover Matches"
                  description="View new scholarships"
                  icon={Search}
                  onClick={() => navigate('/discovery')}
                />
                <QuickActionCard 
                  title="Draft Applications"
                  description="Use AI to write essays"
                  icon={FileText}
                  onClick={() => navigate('/workspace')}
                />
              </DashboardGrid>
            </div>
          </DashboardSection>

          <DashboardSection title="Recommended for you">
            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <SkeletonCard height={140} />
                <SkeletonCard height={140} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {data?.recommendedScholarships.map(sch => (
                  <ScholarshipPreviewCard key={sch.id} scholarship={sch} />
                ))}
              </div>
            )}
          </DashboardSection>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4xl)' }}>
          <DashboardSection title="Upcoming Deadlines">
            {isLoading ? (
              <SkeletonCard height={200} />
            ) : (
              <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)' }}>
                <UpcomingDeadlines deadlines={data?.upcomingDeadlines || []} />
              </div>
            )}
          </DashboardSection>

          <DashboardSection title="Recent Activity">
            {isLoading ? (
              <SkeletonCard height={300} />
            ) : (
              <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)' }}>
                <ActivityTimeline activities={data?.recentActivity || []} />
              </div>
            )}
          </DashboardSection>
        </div>
      </DashboardGrid>
    </div>
  );
};

export default DashboardHomePage;
