import React, { useEffect } from 'react';
import { Search } from 'lucide-react';
import { DashboardHeader, DashboardSection } from '@/features/dashboard/components/DashboardLayout';
import { useDiscoveryStore } from '@/features/discovery/store/discoveryStore';
import { FilterSidebar } from '@/features/discovery/components/FilterSidebar';
import { ScholarshipCard } from '@/features/discovery/components/ScholarshipCard';
import { SkeletonCard } from '@/features/dashboard/components/SkeletonCard';
import { EmptyState } from '@/features/dashboard/components/EmptyState';

const DiscoveryPage: React.FC = () => {
  const { scholarships, isLoading, error, fetchScholarships } = useDiscoveryStore();

  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  return (
    <div>
      <DashboardHeader 
        title="Scholarship Explorer"
        subtitle="Discover and match with scholarships tailored to your DNA."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 'var(--space-2xl)', alignItems: 'start' }}>
        <FilterSidebar />
        
        <DashboardSection>
          {error && (
            <div style={{ color: '#ef4444', padding: 'var(--space-xl)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)' }}>
              {error}
            </div>
          )}

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
              <SkeletonCard height={280} />
              <SkeletonCard height={280} />
              <SkeletonCard height={280} />
            </div>
          ) : scholarships.length === 0 ? (
            <EmptyState 
              icon={Search}
              title="No scholarships found"
              description="Try adjusting your filters or search terms to find more opportunities."
              actionLabel="Clear Filters"
              onAction={() => useDiscoveryStore.getState().setFilters({ searchQuery: '', tags: [], minAmount: 0, maxAmount: 5000000 })}
            />
          ) : (
            <>
              <div aria-live="polite" style={{ marginBottom: 'var(--space-md)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                Found {scholarships.length} scholarships matching your criteria
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--space-xl)' }}>
                {scholarships.map(scholarship => (
                  <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                ))}
              </div>
            </>
          )}
        </DashboardSection>
      </div>
    </div>
  );
};

export default DiscoveryPage;
