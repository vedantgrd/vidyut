import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  UserCheck,
  Bell,
  Clock,
  Calendar,
  ChevronRight,
  Award,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useDashboardStore } from '@/features/dashboard/store/dashboardStore';
import { StatCard } from '@/components/ui/StatCard';
import { Timeline } from '@/components/ui/Timeline';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

export default function DashboardHomePage() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { data, isLoading, error, fetchDashboard } = useDashboardStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (error) {
    return (
      <div className="py-20 text-center max-w-md mx-auto select-none">
        <ShieldAlert className="w-12 h-12 text-[var(--status-error)] mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Failed to load dashboard</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-6">{error}</p>
        <Button variant="secondary" onClick={() => fetchDashboard()}>
          Try Again
        </Button>
      </div>
    );
  }

  // Map icon strings to Lucide components
  const iconMap: Record<string, any> = {
    UserCheck: <UserCheck className="w-5 h-5" />,
    FileText: <FileText className="w-5 h-5" />,
    Clock: <Clock className="w-5 h-5" />,
    Bell: <Bell className="w-5 h-5" />
  };

  const activities = (data?.recentActivity ?? []).map((act, i) => ({
    id: act.id || String(i),
    title: act.title,
    description: act.description,
    date: act.date,
    status: act.status as any,
    icon: act.type === 'application' ? <FileText className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />
  }));

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {data?.greeting || `Welcome, ${currentUser?.fullName?.split(' ')[0] || 'Student'}!`}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Track and complete your active scholarship applications below.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="md" onClick={() => navigate('/workspace')} leftIcon={<FileText className="w-4 h-4" />}>
            My Applications
          </Button>
          <Button variant="primary" size="md" onClick={() => navigate('/discovery')} rightIcon={<ChevronRight className="w-4 h-4" />}>
            Explore Scholarships
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <LoadingSkeleton variant="rect" className="h-[96px]" />
            <LoadingSkeleton variant="rect" className="h-[96px]" />
            <LoadingSkeleton variant="rect" className="h-[96px]" />
            <LoadingSkeleton variant="rect" className="h-[96px]" />
          </>
        ) : (
          (data?.stats ?? []).map((stat, i) => (
            <StatCard
              key={i}
              label={stat.label}
              value={stat.value}
              icon={iconMap[stat.icon] || <FileText className="w-5 h-5" />}
            />
          ))
        )}
      </div>

      {/* Main content split dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left main column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Completion Bar */}
          <GlassCard variant="default" padding="lg" className="border border-[var(--border-subtle)] space-y-4">
            <div className="flex justify-between items-center select-none">
              <div>
                <h3 className="text-lg font-bold text-white">Profile Completion</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Keep your details up-to-date to retain high eligibility scores.</p>
              </div>
              <span className="text-2xl font-black text-[var(--interactive-primary)]">{data?.profileCompletion ?? 0}%</span>
            </div>
            <Progress value={data?.profileCompletion ?? 0} size="md" />
            <div className="flex justify-end select-none">
              <Button variant="ghost" size="sm" onClick={() => navigate('/profile')} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Update Profile
              </Button>
            </div>
          </GlassCard>

          {/* Eligible Scholarships list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between select-none">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Eligible For You
              </h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/discovery')}>
                See All
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <LoadingSkeleton variant="rect" className="h-28" />
                <LoadingSkeleton variant="rect" className="h-28" />
              </div>
            ) : !data?.recommendedScholarships || data.recommendedScholarships.length === 0 ? (
              <EmptyState
                icon={<Award className="w-8 h-8" />}
                title="No Eligible Scholarships Found"
                description="We evaluated your academic metrics and profile parameters but could not find matching active programs. Try updating your profile details."
                action={
                  <Button variant="secondary" onClick={() => navigate('/profile')}>
                    Edit Profile
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                {data.recommendedScholarships.map((sch) => (
                  <GlassCard
                    key={sch.id}
                    variant="solid"
                    padding="md"
                    className="border border-[var(--border-subtle)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-[var(--interactive-primary)] transition-all"
                  >
                    <div className="space-y-1 max-w-md">
                      <div className="flex items-center gap-2 select-none">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-950 border border-purple-800 text-purple-300 px-2 py-0.5 rounded-full">
                          {sch.scholarshipCategory}
                        </span>
                        {sch.isFeatured && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-950 border border-cyan-800 text-cyan-300 px-2 py-0.5 rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-white hover:text-[var(--interactive-primary)] cursor-pointer" onClick={() => navigate(`/discovery/${sch.id}`)}>
                        {sch.name}
                      </h4>
                      <p className="text-xs text-[var(--text-tertiary)]">Provided by: {sch.provider}</p>
                    </div>

                    <div className="flex items-center md:items-end justify-between md:flex-col gap-4 w-full md:w-auto">
                      <div className="text-left md:text-right select-none">
                        <span className="block text-xs text-[var(--text-tertiary)]">Disbursement</span>
                        <span className="block text-sm font-black text-white">{sch.amountDescription ?? `₹${sch.amount.toLocaleString('en-IN')}`}</span>
                      </div>
                      <Button variant="primary" size="sm" onClick={() => navigate(`/discovery/${sch.id}`)}>
                        View Details
                      </Button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side bar column (1/3 width) */}
        <div className="space-y-8">
          {/* Upcoming deadlines */}
          <GlassCard variant="default" padding="lg" className="border border-[var(--border-subtle)] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 select-none">
              <Calendar className="w-4 h-4 text-orange-400" />
              Deadlines
            </h3>
            {isLoading ? (
              <LoadingSkeleton variant="rect" className="h-28" />
            ) : !data?.upcomingDeadlines || data.upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-[var(--text-tertiary)] leading-relaxed select-none">
                No upcoming application deadlines found.
              </p>
            ) : (
              <div className="space-y-3">
                {data.upcomingDeadlines.map((dl) => (
                  <div key={dl.id} className="p-3 bg-[var(--surface-3)]/60 rounded-xl border border-[var(--border-subtle)] flex justify-between items-center select-none">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{dl.name}</h4>
                      <span className="text-[10px] text-[var(--text-tertiary)] block truncate">Provided by: {dl.provider}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] block text-[var(--text-tertiary)] font-medium">Due Date</span>
                      <span className="text-xs font-bold text-[var(--status-warning)]">
                        {new Date(dl.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Recent Activity */}
          <GlassCard variant="default" padding="lg" className="border border-[var(--border-subtle)] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 select-none">
              <Clock className="w-4 h-4 text-cyan-400" />
              Recent Activity
            </h3>
            {isLoading ? (
              <LoadingSkeleton variant="rect" className="h-40" />
            ) : activities.length === 0 ? (
              <p className="text-xs text-[var(--text-tertiary)] select-none">
                No recent workspace activity recorded.
              </p>
            ) : (
              <Timeline events={activities as any} />
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
