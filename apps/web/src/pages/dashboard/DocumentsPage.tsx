import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Upload,
  FileText,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ExternalLink,
  Shield,
  AlertTriangle,
  Search,
  SlidersHorizontal,
  Lock
} from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { api } from '@/api/client'
import type { Document } from '@/types'
import { PageSpinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Empty } from '@/components/ui/Empty'
import { toast } from '@/components/ui/Toast'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { DocumentViewerModal } from '@/components/ui/DocumentViewerModal'
import { DocumentMetadataModal } from '@/components/documents/DocumentMetadataModal'

const DOC_TYPES = [
  { value: 'AADHAAR', label: 'Aadhaar Card' },
  { value: 'PAN', label: 'PAN Card' },
  { value: 'INCOME_CERTIFICATE', label: 'Income Certificate' },
  { value: 'CASTE_CERTIFICATE', label: 'Caste Certificate' },
  { value: 'DOMICILE_CERTIFICATE', label: 'Domicile Certificate' },
  { value: 'TENTH_MARKSHEET', label: 'Class 10 Marksheet' },
  { value: 'TWELFTH_MARKSHEET', label: 'Class 12 Marksheet' },
  { value: 'DIPLOMA_MARKSHEET', label: 'Diploma Marksheet' },
  { value: 'DEGREE_CERTIFICATE', label: 'Degree Certificate' },
  { value: 'TRANSCRIPT', label: 'Academic Transcript' },
  { value: 'DISABILITY_CERTIFICATE', label: 'Disability Certificate' },
  { value: 'BANK_PASSBOOK', label: 'Bank Passbook' },
  { value: 'PHOTOGRAPH', label: 'Passport Photo' },
  { value: 'COLLEGE_ID', label: 'College ID / Bonafide' },
  { value: 'OTHER', label: 'Other' }
]

const SI: Record<string, React.ReactNode> = {
  VERIFIED: <CheckCircle size={18} color="var(--success)" />,
  PENDING: <Clock size={18} color="var(--warning)" />,
  REJECTED: <XCircle size={18} color="var(--error)" />,
  EXPIRED: <AlertCircle size={18} color="var(--text-muted)" />
}

export function DocumentsPage() {
  const [uploadType, setUploadType] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Modals
  const [duplicatePending, setDuplicatePending] = useState<{ file: File; type: string; label: string } | null>(null)
  const [viewingDoc, setViewingDoc] = useState<{ id: string; title: string } | null>(null)
  const [editingMetadataDoc, setEditingMetadataDoc] = useState<Document | null>(null)
  const [deleteWarningDoc, setDeleteWarningDoc] = useState<{ id: string; label: string; activeApps: string[] } | null>(null)

  // Vault health summary
  const [vaultSummary, setVaultSummary] = useState<{
    total: number
    verified: number
    pending: number
    rejected: number
    expired: number
    expiringSoon: number
    linkedApplicationsCount: number
  } | null>(null)

  const { data, isLoading, refetch } = useApi(() => api.get<{ documents: Document[] }>('/documents'))

  const fetchVaultSummary = async () => {
    try {
      const res = await api.get<any>('/documents/vault-summary')
      setVaultSummary(res)
    } catch {
      // Graceful fallback
    }
  }

  useEffect(() => {
    fetchVaultSummary()
  }, [data])

  const checkAndDeleteDoc = async (doc: Document) => {
    try {
      const usage = await api.get<{
        isUsedInActiveApplications: boolean
        applications: { applicationId: string; status: string; scholarshipName: string }[]
      }>(`/documents/${doc.id}/usage`)

      if (usage.isUsedInActiveApplications) {
        setDeleteWarningDoc({
          id: doc.id,
          label: doc.label,
          activeApps: usage.applications.map((a) => a.scholarshipName)
        })
        return
      }

      if (!window.confirm(`Are you sure you want to remove "${doc.label}" from your vault?`)) return
      await api.delete(`/documents/${doc.id}`)
      toast('Document removed from vault', 'info')
      refetch()
    } catch (err) {
      toast(err, 'error')
    }
  }

  const confirmDangerousDelete = async () => {
    if (!deleteWarningDoc) return
    try {
      await api.delete(`/documents/${deleteWarningDoc.id}`)
      toast('Document removed from vault and unlinked from applications', 'info')
      setDeleteWarningDoc(null)
      refetch()
    } catch (err) {
      toast(err, 'error')
    }
  }

  const uploadFile = async (file: File, type: string, replace = false) => {
    setUploading(true)
    try {
      const label = DOC_TYPES.find((d) => d.value === type)?.label ?? type
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', type)
      fd.append('label', label)
      const url = replace ? '/documents/upload?replace=true' : '/documents/upload'
      await api.upload(url, fd)
      await refetch()
      toast(replace ? `${label} replaced successfully!` : `${label} uploaded to vault!`, 'success')
      setUploadType('')
      setDuplicatePending(null)
    } catch (e: any) {
      const errMsg = e?.message || ''
      if (errMsg.includes('DUPLICATE_DOCUMENT') || errMsg.toLowerCase().includes('already uploaded')) {
        const label = DOC_TYPES.find((d) => d.value === type)?.label ?? type
        setDuplicatePending({ file, type, label })
      } else {
        toast(e, 'error')
      }
    } finally {
      setUploading(false)
    }
  }

  const handleInitialUpload = (file: File) => {
    if (!uploadType) {
      toast('Please select a document type first', 'error')
      return
    }
    uploadFile(file, uploadType, false)
  }

  const allDocs = data?.documents ?? []

  // Filtered documents
  const filteredDocs = allDocs.filter((d) => {
    const matchesSearch =
      d.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.documentNumber && d.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false

    if (statusFilter === 'VERIFIED') return d.status === 'VERIFIED'
    if (statusFilter === 'PENDING') return d.status === 'PENDING'
    if (statusFilter === 'EXPIRING') {
      if (!d.expiryDate) return false
      const diffDays = Math.ceil((new Date(d.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return diffDays <= 30
    }
    return true
  })

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-subtle)',
              border: '1px solid var(--accent-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Shield size={18} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Intelligent Document Vault
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
          Secure, reusable credentials with scheme-aware validity, instant verification status, and auto-linking.
        </p>
      </div>

      {/* Vault Health Analytics Cards */}
      {vaultSummary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <Card style={{ padding: '14px 18px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Stored
            </span>
            <p className="font-tabular" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 0' }}>
              {vaultSummary.total}
            </p>
          </Card>
          <Card style={{ padding: '14px 18px', border: '1px solid var(--success-border)', background: 'var(--success-subtle)' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Verified Credentials
            </span>
            <p className="font-tabular" style={{ fontSize: 22, fontWeight: 700, color: 'var(--success)', margin: '4px 0 0' }}>
              {vaultSummary.verified}
            </p>
          </Card>
          <Card style={{ padding: '14px 18px', border: '1px solid var(--warning-border)', background: 'var(--warning-subtle)' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Under Review
            </span>
            <p className="font-tabular" style={{ fontSize: 22, fontWeight: 700, color: 'var(--warning)', margin: '4px 0 0' }}>
              {vaultSummary.pending}
            </p>
          </Card>
          <Card style={{ padding: '14px 18px', border: '1px solid var(--accent-border)', background: 'var(--accent-subtle)' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Applications Linked
            </span>
            <p className="font-tabular" style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)', margin: '4px 0 0' }}>
              {vaultSummary.linkedApplicationsCount}
            </p>
          </Card>
        </div>
      )}

      {/* Duplicate Document Conflict Dialog */}
      {duplicatePending && (
        <div
          style={{
            background: 'var(--warning-subtle)',
            border: '1px solid var(--warning-border)',
            borderRadius: 'var(--radius-md)',
            padding: 16
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <AlertTriangle size={20} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--warning)', margin: '0 0 4px' }}>
                {duplicatePending.label} Already Exists in Vault
              </h4>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: '0 0 12px', lineHeight: 1.5 }}>
                You already have a document registered under "{duplicatePending.label}". Would you like to replace the existing file with "{duplicatePending.file.name}"? Replaced files automatically preserve links to active applications.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button
                  size="sm"
                  variant="primary"
                  isLoading={uploading}
                  onClick={() => uploadFile(duplicatePending.file, duplicatePending.type, true)}
                >
                  Replace Existing File
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDuplicatePending(null)
                    setUploadType('')
                  }}
                >
                  Keep Current File
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dangerous Deletion Warning Dialog */}
      {deleteWarningDoc && (
        <div
          style={{
            background: 'var(--error-subtle)',
            border: '1px solid var(--error-border)',
            borderRadius: 'var(--radius-md)',
            padding: 16
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <AlertCircle size={20} color="var(--error)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--error)', margin: '0 0 4px' }}>
                Document Attached to Active Applications
              </h4>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: '0 0 12px', lineHeight: 1.5 }}>
                "{deleteWarningDoc.label}" is currently referenced by: <strong>{deleteWarningDoc.activeApps.join(', ')}</strong>. Deleting this credential will remove it from those active submissions and may invalidate their completeness.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button size="sm" variant="danger" onClick={confirmDangerousDelete}>
                  Confirm Delete & Detach
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDeleteWarningDoc(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload New Document Card */}
      <Card style={{ padding: 20, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px', letterSpacing: '-0.01em' }}>
          Add or Renew Credential in Vault
        </h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <Select
              label="Select Document Type"
              options={DOC_TYPES}
              placeholder="e.g. Income Certificate, Marksheet..."
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}
            />
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleInitialUpload(f)
              if (e.target) e.target.value = ''
            }}
          />
          <Button
            isLoading={uploading}
            disabled={!uploadType}
            onClick={() => fileRef.current?.click()}
            leftIcon={<Upload size={14} />}
            variant="primary"
            style={{ height: 38 }}
          >
            Choose & Upload File
          </Button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '10px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Lock size={12} color="var(--text-muted)" /> Accepted formats: PDF, JPEG, PNG, WebP · Max size: 5MB · Stored with authenticated access
        </p>
      </Card>

      {/* Search and Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 11 }} />
          <input
            type="text"
            placeholder="Search documents or certificate IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 12px 7px 32px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: 13,
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { key: 'ALL', label: 'All' },
            { key: 'VERIFIED', label: 'Verified' },
            { key: 'PENDING', label: 'Pending' },
            { key: 'EXPIRING', label: 'Expiring Soon' }
          ].map((f) => {
            const isActive = statusFilter === f.key
            return (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 500,
                  border: `1px solid ${isActive ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
                  background: isActive ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Document List */}
      {isLoading ? (
        <PageSpinner context="documents" />
      ) : filteredDocs.length === 0 ? (
        <Empty
          icon={<FileText size={28} />}
          title="No documents matching your search"
          description="Upload essential documents like Aadhaar, Class 10 Marksheet, and Income Certificate so they can be instantly attached to scholarship applications."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredDocs.map((doc, i) => {
            const isExpired = doc.status === 'EXPIRED' || (doc.expiryDate && new Date(doc.expiryDate).getTime() < Date.now())
            const isExpiringSoon = doc.expiryDate && !isExpired && new Date(doc.expiryDate).getTime() - Date.now() <= 30 * 86400000

            return (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card style={{ padding: '16px 18px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 'var(--radius-md)',
                          background:
                            doc.status === 'VERIFIED'
                              ? 'var(--success-subtle)'
                              : doc.status === 'REJECTED'
                              ? 'var(--error-subtle)'
                              : 'var(--bg-canvas)',
                          border: `1px solid ${
                            doc.status === 'VERIFIED'
                              ? 'var(--success-border)'
                              : doc.status === 'REJECTED'
                              ? 'var(--error-border)'
                              : 'var(--border-subtle)'
                          }`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {SI[doc.status] ?? <FileText size={18} color="var(--text-muted)" />}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                            {doc.label}
                          </p>
                          <StatusBadge status={doc.status} />
                          {doc.isMetadataConfirmed && <Badge variant="success" size="sm">Confirmed</Badge>}
                          {isExpired && <Badge variant="error" size="sm">Expired</Badge>}
                          {isExpiringSoon && !isExpired && <Badge variant="warning" size="sm">Expiring Soon</Badge>}
                        </div>

                        <p className="font-tabular" style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '3px 0 0' }}>
                          {doc.fileName} · {(doc.fileSize / 1024).toFixed(0)} KB · Uploaded {new Date(doc.createdAt).toLocaleDateString('en-IN')}
                        </p>

                        {/* Metadata row: Document ID, Issue Date, Expiry Date */}
                        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 4, fontSize: 11, color: 'var(--text-secondary)' }}>
                          {doc.documentNumber && (
                            <span>
                              <strong style={{ color: 'var(--text-primary)' }}>Cert #:</strong> {doc.documentNumber}
                            </span>
                          )}
                          {doc.issueDate && (
                            <span className="font-tabular">
                              <strong style={{ color: 'var(--text-primary)' }}>Issued:</strong> {doc.issueDate.slice(0, 10)}
                            </span>
                          )}
                          {doc.expiryDate && (
                            <span
                              className="font-tabular"
                              style={{
                                color: isExpired ? 'var(--error)' : isExpiringSoon ? 'var(--warning)' : 'var(--text-secondary)'
                              }}
                            >
                              <strong>Expires:</strong> {doc.expiryDate.slice(0, 10)}
                            </span>
                          )}
                        </div>

                        {doc.rejectionReason && (
                          <div
                            style={{
                              marginTop: 6,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              background: 'var(--error-subtle)',
                              border: '1px solid var(--error-border)',
                              color: 'var(--error)',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: 12,
                              fontWeight: 500
                            }}
                          >
                            <AlertCircle size={12} /> Rejection reason: {doc.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<SlidersHorizontal size={13} />}
                        onClick={() => setEditingMetadataDoc(doc)}
                      >
                        Metadata
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<ExternalLink size={13} />}
                        onClick={() => setViewingDoc({ id: doc.id, title: doc.label })}
                      >
                        Preview
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => checkAndDeleteDoc(doc)}
                        leftIcon={<Trash2 size={13} />}
                        style={{ color: 'var(--error)' }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Document Preview / Stream Modal */}
      {viewingDoc && (
        <DocumentViewerModal
          documentId={viewingDoc.id}
          documentTitle={viewingDoc.title}
          onClose={() => setViewingDoc(null)}
          onDocumentUpdated={refetch}
        />
      )}

      {/* Metadata Inspector Modal */}
      {editingMetadataDoc && (
        <DocumentMetadataModal
          document={editingMetadataDoc}
          onClose={() => setEditingMetadataDoc(null)}
          onUpdated={refetch}
        />
      )}
    </div>
  )
}

export default DocumentsPage
