import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiClient } from '@/api/apiClient';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatCard } from '@/components/ui/StatCard';
import { Table, TableRow, TableCell } from '@/components/ui/Table';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Alert } from '@/components/ui/Alert';
import {
  Users,
  ClipboardList,
  FileCheck,
  IndianRupee,
  Check,
  X,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';

export default function AdminOverviewPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ApiClient.get<any>('/admin/analytics');
      setAnalytics(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  // Inline document verification
  const handleVerifyDoc = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    setActionLoading(id);
    try {
      await ApiClient.put(`/admin/documents/${id}/verify`, { status });
      fetchAnalytics();
    } catch (err: any) {
      setError(err.message || 'Verification update failed.');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="title" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <LoadingSkeleton variant="rect" className="h-[96px]" />
          <LoadingSkeleton variant="rect" className="h-[96px]" />
          <LoadingSkeleton variant="rect" className="h-[96px]" />
          <LoadingSkeleton variant="rect" className="h-[96px]" />
        </div>
        <LoadingSkeleton variant="rect" className="h-96" />
      </div>
    );
  }

  const recentApps = analytics?.recentApplications || [];
  const pendingDocs = analytics?.pendingDocuments || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Overview</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Global metrics control room and verification checkpoints.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/admin/scholarships')} rightIcon={<ChevronRight className="w-4 h-4" />}>
          Manage Programs
        </Button>
      </div>

      {error && (
        <Alert variant="error" title="Control Room Alert">
          {error}
        </Alert>
      )}

      {/* Analytics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Submissions"
          value={analytics?.totalApplications ?? 0}
          icon={<ClipboardList className="w-5 h-5" />}
        />
        <StatCard
          label="Pending Audits"
          value={analytics?.pendingApplications ?? 0}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Verified Vault Files"
          value={analytics?.verifiedDocuments ?? 0}
          icon={<FileCheck className="w-5 h-5" />}
        />
        <StatCard
          label="Disbursed Funds"
          value={`₹${(analytics?.disbursedAmount ?? 0).toLocaleString('en-IN')}`}
          icon={<IndianRupee className="w-5 h-5" />}
        />
      </div>

      {/* Split view lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications Left Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between select-none">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Recent Submissions
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/applications')}>
              View Queue
            </Button>
          </div>

          {recentApps.length === 0 ? (
            <GlassCard variant="default" padding="lg" className="border border-[var(--border-subtle)] text-center text-sm text-[var(--text-tertiary)] py-12">
              No recent applications submitted.
            </GlassCard>
          ) : (
            <Table headers={['Student', 'Scholarship', 'Status', 'Actions']}>
              {recentApps.map((app: any) => (
                <TableRow key={app.id}>
                  <TableCell className="font-semibold text-white">
                    {app.user?.fullName || 'Anonymous'}
                  </TableCell>
                  <TableCell className="text-[var(--text-secondary)]">
                    {app.scholarship?.name}
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] font-bold uppercase bg-[rgba(245,158,11,0.1)] text-[var(--status-warning)] px-2 py-0.5 rounded border border-[rgba(245,158,11,0.2)]">
                      {app.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/applications?appId=${app.id}`)} rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          )}
        </div>

        {/* Pending Documents Verification Queue Right Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between select-none">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Vault Documents Audit
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/documents')}>
              View Vault
            </Button>
          </div>

          {pendingDocs.length === 0 ? (
            <GlassCard variant="default" padding="lg" className="border border-[var(--border-subtle)] text-center text-sm text-[var(--text-tertiary)] py-12">
              All uploaded vault documents are audited.
            </GlassCard>
          ) : (
            <Table headers={['Type', 'Owner', 'Actions']}>
              {pendingDocs.map((doc: any) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-white">{doc.label}</span>
                      <span className="block text-[10px] text-[var(--text-tertiary)] uppercase font-semibold mt-0.5">{doc.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[var(--text-secondary)] font-medium">
                    {doc.user?.fullName}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 select-none">
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="secondary" size="sm">
                          View
                        </Button>
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actionLoading === doc.id}
                        onClick={() => handleVerifyDoc(doc.id, 'VERIFIED')}
                        className="text-[var(--status-success)] bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.2)] hover:bg-[rgba(16,185,129,0.15)]"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actionLoading === doc.id}
                        onClick={() => handleVerifyDoc(doc.id, 'REJECTED')}
                        className="text-[var(--status-error)] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.15)]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
