import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ApiClient } from '@/api/apiClient';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Table, TableRow, TableCell } from '@/components/ui/Table';
import { Tabs } from '@/components/ui/Tabs';
import { Drawer } from '@/components/ui/Drawer';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Alert } from '@/components/ui/Alert';
import { ClipboardList, Eye, CheckCircle2 } from 'lucide-react';

export default function AdminApplicationQueuePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'>('SUBMITTED');
  
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review drawer state
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  useEffect(() => {
    const appId = searchParams.get('appId');
    if (appId && applications.length > 0) {
      const matched = applications.find(a => a.id === appId);
      if (matched) {
        handleOpenReview(matched);
      }
    }
  }, [searchParams, applications]);

  const fetchApplications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ApiClient.get<any[]>('/admin/applications', {
        params: { status: activeTab }
      });
      setApplications(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applications.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenReview = async (app: any) => {
    try {
      // Fetch full application details (with form answers and history)
      const detail = await ApiClient.get<any>(`/applications/${app.id}`);
      setSelectedApp(detail.application);
      setReviewNotes('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch application details.');
    }
  };

  const handleAuditDecision = async (status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW') => {
    if (!selectedApp) return;
    setIsReviewing(true);
    setError(null);
    try {
      await ApiClient.put(`/admin/applications/${selectedApp.id}/review`, {
        status,
        notes: reviewNotes
      });
      setSelectedApp(null);
      setSearchParams({});
      fetchApplications();
    } catch (err: any) {
      setError(err.message || 'Audit status update failed.');
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Applications Queue</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Audit and approve student scholarship submissions.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchApplications}>
          Refresh Queue
        </Button>
      </div>

      {error && (
        <Alert variant="error" title="Audit Alert">
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Tabs
        variant="pills"
        options={[
          { key: 'SUBMITTED', label: 'Incoming Queue' },
          { key: 'UNDER_REVIEW', label: 'Under Review' },
          { key: 'APPROVED', label: 'Approved' },
          { key: 'REJECTED', label: 'Rejected' }
        ]}
        activeKey={activeTab}
        onChange={(key: any) => setActiveTab(key)}
      />

      {/* Queue Table */}
      {isLoading ? (
        <div className="space-y-4">
          <LoadingSkeleton variant="rect" className="h-96" />
        </div>
      ) : applications.length === 0 ? (
        <GlassCard variant="default" padding="lg" className="border border-[var(--border-subtle)] text-center text-sm text-[var(--text-tertiary)] py-20 select-none">
          <ClipboardList className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4 opacity-50" />
          <h3 className="text-base font-bold text-white mb-1">Queue is empty</h3>
          <p className="text-xs text-[var(--text-tertiary)]">No applications are currently matching the status filters.</p>
        </GlassCard>
      ) : (
        <Table headers={['Student Name', 'Scholarship Name', 'Submission Date', 'Actions']}>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell className="font-semibold text-white">
                {app.user?.fullName}
                <span className="block text-[10px] text-[var(--text-tertiary)] font-normal">{app.user?.email}</span>
              </TableCell>
              <TableCell className="text-[var(--text-secondary)]">
                {app.scholarship?.name}
                <span className="block text-[10px] text-[var(--text-tertiary)] font-normal">Disbursement: {app.scholarship?.amountDescription || `₹${app.scholarship?.amount}`}</span>
              </TableCell>
              <TableCell className="text-[var(--text-tertiary)] text-xs select-none">
                {app.submittedAt ? new Date(app.submittedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Draft'}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => handleOpenReview(app)} leftIcon={<Eye className="w-4 h-4" />}>
                  Audit File
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}

      {/* Audit Review Details Drawer */}
      <Drawer
        isOpen={!!selectedApp}
        onClose={() => {
          setSelectedApp(null);
          setSearchParams({});
        }}
        title="Scholarship Application Audit"
      >
        {selectedApp && (
          <div className="space-y-6">
            {/* Student metadata */}
            <div className="p-4 bg-[var(--surface-3)]/60 rounded-xl border border-[var(--border-subtle)] select-none">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-950 border border-purple-800 text-purple-300 px-2 py-0.5 rounded">Student Profile</span>
              <h4 className="text-sm font-bold text-white mt-2">{selectedApp.user?.fullName}</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{selectedApp.user?.email}</p>
            </div>

            {/* Form answers */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider select-none">Submitted Form Fields</h4>
              <div className="p-4 bg-[var(--surface-2)] rounded-xl border border-[var(--border-subtle)] space-y-3 text-xs leading-relaxed">
                <div>
                  <span className="block text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Contact Details</span>
                  <p className="text-white mt-0.5">Phone: {selectedApp.formData?.data?.phone || 'N/A'}</p>
                  <p className="text-white">Email: {selectedApp.formData?.data?.email || 'N/A'}</p>
                  <p className="text-white">Address: {selectedApp.formData?.data?.address || 'N/A'}</p>
                </div>
                <div className="pt-2.5 border-t border-[var(--border-subtle)]">
                  <span className="block text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Statement of Purpose (SOP)</span>
                  <p className="text-[var(--text-secondary)] mt-1 whitespace-pre-wrap leading-relaxed">{selectedApp.formData?.data?.statementOfPurpose || 'No statement provided.'}</p>
                </div>
              </div>
            </div>

            {/* Verification Documents Checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider select-none font-sans">Verification Attachments</h4>
              {(!selectedApp.documents || selectedApp.documents.length === 0) ? (
                <p className="text-xs text-[var(--text-tertiary)] select-none">No document attachments linked.</p>
              ) : (
                <div className="space-y-2">
                  {selectedApp.documents.map((docLink: any) => (
                    <div key={docLink.id} className="p-3 bg-[var(--surface-3)]/60 rounded-xl border border-[var(--border-subtle)] flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-white truncate">{docLink.document?.label}</span>
                        <span className="block text-[9px] text-[var(--text-tertiary)] uppercase font-semibold tracking-wider">{docLink.document?.type}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 select-none">
                        <span className="text-[9px] font-bold bg-[rgba(16,185,129,0.1)] text-[var(--status-success)] px-1.5 py-0.5 rounded border border-[rgba(16,185,129,0.2)]">
                          {docLink.document?.status}
                        </span>
                        <a href={docLink.document?.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4 text-[var(--text-secondary)] hover:text-white cursor-pointer" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Audit Notes field */}
            <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider select-none">Audit Trail Feedback</h4>
              <Textarea
                placeholder="Write verification comments or reasons for approval/rejection..."
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 select-none">
              {selectedApp.status === 'SUBMITTED' && (
                <Button
                  variant="secondary"
                  fullWidth
                  disabled={isReviewing}
                  onClick={() => handleAuditDecision('UNDER_REVIEW')}
                >
                  Under Review
                </Button>
              )}
              <Button
                variant="ghost"
                fullWidth
                disabled={isReviewing}
                onClick={() => handleAuditDecision('REJECTED')}
                className="text-[var(--status-error)] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.15)]"
              >
                Reject File
              </Button>
              <Button
                variant="primary"
                fullWidth
                disabled={isReviewing}
                onClick={() => handleAuditDecision('APPROVED')}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Grant Approval
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
