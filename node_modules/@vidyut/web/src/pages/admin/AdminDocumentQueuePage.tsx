import { useState, useEffect } from 'react';
import { ApiClient } from '@/api/apiClient';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Table, TableRow, TableCell } from '@/components/ui/Table';
import { Tabs } from '@/components/ui/Tabs';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Alert } from '@/components/ui/Alert';
import { Check, X, FileText, ExternalLink, RefreshCw } from 'lucide-react';

export default function AdminDocumentQueuePage() {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'VERIFIED' | 'REJECTED'>('PENDING');
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [activeTab]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ApiClient.get<any[]>('/admin/documents', {
        params: { status: activeTab }
      });
      setDocuments(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load documents verification list.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    setActionLoading(id);
    setError(null);
    try {
      await ApiClient.put(`/admin/documents/${id}/verify`, { status });
      fetchDocuments();
    } catch (err: any) {
      setError(err.message || 'Failed to verify document.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Smart Vault Audit</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Review and verify student document uploads to ensure scholarship program compliance.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchDocuments} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Reload
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
          { key: 'PENDING', label: 'Pending Auditing' },
          { key: 'VERIFIED', label: 'Verified & Safe' },
          { key: 'REJECTED', label: 'Flagged / Rejected' }
        ]}
        activeKey={activeTab}
        onChange={(key: any) => setActiveTab(key)}
      />

      {/* Queue View */}
      {isLoading ? (
        <div className="space-y-4">
          <LoadingSkeleton variant="rect" className="h-96" />
        </div>
      ) : documents.length === 0 ? (
        <GlassCard variant="default" padding="lg" className="border border-[var(--border-subtle)] text-center text-sm text-[var(--text-tertiary)] py-20 select-none">
          <FileText className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4 opacity-50" />
          <h3 className="text-base font-bold text-white mb-1">Queue is empty</h3>
          <p className="text-xs text-[var(--text-tertiary)]">No documents match the current verification status filter.</p>
        </GlassCard>
      ) : (
        <Table headers={['Document Details', 'Owner (Student)', 'Uploaded On', 'Actions']}>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-[var(--interactive-primary)] mt-1 shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white leading-tight">{doc.label}</h4>
                    <span className="block text-[10px] text-[var(--text-tertiary)] uppercase font-semibold mt-0.5 tracking-wider select-none">{doc.type}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-[var(--text-secondary)] font-semibold">
                {doc.user?.fullName}
                <span className="block text-[10px] text-[var(--text-tertiary)] font-normal">{doc.user?.email}</span>
              </TableCell>
              <TableCell className="text-[var(--text-tertiary)] text-xs select-none">
                {new Date(doc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </TableCell>
              <TableCell>
                <div className="flex gap-2 select-none">
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                      View
                    </Button>
                  </a>
                  {activeTab === 'PENDING' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actionLoading === doc.id}
                        onClick={() => handleUpdateStatus(doc.id, 'VERIFIED')}
                        className="text-[var(--status-success)] bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.2)] hover:bg-[rgba(16,185,129,0.15)]"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actionLoading === doc.id}
                        onClick={() => handleUpdateStatus(doc.id, 'REJECTED')}
                        className="text-[var(--status-error)] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.15)]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}
    </div>
  );
}
