import { useState, useEffect } from 'react';
import { ApiClient } from '@/api/apiClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { GlassCard } from '@/components/ui/GlassCard';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { FolderOpen, Upload, Trash2, FileText, ExternalLink } from 'lucide-react';

export default function VaultPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload Form State
  const [uploadDocType, setUploadDocType] = useState('AADHAAR');
  const [uploadLabel, setUploadLabel] = useState('My Aadhaar Card');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ApiClient.get<any[]>('/documents');
      setDocuments(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load vault documents.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', selectedFile);
      form.append('type', uploadDocType);
      form.append('label', uploadLabel);

      await ApiClient.post('/documents/upload', form);
      setSelectedFile(null);
      fetchDocuments();
    } catch (err: any) {
      setError(err.message || 'Vault document upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document from your vault? This will unlink it from any draft applications.')) return;
    setActionLoading(id);
    setError(null);
    try {
      await ApiClient.delete(`/documents/${id}`);
      fetchDocuments();
    } catch (err: any) {
      setError(err.message || 'Failed to delete vault document.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Smart Vault</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Store, audit, and reuse your verified documents across all scholarship forms.
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="error" title="Smart Vault Alert">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form left block */}
        <div className="lg:col-span-1">
          <GlassCard variant="default" padding="lg" className="border border-[var(--border-subtle)] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider select-none flex items-center gap-2">
              <Upload className="w-4 h-4 text-[var(--interactive-primary)]" />
              Upload Document
            </h3>
            
            <form onSubmit={handleFileUpload} className="space-y-4">
              <Select
                label="Document Type"
                value={uploadDocType}
                onChange={e => {
                  setUploadDocType(e.target.value);
                  const labels: Record<string, string> = {
                    AADHAAR: 'My Aadhaar Card',
                    INCOME_CERTIFICATE: 'Family Income Certificate',
                    CASTE_CERTIFICATE: 'My Caste Certificate',
                    DOMICILE_CERTIFICATE: 'Domicile Certificate',
                    TENTH_MARKSHEET: 'Class 10 Marksheet',
                    TWELFTH_MARKSHEET: 'Class 12 Marksheet',
                    DEGREE_CERTIFICATE: 'Degree Marksheet',
                    BANK_PASSBOOK: 'Bank Passbook Copy',
                    PHOTOGRAPH: 'Passport Photo',
                    BONAFIDE_CERTIFICATE: 'College Bonafide Certificate'
                  };
                  setUploadLabel(labels[e.target.value] || 'Document Attachment');
                }}
              >
                <option value="AADHAAR">Aadhaar Card</option>
                <option value="INCOME_CERTIFICATE">Income Certificate</option>
                <option value="CASTE_CERTIFICATE">Caste Certificate</option>
                <option value="DOMICILE_CERTIFICATE">Domicile Certificate</option>
                <option value="TENTH_MARKSHEET">Class 10 Marksheet</option>
                <option value="TWELFTH_MARKSHEET">Class 12 Marksheet</option>
                <option value="DEGREE_CERTIFICATE">Degree Marksheet</option>
                <option value="BANK_PASSBOOK">Bank Passbook Copy</option>
                <option value="PHOTOGRAPH">Passport Photo</option>
                <option value="BONAFIDE_CERTIFICATE">College Bonafide Certificate</option>
              </Select>

              <Input
                label="Document Name"
                placeholder="e.g. My Aadhaar Card"
                required
                value={uploadLabel}
                onChange={e => setUploadLabel(e.target.value)}
              />

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide select-none mb-2">Select File (PDF, PNG, JPG under 5MB)</label>
                <div className="flex flex-col gap-3">
                  <input
                    type="file"
                    id="vault-file"
                    className="hidden"
                    onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  />
                  <label
                    htmlFor="vault-file"
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-white cursor-pointer hover:border-[var(--interactive-primary)] transition-all font-semibold text-sm shrink-0"
                  >
                    <Upload className="w-4 h-4" />
                    {selectedFile ? 'Change File' : 'Browse File'}
                  </label>
                  {selectedFile && (
                    <span className="text-xs text-[var(--text-tertiary)] truncate block">
                      {selectedFile.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 select-none">
                <Button type="submit" fullWidth disabled={!selectedFile || isUploading} isLoading={isUploading}>
                  Upload to Vault
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Uploaded Documents List right block */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider select-none">Vault Contents</h3>

          {isLoading ? (
            <div className="space-y-4">
              <LoadingSkeleton variant="rect" className="h-24" />
              <LoadingSkeleton variant="rect" className="h-24" />
            </div>
          ) : documents.length === 0 ? (
            <EmptyState
              icon={<FolderOpen className="w-8 h-8" />}
              title="Vault is Empty"
              description="Upload your credentials on the left side menu to link them to your applications."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => {
                const isVerified = doc.status === 'VERIFIED';
                const isRejected = doc.status === 'REJECTED';

                return (
                  <GlassCard
                    key={doc.id}
                    variant="solid"
                    padding="md"
                    className="border border-[var(--border-subtle)] flex flex-col justify-between gap-4 hover:border-[var(--interactive-primary)] transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <FileText className="w-5 h-5 text-[var(--interactive-primary)] shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="block text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider select-none">{doc.type}</span>
                          <h4 className="text-sm font-bold text-white truncate">{doc.label}</h4>
                          <span className="block text-[10px] text-[var(--text-tertiary)] select-none">Uploaded: {new Date(doc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>

                      <div className="select-none">
                        {isVerified ? (
                          <span className="text-[9px] font-bold bg-[rgba(16,185,129,0.1)] text-[var(--status-success)] px-2 py-0.5 rounded-full border border-[rgba(16,185,129,0.2)]">Verified</span>
                        ) : isRejected ? (
                          <span className="text-[9px] font-bold bg-[rgba(239,68,68,0.1)] text-[var(--status-error)] px-2 py-0.5 rounded-full border border-[rgba(239,68,68,0.2)]">Rejected</span>
                        ) : (
                          <span className="text-[9px] font-bold bg-[rgba(245,158,11,0.1)] text-[var(--status-warning)] px-2 py-0.5 rounded-full border border-[rgba(245,158,11,0.2)]">Pending</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 select-none pt-2 border-t border-[var(--border-subtle)]">
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button variant="secondary" size="sm" fullWidth rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                          View File
                        </Button>
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actionLoading === doc.id}
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-[var(--status-error)] hover:bg-[rgba(239,68,68,0.08)]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
