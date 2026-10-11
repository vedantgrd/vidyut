import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, FileText, CheckCircle2, Upload } from 'lucide-react';
import { ApiClient } from '@/api/apiClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { GlassCard } from '@/components/ui/GlassCard';
import { Timeline } from '@/components/ui/Timeline';
import { Alert } from '@/components/ui/Alert';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

export default function ApplicationFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [application, setApplication] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    phone: '',
    email: '',
    address: '',
    cgpa: '',
    statementOfPurpose: '',
    notes: ''
  });

  const [vaultDocs, setVaultDocs] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  useEffect(() => {
    fetchApplicationDetails();
    fetchVaultDocs();
  }, [id]);

  const fetchApplicationDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ApiClient.get<any>(`/applications/${id}`);
      setApplication(res.application);
      
      // Load saved form answers or fallback to prefilled profile values
      const savedData = res.application.formData?.data || {};
      setFormData({
        phone: savedData.phone || res.prefilled.phone || '',
        email: savedData.email || res.prefilled.email || '',
        address: savedData.address || `${res.prefilled.addressLine1 || ''}, ${res.prefilled.city || ''}, ${res.prefilled.state || ''}`,
        cgpa: savedData.cgpa || res.prefilled.tenthPercentage || res.prefilled.ugCGPA || '',
        statementOfPurpose: savedData.statementOfPurpose || '',
        notes: res.application.notes || ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch application details.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVaultDocs = async () => {
    try {
      const res = await ApiClient.get<any[]>('/documents');
      setVaultDocs(res);
    } catch (err) {
      console.error('Error fetching vault documents:', err);
    }
  };

  // Auto-saves or manual saves draft form values
  const handleSaveDraft = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await ApiClient.put(`/applications/${id}/draft`, {
        notes: formData.notes,
        data: formData
      });
      setSuccessMsg('Progress saved successfully.');
    } catch (err: any) {
      setError(err.message || 'Autosave draft failed.');
    } finally {
      setIsSaving(false);
    }
  };

  // Upload missing required document
  const handleDocUpload = async (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(docType);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('type', docType);
      form.append('label', `Attachment for ${docType.replace(/_/g, ' ')}`);

      // Upload to document vault
      await ApiClient.post('/documents/upload', form);
      // Link it to this application
      await ApiClient.post(`/applications/${id}/documents`, { documentType: docType });
      
      fetchApplicationDetails();
      fetchVaultDocs();
    } catch (err: any) {
      setError(err.message || 'Document upload failed.');
    } finally {
      setIsUploading(null);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      // First save draft state
      await ApiClient.put(`/applications/${id}/draft`, {
        notes: formData.notes,
        data: formData
      });

      // Submit application
      await ApiClient.post(`/applications/${id}/submit`, {});
      setSuccessMsg('Application submitted successfully!');
      navigate('/workspace');
    } catch (err: any) {
      setError(err.message || 'Submission failed. Make sure all eligibility and document rules pass.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <LoadingSkeleton variant="title" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LoadingSkeleton variant="rect" className="md:col-span-2 h-96" />
          <LoadingSkeleton variant="rect" className="h-96" />
        </div>
      </div>
    );
  }

  // Evaluate required documents status
  const requiredDocs = application.scholarship?.requiredDocuments || [];
  const documentsStatusList = requiredDocs.map((reqDoc: any) => {
    // Find matching document in vault (or associated application doc)
    const matchingVaultDoc = vaultDocs.find(d => d.type === reqDoc.type);
    return {
      type: reqDoc.type,
      label: reqDoc.label || reqDoc.type.replace(/_/g, ' '),
      status: matchingVaultDoc ? matchingVaultDoc.status : 'MISSING',
      docId: matchingVaultDoc ? matchingVaultDoc.id : null
    };
  });

  // Timeline events mapping
  const timelineEvents = [
    {
      id: '1',
      title: 'Draft Started',
      description: 'Application workspace initialized.',
      date: application.createdAt,
      status: 'completed' as const
    },
    {
      id: '2',
      title: 'Application Submitted',
      description: application.submittedAt ? 'Sent for review' : 'Fill details & upload documents to submit',
      date: application.submittedAt,
      status: (application.status !== 'DRAFT' ? 'completed' : 'current') as 'completed' | 'current' | 'upcoming'
    },
    {
      id: '3',
      title: 'Under Review',
      description: 'Document and academic verification',
      status: (['UNDER_REVIEW', 'APPROVED', 'REJECTED'].includes(application.status) ? 'completed' : 'upcoming') as 'completed' | 'current' | 'upcoming'
    },
    {
      id: '4',
      title: application.status === 'REJECTED' ? 'Rejected' : 'Approved',
      description: application.status === 'APPROVED' ? 'Granted' : application.status === 'REJECTED' ? 'Failed verification rules' : 'Disbursement verification',
      status: (['APPROVED', 'REJECTED'].includes(application.status) ? 'completed' : 'upcoming') as 'completed' | 'current' | 'upcoming'
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top action header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <button
          onClick={() => navigate('/workspace')}
          className="flex items-center gap-2 border-none bg-none cursor-pointer text-sm font-semibold text-[var(--text-secondary)] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Workspace
        </button>
        {application.status === 'DRAFT' && (
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSaveDraft}
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Submit Application
            </Button>
          </div>
        )}
      </div>

      {successMsg && (
        <Alert variant="success" title="Success" className="max-w-4xl">
          {successMsg}
        </Alert>
      )}

      {error && (
        <Alert variant="error" title="Action Failed" className="max-w-4xl">
          {error}
        </Alert>
      )}

      {/* Main split viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard variant="default" padding="lg" className="border border-[var(--border-subtle)] space-y-6">
            <div className="border-b border-[var(--border-subtle)] pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-950 border border-purple-800 text-purple-300 px-2 py-0.5 rounded-full select-none">
                {application.scholarship?.category}
              </span>
              <h2 className="text-xl font-bold text-white mt-2 select-none">
                {application.scholarship?.name}
              </h2>
              <p className="text-xs text-[var(--text-tertiary)] mt-1 select-none">
                Provided by {application.scholarship?.provider}
              </p>
            </div>

            {/* Form details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider select-none">Pre-filled Application Data</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Contact Phone"
                  disabled={application.status !== 'DRAFT'}
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  onBlur={handleSaveDraft}
                />
                <Input
                  label="Contact Email"
                  disabled={application.status !== 'DRAFT'}
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  onBlur={handleSaveDraft}
                />
                <div className="md:col-span-2">
                  <Input
                    label="Current Address"
                    disabled={application.status !== 'DRAFT'}
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    onBlur={handleSaveDraft}
                  />
                </div>
                <Input
                  label="Percentage / CGPA Checked"
                  disabled
                  value={formData.cgpa}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider select-none">Applicant Statement</h3>
              <Textarea
                label="Statement of Purpose (SOP)"
                placeholder="Explain why you deserve this scholarship and how it aligns with your academic goals..."
                disabled={application.status !== 'DRAFT'}
                value={formData.statementOfPurpose}
                onChange={e => setFormData({ ...formData, statementOfPurpose: e.target.value })}
                onBlur={handleSaveDraft}
              />
              <Input
                label="Additional Comments"
                placeholder="Any special remarks..."
                disabled={application.status !== 'DRAFT'}
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                onBlur={handleSaveDraft}
              />
            </div>
          </GlassCard>
        </div>

        {/* Right Status Column (1/3 width) */}
        <div className="space-y-6">
          {/* Tracking timeline */}
          <GlassCard variant="default" padding="lg" className="border border-[var(--border-subtle)] space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider select-none">Application Status</h3>
            <Timeline events={timelineEvents} />
          </GlassCard>

          {/* Required Documents slots checklist */}
          <GlassCard variant="default" padding="lg" className="border border-[var(--border-subtle)] space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider select-none">Required Documents</h3>
            {documentsStatusList.length === 0 ? (
              <p className="text-xs text-[var(--text-tertiary)] select-none">No documents required for this program.</p>
            ) : (
              <div className="space-y-4">
                {documentsStatusList.map((doc: any, i: number) => {
                  const isMissing = doc.status === 'MISSING';
                  const isVerified = doc.status === 'VERIFIED';
                  const isRejected = doc.status === 'REJECTED';

                  return (
                    <div key={i} className="p-3 bg-[var(--surface-3)]/60 rounded-xl border border-[var(--border-subtle)] flex flex-col gap-2.5">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-2">
                          <FileText className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <span className="block text-xs font-bold text-white truncate">{doc.label}</span>
                            <span className="block text-[10px] text-[var(--text-tertiary)] truncate select-none">{doc.type}</span>
                          </div>
                        </div>
                        <div className="select-none">
                          {isVerified ? (
                            <span className="text-[9px] font-bold bg-[rgba(16,185,129,0.1)] text-[var(--status-success)] px-1.5 py-0.5 rounded border border-[rgba(16,185,129,0.2)]">Verified</span>
                          ) : isRejected ? (
                            <span className="text-[9px] font-bold bg-[rgba(239,68,68,0.1)] text-[var(--status-error)] px-1.5 py-0.5 rounded border border-[rgba(239,68,68,0.2)]">Rejected</span>
                          ) : isMissing ? (
                            <span className="text-[9px] font-bold bg-orange-950 border border-orange-850 text-orange-400 px-1.5 py-0.5 rounded">Missing</span>
                          ) : (
                            <span className="text-[9px] font-bold bg-[rgba(245,158,11,0.1)] text-[var(--status-warning)] px-1.5 py-0.5 rounded border border-[rgba(245,158,11,0.2)]">Pending</span>
                          )}
                        </div>
                      </div>

                      {/* File upload input slot */}
                      {isMissing && application.status === 'DRAFT' && (
                        <div className="flex items-center gap-2 pt-1 border-t border-[var(--border-subtle)]">
                          <input
                            type="file"
                            id={`file-input-${doc.type}`}
                            className="hidden"
                            onChange={e => handleDocUpload(doc.type, e)}
                          />
                          <label
                            htmlFor={`file-input-${doc.type}`}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-white cursor-pointer hover:border-[var(--interactive-primary)] transition-all font-semibold text-[11px] w-full"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            {isUploading === doc.type ? 'Uploading...' : 'Upload File'}
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>

          {/* Eligibility alert rules checking */}
          {application.status === 'DRAFT' && (
            <GlassCard variant="solid" padding="md" className="border border-[var(--border-strong)] space-y-2 select-none">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[var(--status-success)]" />
                Submission Checks
              </h4>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Ensure all documents inside your Smart Vault are verified by admin before submission is unlocked.
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
